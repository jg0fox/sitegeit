import { NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { publishToWorker } from '@/lib/qstash/client'
import { enrichBusiness } from '@/lib/ai/enrich'

async function handler(request: Request) {
  try {
    console.log('[worker/enrich] Handler entered, parsing body...')
    const data = await request.json()
    const businessId = data.businessId as string
    console.log('[worker/enrich] Body parsed, businessId:', businessId)

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 })
    }

    console.log(`[worker/enrich] Starting enrichment for ${businessId}`)
    console.log(`[worker/enrich] ENV check: SUPABASE_URL=${!!process.env.NEXT_PUBLIC_SUPABASE_URL}, SERVICE_KEY=${!!process.env.SUPABASE_SERVICE_ROLE_KEY}, ANTHROPIC=${!!process.env.ANTHROPIC_API_KEY}`)
    const result = await enrichBusiness(businessId)
    console.log(`[worker/enrich] Enrichment complete, queuing generate-site...`)

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
    const message = err instanceof Error ? err.message : 'Unknown error'
    const stack = err instanceof Error ? err.stack : undefined
    console.error('[worker/enrich] Error:', message, '\nStack:', stack)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

export const POST = process.env.NODE_ENV === 'development'
  ? handler
  : verifySignatureAppRouter(handler)
