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
      .eq('saved', true)
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
    const { region, category, radius_km, filters, result_count, results, saved } = body

    const { data, error } = await supabase
      .from('search_queries')
      .insert({
        user_id: user.id,
        region,
        category,
        radius_km,
        filters,
        result_count,
        results: results || null,
        saved: saved || false,
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

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, saved, results } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing search id' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if (typeof saved === 'boolean') updates.saved = saved
    if (results !== undefined) updates.results = results

    const { data, error } = await supabase
      .from('search_queries')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ search: data })
  } catch (err) {
    console.error('Saved searches PATCH error:', err)
    return NextResponse.json(
      { error: 'Failed to update search' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing search id' }, { status: 400 })
    }

    const { error } = await supabase
      .from('search_queries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Saved searches DELETE error:', err)
    return NextResponse.json(
      { error: 'Failed to delete search' },
      { status: 500 }
    )
  }
}
