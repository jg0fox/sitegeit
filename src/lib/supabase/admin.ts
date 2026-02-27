import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Permissive type until we generate proper Supabase DB types
type DB = any

let adminClient: SupabaseClient<DB> | null = null

export function getAdminClient(): SupabaseClient<DB> {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceRoleKey) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }

    adminClient = createClient<DB>(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return adminClient
}
