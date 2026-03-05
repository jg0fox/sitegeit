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

  const { data: domains, error } = await supabase
    .from('sending_domains')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(domains)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { domain, email_address, daily_send_limit } = body as {
    domain: string
    email_address: string
    daily_send_limit?: number
  }

  if (!domain || !email_address) {
    return NextResponse.json({ error: 'domain and email_address are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('sending_domains')
    .insert({
      user_id: user.id,
      domain,
      email_address,
      daily_send_limit: daily_send_limit ?? 20,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
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
  const { id, daily_send_limit, warmup_status } = body as {
    id: string
    daily_send_limit?: number
    warmup_status?: string
  }

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (daily_send_limit !== undefined) update.daily_send_limit = daily_send_limit
  if (warmup_status !== undefined) update.warmup_status = warmup_status

  const { data, error } = await supabase
    .from('sending_domains')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
