import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the custom domain for this business
  const { data: site } = await supabase
    .from('generated_sites')
    .select('custom_domain')
    .eq('business_id', id)
    .not('custom_domain', 'is', null)
    .limit(1)
    .single()

  if (!site?.custom_domain) {
    return NextResponse.json({ resolved: false, error: 'No custom domain set' })
  }

  try {
    // Use DNS-over-HTTPS to check if the domain resolves
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(site.custom_domain)}&type=A`,
      { next: { revalidate: 0 } }
    )
    const data = await res.json()

    // Check if any A record points to Vercel's IP
    const resolved =
      data.Answer?.some(
        (record: { type: number; data: string }) =>
          record.type === 1 && record.data === '76.76.21.21'
      ) ?? false

    return NextResponse.json({ resolved, domain: site.custom_domain })
  } catch {
    return NextResponse.json({ resolved: false, error: 'DNS lookup failed' })
  }
}
