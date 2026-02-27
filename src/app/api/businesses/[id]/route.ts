import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const { data: business, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json(business)
  } catch (err) {
    console.error('[api/businesses/[id]] GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    // Only allow updating specific fields
    const allowedFields = [
      'name', 'phone', 'email', 'owner_name',
      'status', 'tier', 'monthly_rate',
    ]
    const updates: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (key in body) {
        updates[key] = body[key]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const { data: business, error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !business) {
      return NextResponse.json({ error: 'Failed to update business' }, { status: 500 })
    }

    // Log status changes
    if ('status' in updates) {
      await supabase.from('activity_log').insert({
        business_id: id,
        user_id: user.id,
        event_type: 'status_changed',
        event_data: { new_status: updates.status },
      })
    }

    return NextResponse.json(business)
  } catch (err) {
    console.error('[api/businesses/[id]] PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
