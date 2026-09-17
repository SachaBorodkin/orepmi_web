import User from '#models/user'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * SessionController handles user authentication and session management.
 */
export default class SessionController {
  /**
   * Display the login page
   */
  async create({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }

  /**
   * Authenticate user credentials and create a new session
   */
  async store({ request, auth, response, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)
      return response.redirect().toRoute('home')
    } catch {
      session.flash('error', 'Identifiants invalides. Veuillez vérifier votre adresse email et mot de passe.')
      return response.redirect().back()
    }
  }

  /**
   * Log out the current user and destroy their session
   */
  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('home')
  }
}
