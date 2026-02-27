import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { siteGenerationQueue } from '@/lib/queue/queues'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { businessIds } = await request.json()

    if (!Array.isArray(businessIds) || businessIds.length === 0) {
      return NextResponse.json({ error: 'businessIds must be a non-empty array' }, { status: 400 })
    }

    // Verify all businesses belong to this user and are enriched
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, status')
      .in('id', businessIds)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to verify businesses' }, { status: 500 })
    }

    const validIds = businesses
      ?.filter(b => b.status === 'enriched')
      .map(b => b.id) || []

    if (validIds.length === 0) {
      return NextResponse.json({ error: 'No businesses eligible for site generation' }, { status: 400 })
    }

    // Queue site generation jobs
    const jobs = await Promise.all(
      validIds.map(id =>
        siteGenerationQueue.add('generate-site', { businessId: id }, {
          jobId: `site-gen-${id}`,
        })
      )
    )

    return NextResponse.json({
      queued: validIds.length,
      jobIds: jobs.map(j => j.id),
    })
  } catch (err) {
    console.error('[api/pipeline/generate] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
