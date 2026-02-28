import { NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { publishToWorker } from '@/lib/qstash/client'
import { enrichBusiness } from '@/lib/ai/enrich'

async function handler(request: Request) {
  try {
    console.log('[worker/enrich] Handler entered')

    // Parse body — try request.json() first, fall back to text parsing
    let data: Record<string, unknown>
    try {
      data = await request.json()
    } catch (parseErr) {
      console.error('[worker/enrich] request.json() failed:', parseErr instanceof Error ? parseErr.message : parseErr)
      // Try reading as text
      const text = await request.text().catch(() => '')
      console.log('[worker/enrich] Raw body text:', text.substring(0, 200))
      if (text) {
        data = JSON.parse(text)
      } else {
        return NextResponse.json({ error: 'Could not read request body' }, { status: 400 })
      }
    }

    const businessId = data.businessId as string
    console.log('[worker/enrich] businessId:', businessId)

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 })
    }

    console.log(`[worker/enrich] ENV: SUPABASE_URL=${!!process.env.NEXT_PUBLIC_SUPABASE_URL}, SERVICE_KEY=${!!process.env.SUPABASE_SERVICE_ROLE_KEY}, ANTHROPIC=${!!process.env.ANTHROPIC_API_KEY}`)
    console.log(`[worker/enrich] Starting enrichment...`)
    const result = await enrichBusiness(businessId)
    console.log(`[worker/enrich] Enrichment complete, queuing generate-site...`)

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
    console.error('[worker/enrich] CATCH:', message)
    console.error('[worker/enrich] Stack:', stack)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

export const POST = process.env.NODE_ENV === 'development'
  ? handler
  : verifySignatureAppRouter(handler)
