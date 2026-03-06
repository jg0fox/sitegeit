import { getAdminClient } from '@/lib/supabase/admin'
import { addDomainToProject } from '@/lib/vercel/domains'

/**
 * For MVP, "deployment" is a no-op since all sites are rendered
 * dynamically via subdomain routing in the same Next.js app.
 * The deploy_url is set during site generation.
 */

export async function deploySite(siteId: string): Promise<{
  deployUrl: string
  status: 'live' | 'failed'
}> {
  const supabase = getAdminClient()

  const { data: site, error } = await supabase
    .from('generated_sites')
    .select('deploy_url')
    .eq('id', siteId)
    .single()

  if (error || !site) {
    throw new Error(`Failed to fetch site ${siteId}: ${error?.message}`)
  }

  // Mark as live — the site is served dynamically via middleware
  await supabase
    .from('generated_sites')
    .update({ deploy_status: 'live' })
    .eq('id', siteId)

  return {
    deployUrl: site.deploy_url,
    status: 'live',
  }
}

export async function configureCustomDomain(
  siteId: string,
  domain: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getAdminClient()

  // Add domain to Vercel project
  const result = await addDomainToProject(domain)
  if (!result.success) {
    console.error(`[vercel-deploy] Failed to add domain ${domain}:`, result.error)
  }

  // Update generated_sites record
  const { error } = await supabase
    .from('generated_sites')
    .update({ custom_domain: domain })
    .eq('id', siteId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Log activity
  const { data: site } = await supabase
    .from('generated_sites')
    .select('business_id')
    .eq('id', siteId)
    .single()

  if (site?.business_id) {
    await supabase.from('activity_log').insert({
      business_id: site.business_id,
      event_type: 'site_updated',
      event_data: { action: 'custom_domain_added', domain },
    })
  }

  return { success: true }
}

export async function getDeployStatus(siteId: string): Promise<string> {
  const supabase = getAdminClient()

  const { data: site } = await supabase
    .from('generated_sites')
    .select('deploy_status')
    .eq('id', siteId)
    .single()

  return site?.deploy_status || 'pending'
}
