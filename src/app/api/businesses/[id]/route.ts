import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { removeDomainFromProject } from '@/lib/vercel/domains'

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
      'name', 'phone', 'email', 'contact_email', 'owner_name',
      'address_street', 'address_city', 'address_state', 'address_zip',
      'status', 'tier', 'monthly_rate', 'converted_at',
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

      // Auto-populate contact_email on conversion if not already set
      if (updates.status === 'converted' || updates.status === 'active') {
        if (!business.contact_email && business.email) {
          await supabase
            .from('businesses')
            .update({ contact_email: business.email })
            .eq('id', id)
        }
      }
    }

    // Log tier changes
    if ('tier' in updates) {
      await supabase.from('activity_log').insert({
        business_id: id,
        user_id: user.id,
        event_type: 'tier_changed',
        event_data: { tier: updates.tier, monthly_rate: updates.monthly_rate },
      })
    }

    return NextResponse.json(business)
  } catch (err) {
    console.error('[api/businesses/[id]] PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Remove any custom domains from Vercel before deleting
    const { data: sites } = await supabase
      .from('generated_sites')
      .select('custom_domain')
      .eq('business_id', id)
      .not('custom_domain', 'is', null)

    if (sites?.length) {
      await Promise.all(
        sites.map((s) => removeDomainFromProject(s.custom_domain!))
      )
    }

    // RLS ensures user can only delete their own businesses.
    // Cascade deletes handle generated_sites, landing_pages, outreach_emails, activity_log, notes.
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete business' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/businesses/[id]] DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
