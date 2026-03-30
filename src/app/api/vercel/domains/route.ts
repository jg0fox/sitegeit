import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listAccountDomains } from '@/lib/vercel/domains'

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'goget.im'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { domains, error } = await listAccountDomains()
  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  // Get domains already assigned to businesses
  const { data: assignedSites } = await supabase
    .from('generated_sites')
    .select('custom_domain')
    .not('custom_domain', 'is', null)

  const assignedDomains = new Set(
    (assignedSites ?? []).map((s) => s.custom_domain).filter(Boolean)
  )

  // Filter out base domain and already-assigned domains
  const available = domains.filter((d) => {
    if (d.name === SITE_DOMAIN) return false
    if (assignedDomains.has(d.name)) return false
    return true
  })

  return NextResponse.json({
    domains: available.map((d) => ({
      name: d.name,
      verified: d.verified,
    })),
  })
}
