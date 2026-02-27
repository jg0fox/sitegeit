import { NextResponse } from 'next/server'
import { verifyRequest, publishToWorker } from '@/lib/qstash/client'
import { enrichBusiness } from '@/lib/ai/enrich'

export async function POST(request: Request) {
  try {
    const data = await verifyRequest(request)
    const businessId = data.businessId as string

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 })
    }

    console.log(`[worker/enrich] Processing business ${businessId}`)
    const result = await enrichBusiness(businessId)

    // Chain: queue site generation
    const messageId = await publishToWorker('generate-site', { businessId })

    console.log(`[worker/enrich] Done. Queued generate-site (${messageId})`)
    return NextResponse.json({
      success: true,
      businessId,
      voiceArchetype: result.voice_archetype,
      nextMessageId: messageId,
    })
  } catch (err) {
    console.error('[worker/enrich] Error:', err)
    // Return 500 so QStash retries
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
