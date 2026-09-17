import { createClient, SupabaseClient } from '@supabase/supabase-js'
import env from '#start/env'

let supabaseClient: SupabaseClient | null = null
let supabaseAdminClient: SupabaseClient | null = null

/**
 * Returns a configured Supabase client instance (using anon key).
 * Throws an error if SUPABASE_URL or SUPABASE_ANON_KEY are not configured in .env
 */
export function getSupabase(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient
  }

  const url = env.get('SUPABASE_URL')
  const key = env.get('SUPABASE_ANON_KEY')

  if (!url || !key) {
    throw new Error(
      'Missing Supabase credentials: Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file'
    )
  }

  supabaseClient = createClient(url, key)
  return supabaseClient
}

/**
 * Returns an admin Supabase client instance using the service role key (bypasses Row Level Security).
 * Keep this server-side only and never expose the service role key to clients!
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminClient) {
    return supabaseAdminClient
  }

  const url = env.get('SUPABASE_URL')
  const serviceRoleKey = env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase Admin credentials: Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file'
    )
  }

  supabaseAdminClient = createClient(url, serviceRoleKey)
  return supabaseAdminClient
}

const supabase = {
  get client() {
    return getSupabase()
  },
  get admin() {
    return getSupabaseAdmin()
  },
}

export default supabase

