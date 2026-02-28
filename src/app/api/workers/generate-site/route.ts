import { NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { publishToWorker } from '@/lib/qstash/client'
import { generateSite } from '@/lib/ai/generate-site'

async function handler(request: Request) {
  try {
    const data = await request.json()
    const businessId = data.businessId as string

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 })
    }

    console.log(`[worker/generate-site] Processing business ${businessId}`)
    const { siteId, content } = await generateSite(businessId)

    // Chain: queue deployment
    const messageId = await publishToWorker('deploy', { businessId, siteId })

    console.log(`[worker/generate-site] Done. Site ${siteId}, queued deploy (${messageId})`)
    return NextResponse.json({
      success: true,
      businessId,
      siteId,
      servicePages: content.service_pages.length,
      nextMessageId: messageId,
    })
  } catch (err) {
    console.error('[worker/generate-site] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export const POST = process.env.NODE_ENV === 'development'
  ? handler
  : verifySignatureAppRouter(handler)
