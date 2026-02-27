import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('search_queries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ searches: data })
  } catch (err) {
    console.error('Saved searches GET error:', err)
    return NextResponse.json(
      { error: 'Failed to load saved searches' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { region, category, radius_km, filters, result_count } = body

    const { data, error } = await supabase
      .from('search_queries')
      .insert({
        user_id: user.id,
        region,
        category,
        radius_km,
        filters,
        result_count,
        last_run_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ search: data })
  } catch (err) {
    console.error('Saved searches POST error:', err)
    return NextResponse.json(
      { error: 'Failed to save search' },
      { status: 500 }
    )
  }
}
