import { getAdminClient } from '@/lib/supabase/admin'

/**
 * For MVP, "deployment" is a no-op since all sites are rendered
 * dynamically via subdomain routing in the same Next.js app.
 * The deploy_url is set during site generation.
 *
 * In the future, this will use the Vercel API to configure
 * custom domain aliases for client subdomains.
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

export async function getDeployStatus(siteId: string): Promise<string> {
  const supabase = getAdminClient()

  const { data: site } = await supabase
    .from('generated_sites')
    .select('deploy_status')
    .eq('id', siteId)
    .single()

  return site?.deploy_status || 'pending'
}
