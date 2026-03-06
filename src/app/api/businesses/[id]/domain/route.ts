import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addDomainToProject, removeDomainFromProject } from '@/lib/vercel/domains'

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const domain = (body.domain as string)
    ?.trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '')

  if (!domain || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)) {
    return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 })
  }

  // Verify ownership
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, tier')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (business.tier === 'starter') {
    return NextResponse.json({ error: 'Custom domains require Growth tier or higher' }, { status: 400 })
  }

  // Check domain isn't already assigned to another business
  const { data: existing } = await supabase
    .from('generated_sites')
    .select('business_id')
    .eq('custom_domain', domain)
    .neq('business_id', id)
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: 'This domain is already assigned to another site' }, { status: 409 })
  }

  // Add domain to Vercel project
  const vercelResult = await addDomainToProject(domain)
  if (!vercelResult.success) {
    console.error(`[domain/${id}] Vercel add failed:`, vercelResult.error)
    // Continue anyway — domain can be added to Vercel manually
  }

  // Update generated_sites
  const { error } = await supabase
    .from('generated_sites')
    .update({ custom_domain: domain })
    .eq('business_id', id)
    .eq('deploy_status', 'live')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log activity
  await supabase.from('activity_log').insert({
    business_id: id,
    user_id: user.id,
    event_type: 'site_updated',
    event_data: { action: 'custom_domain_added', domain, business_name: business.name },
  })

  return NextResponse.json({ success: true, domain, vercel: vercelResult.success })
}

export async function DELETE(_request: Request, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get current domain
  const { data: site } = await supabase
    .from('generated_sites')
    .select('custom_domain')
    .eq('business_id', id)
    .not('custom_domain', 'is', null)
    .limit(1)
    .single()

  if (!site?.custom_domain) {
    return NextResponse.json({ error: 'No domain to remove' }, { status: 400 })
  }

  // Remove from Vercel
  const vercelResult = await removeDomainFromProject(site.custom_domain)
  if (!vercelResult.success) {
    console.error(`[domain/${id}] Vercel remove failed:`, vercelResult.error)
  }

  // Clear from generated_sites
  await supabase
    .from('generated_sites')
    .update({ custom_domain: null })
    .eq('business_id', id)

  // Log activity
  await supabase.from('activity_log').insert({
    business_id: id,
    user_id: user.id,
    event_type: 'site_updated',
    event_data: { action: 'custom_domain_removed', domain: site.custom_domain },
  })

  return NextResponse.json({ success: true })
}
