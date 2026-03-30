import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { removeDomainFromProject } from '@/lib/vercel/domains'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ids, status, tier, monthly_rate } = body as {
      ids: string[]
      status: string
      tier?: string
      monthly_rate?: number
    }

    if (!ids || ids.length === 0) {
      return NextResponse.json({ error: 'No business IDs provided' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }

    // For conversions, include tier and rate
    if (status === 'active' && tier) {
      updates.tier = tier
      updates.monthly_rate = monthly_rate ?? 0
      updates.converted_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('businesses')
      .update(updates)
      .in('id', ids)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log activity for each business
    const activityRows = ids.map((id) => ({
      business_id: id,
      user_id: user.id,
      event_type: status === 'active' ? 'status_changed' : 'status_changed',
      event_data: {
        new_status: status,
        bulk_action: true,
        ...(tier ? { tier, monthly_rate } : {}),
      },
    }))

    await supabase.from('activity_log').insert(activityRows)

    // If converting, also log tier changes
    if (status === 'active' && tier) {
      const tierRows = ids.map((id) => ({
        business_id: id,
        user_id: user.id,
        event_type: 'tier_changed',
        event_data: { tier, monthly_rate, bulk_action: true },
      }))
      await supabase.from('activity_log').insert(tierRows)
    }

    return NextResponse.json({ success: true, count: ids.length })
  } catch (err) {
    console.error('[api/businesses/bulk] PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ids } = body as { ids: string[] }

    if (!ids || ids.length === 0) {
      return NextResponse.json({ error: 'No business IDs provided' }, { status: 400 })
    }

    // Remove any custom domains from Vercel before deleting
    const { data: sites } = await supabase
      .from('generated_sites')
      .select('custom_domain')
      .in('business_id', ids)
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
      .in('id', ids)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: ids.length })
  } catch (err) {
    console.error('[api/businesses/bulk] DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
