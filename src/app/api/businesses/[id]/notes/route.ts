import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify business ownership
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: notes, error } = await supabase
    .from('notes')
    .select('id, content, created_at')
    .eq('business_id', id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(notes)
}

export async function POST(request: Request, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const content = body.content?.trim()

  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  // Verify business ownership
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: note, error } = await supabase
    .from('notes')
    .insert({
      business_id: id,
      user_id: user.id,
      content,
    })
    .select('id, content, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log activity
  await supabase.from('activity_log').insert({
    business_id: id,
    user_id: user.id,
    event_type: 'note_added',
    event_data: { business_name: business.name, note_id: note.id },
  })

  return NextResponse.json(note, { status: 201 })
}
