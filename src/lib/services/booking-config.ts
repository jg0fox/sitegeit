import { createClient } from '@supabase/supabase-js'

/** Fetch active booking config for a business. Returns booking_slug if active (demo or configured), null otherwise. */
export async function getBookingSlug(businessId: string): Promise<string | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data } = await supabase
    .from('client_scheduling_config')
    .select('booking_slug, mode, is_active')
    .eq('business_id', businessId)
    .single()

  if (!data) return null

  // Both demo and configured modes return a slug when active
  if (data.mode === 'demo' || data.mode === 'configured') {
    if (data.is_active && data.booking_slug) {
      return data.booking_slug
    }
  }

  return null
}
