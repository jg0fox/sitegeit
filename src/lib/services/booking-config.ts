import { createClient } from '@supabase/supabase-js'

/** Fetch active booking config for a business. Returns booking_slug if active, null otherwise. */
export async function getBookingSlug(businessId: string): Promise<string | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data } = await supabase
    .from('client_scheduling_config')
    .select('booking_slug')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .single()

  return data?.booking_slug ?? null
}
