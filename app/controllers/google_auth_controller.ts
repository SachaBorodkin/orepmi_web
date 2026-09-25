import type { HttpContext } from '@adonisjs/core/http'
import { createClient } from '@supabase/supabase-js'
import env from '#start/env'
import User from '#models/user'
import { randomBytes } from 'node:crypto'

/**
 * GoogleAuthController handles the server-side OAuth 2.0 PKCE flow via Supabase.
 *
 * Flow:
 *   1. redirect() — asks Supabase for an OAuth URL (Google), stores the PKCE
 *      code verifier in the AdonisJS session via a custom storage adapter,
 *      then redirects the browser to Google.
 *   2. callback() — receives `?code=` from Supabase, exchanges it for a
 *      Supabase session, finds or creates the local User row, then logs the
 *      user in with AdonisJS's built-in web session.
 */
export default class GoogleAuthController {

  /**
   * Step 1 — Initiate Google OAuth.
   * Generates the Supabase OAuth URL (which embeds the PKCE challenge),
   * stores the verifier in the session, then redirects the browser to Google.
   */
  async redirect({ response, session }: HttpContext) {
    // We need ctx for the storage adapter, so pass it via closure from the
    // caller — rebuild the client with a temporary session proxy.
    const url = env.get('SUPABASE_URL')
    const key = env.get('SUPABASE_ANON_KEY')

    if (!url || !key) {
      session.flash('error', 'La connexion Google n\'est pas configurée sur ce serveur.')
      return response.redirect().toRoute('session.create')
    }

    const supabase = createClient(url, key, {
      auth: {
        flowType: 'pkce',
        storage: {
          getItem: (k: string) => (session.get(k, null) as string | null),
          setItem: (k: string, v: string) => session.put(k, v),
          removeItem: (k: string) => session.forget(k),
        },
      },
    })

    const appUrl = env.get('APP_URL')
    const callbackUrl = `${appUrl}/auth/google/callback`

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        skipBrowserRedirect: true,
      },
    })

    if (error || !data.url) {
      session.flash('error', 'Impossible d\'initier la connexion Google. Veuillez réessayer.')
      return response.redirect().toRoute('session.create')
    }

    return response.redirect(data.url)
  }

  /**
   * Step 2 — Handle Supabase callback.
   * Exchanges the one-time `code` for a Supabase session, retrieves the
   * user's email and name, then finds or creates a local User row and
   * establishes an AdonisJS web session.
   */
  async callback({ request, response, auth, session }: HttpContext) {
    const url = env.get('SUPABASE_URL')
    const key = env.get('SUPABASE_ANON_KEY')

    if (!url || !key) {
      session.flash('error', 'La connexion Google n\'est pas configurée sur ce serveur.')
      return response.redirect().toRoute('session.create')
    }

    const supabase = createClient(url, key, {
      auth: {
        flowType: 'pkce',
        storage: {
          getItem: (k: string) => (session.get(k, null) as string | null),
          setItem: (k: string, v: string) => session.put(k, v),
          removeItem: (k: string) => session.forget(k),
        },
      },
    })

    const code = request.input('code') as string | undefined

    if (!code) {
      session.flash('error', 'Paramètre de code OAuth manquant. Veuillez réessayer.')
      return response.redirect().toRoute('session.create')
    }

    // Exchange the authorization code for a Supabase session.
    // Supabase will look up the PKCE verifier from our session storage adapter.
    const { data: exchangeData, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError || !exchangeData?.user) {
      session.flash('error', 'Échec de la vérification OAuth. Veuillez réessayer.')
      return response.redirect().toRoute('session.create')
    }

    // Supabase writes its JWT access + refresh tokens into our AdonisJS session
    // via the storage adapter. We only needed the code verifier for the PKCE
    // exchange — we don't want these tokens in the cookie going forward.
    // Leaving them in would push the session over the browser's ~4KB cookie
    // limit and silently drop the AdonisJS auth session.
    const projectRef = new URL(url).hostname.split('.')[0]
    session.forget(`sb-${projectRef}-auth-token`)
    session.forget(`sb-${projectRef}-auth-token-code-verifier`)

    const supabaseUser = exchangeData.user
    const email = supabaseUser.email

    if (!email) {
      session.flash('error', 'Impossible de récupérer l\'adresse email depuis Google.')
      return response.redirect().toRoute('session.create')
    }

    // Extract display name from Google user metadata, fall back to email prefix.
    const name: string =
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      email.split('@')[0]

    // Find or create the local Lucid User row.
    // OAuth users never log in with a password, so we store a random secret.
    let user: User
    try {
      const existing = await User.findBy('email', email)
      if (existing) {
        user = existing
      } else {
        const randomPassword = randomBytes(32).toString('hex')
        user = await User.create({ email, name, password: randomPassword })
      }
    } catch (dbError) {
      // Database is unreachable — most likely the Supabase project is paused
      // (free tier auto-pauses after ~1 week of inactivity). Resume it at
      // https://supabase.com/dashboard → your project → "Resume project".
      // Alternatively, switch DATABASE_URL to the Session Pooler URL in .env.
      console.error('[GoogleAuth] Database error during OAuth user lookup:', dbError)
      session.flash(
        'error',
        'Connexion à la base de données impossible. Veuillez réessayer dans un instant.'
      )
      return response.redirect().toRoute('session.create')
    }

    // Create the AdonisJS web session — from here the rest of the app treats
    // this user exactly the same as an email/password login.
    await auth.use('web').login(user)

    session.flash('success', `Bienvenue, ${user.name || user.email} !`)
    return response.redirect().toRoute('home')
  }
}
