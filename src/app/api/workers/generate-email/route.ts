import { NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { generateLandingPage } from '@/lib/ai/generate-landing'
import { generateEmail } from '@/lib/ai/generate-email'
import { getAdminClient } from '@/lib/supabase/admin'

async function handler(request: Request) {
  try {
    const data = await request.json()
    const businessId = data.businessId as string
    const siteId = data.siteId as string

    if (!businessId || !siteId) {
      return NextResponse.json({ error: 'Missing businessId or siteId' }, { status: 400 })
    }

    console.log(`[worker/generate-email] Processing business ${businessId}`)

    // Step 1: Generate landing page
    const { landingPageId } = await generateLandingPage(businessId, siteId)
    console.log(`[worker/generate-email] Landing page ${landingPageId} created`)

    // Step 2: Generate email drafts
    const { emailIds } = await generateEmail(businessId, landingPageId)
    console.log(`[worker/generate-email] ${emailIds.length} email drafts created`)

    // Create notification for the user
    const supabase = getAdminClient()
    const { data: business } = await supabase
      .from('businesses')
      .select('user_id, name')
      .eq('id', businessId)
      .single()

    if (business?.user_id) {
      await supabase.from('notifications').insert({
        user_id: business.user_id,
        type: 'pipeline',
        title: 'Pipeline complete',
        body: `${business.name} is ready for review. Website generated, email draft ready.`,
        business_id: businessId,
        href: `/pipeline/${businessId}`,
      })
    }

    console.log(`[worker/generate-email] Pipeline complete for business ${businessId}`)
    return NextResponse.json({
      success: true,
      businessId,
      landingPageId,
      emailIds,
    })
  } catch (err) {
    console.error('[worker/generate-email] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export const POST = process.env.NODE_ENV === 'development'
  ? handler
  : verifySignatureAppRouter(handler)
