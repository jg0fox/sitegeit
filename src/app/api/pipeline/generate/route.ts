import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { publishToWorker } from '@/lib/qstash/client'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { businessIds, regenerate } = await request.json()

    if (!Array.isArray(businessIds) || businessIds.length === 0) {
      return NextResponse.json({ error: 'businessIds must be a non-empty array' }, { status: 400 })
    }

    // Verify all businesses belong to this user
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, status')
      .in('id', businessIds)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to verify businesses' }, { status: 500 })
    }

    // For regeneration, allow any status past enrichment; otherwise only 'enriched'
    const REGENERATE_STATUSES = ['enriched', 'generating', 'review_ready', 'sent', 'opened', 'clicked', 'responded', 'meeting_scheduled', 'closed_won', 'active']
    const allowedStatuses = regenerate ? REGENERATE_STATUSES : ['enriched']

    const validIds = businesses
      ?.filter(b => allowedStatuses.includes(b.status))
      .map(b => b.id) || []

    if (validIds.length === 0) {
      return NextResponse.json({ error: 'No businesses eligible for site generation' }, { status: 400 })
    }

    // Queue site generation jobs via QStash
    const messageIds = await Promise.all(
      validIds.map(id => publishToWorker('generate-site', { businessId: id }))
    )

    return NextResponse.json({
      queued: validIds.length,
      messageIds,
    })
  } catch (err) {
    console.error('[api/pipeline/generate] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
