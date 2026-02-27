import { NextResponse } from 'next/server'
import { verifyRequest, publishToWorker } from '@/lib/qstash/client'
import { getAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const data = await verifyRequest(request)
    const businessId = data.businessId as string
    const siteId = data.siteId as string

    if (!businessId || !siteId) {
      return NextResponse.json({ error: 'Missing businessId or siteId' }, { status: 400 })
    }

    console.log(`[worker/deploy] Processing site ${siteId} for business ${businessId}`)

    const supabase = getAdminClient()

    // For MVP, "deployment" means marking the site as live
    // since all sites are rendered dynamically via subdomain routing
    const { data: site, error: fetchError } = await supabase
      .from('generated_sites')
      .select('deploy_url')
      .eq('id', siteId)
      .single()

    if (fetchError || !site) {
      throw new Error(`Failed to fetch site ${siteId}: ${fetchError?.message}`)
    }

    await supabase
      .from('generated_sites')
      .update({ deploy_status: 'live' })
      .eq('id', siteId)

    // Chain: queue email generation
    const messageId = await publishToWorker('generate-email', { businessId, siteId })

    console.log(`[worker/deploy] Site live at ${site.deploy_url}, queued generate-email (${messageId})`)
    return NextResponse.json({
      success: true,
      businessId,
      siteId,
      deployUrl: site.deploy_url,
      nextMessageId: messageId,
    })
  } catch (err) {
    console.error('[worker/deploy] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
