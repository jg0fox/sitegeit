import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('full_name, email, avatar_url, email_signature')
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(profile)
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { full_name, avatar_url, email_signature } = body as {
    full_name?: string
    avatar_url?: string
    email_signature?: string
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (full_name !== undefined) update.full_name = full_name
  if (avatar_url !== undefined) update.avatar_url = avatar_url
  if (email_signature !== undefined) update.email_signature = email_signature

  const { data, error } = await supabase
    .from('users')
    .update(update)
    .eq('id', user.id)
    .select('full_name, email, avatar_url, email_signature')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
