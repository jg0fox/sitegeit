import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('users')
    .select('prompt_overrides')
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data?.prompt_overrides || {})
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Only allow known prompt keys
  const allowedKeys = ['enrichment', 'site_generation', 'email', 'landing_page']
  const overrides: Record<string, string | null> = {}
  for (const key of allowedKeys) {
    if (body[key] !== undefined) {
      // Empty string means reset to default (store null)
      overrides[key] = body[key]?.trim() || null
    }
  }

  const { data, error } = await supabase
    .from('users')
    .update({
      prompt_overrides: overrides,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select('prompt_overrides')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data?.prompt_overrides || {})
}
