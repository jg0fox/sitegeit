import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { publishToWorker } from '@/lib/qstash/client'

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Queue regeneration via QStash
  try {
    const messageId = await publishToWorker('generate-site', { businessId: id })

    // Log activity
    await supabase.from('activity_log').insert({
      business_id: id,
      user_id: user.id,
      event_type: 'site_updated',
      event_data: { action: 'regeneration_queued', business_name: business.name },
    })

    return NextResponse.json({ success: true, messageId })
  } catch (err) {
    console.error(`[regenerate/${id}] Failed to queue:`, err)
    return NextResponse.json({ error: 'Failed to queue regeneration' }, { status: 500 })
  }
}
