import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_PREFERENCES = [
  { event_type: 'email_drafted', enabled: true, delivery_method: 'push' },
  { event_type: 'site_generated', enabled: true, delivery_method: 'push' },
  { event_type: 'email_opened', enabled: true, delivery_method: 'push' },
  { event_type: 'email_clicked', enabled: true, delivery_method: 'push' },
  { event_type: 'email_replied', enabled: true, delivery_method: 'both' },
  { event_type: 'email_bounced', enabled: true, delivery_method: 'email' },
  { event_type: 'system_error', enabled: true, delivery_method: 'both' },
]

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: preferences } = await supabase
    .from('notification_preferences')
    .select('event_type, enabled, delivery_method')
    .eq('user_id', user.id)

  const { data: profile } = await supabase
    .from('users')
    .select('daily_digest_enabled, daily_digest_time')
    .eq('id', user.id)
    .single()

  // Merge saved preferences with defaults
  const merged = DEFAULT_PREFERENCES.map((d) => {
    const saved = preferences?.find((p) => p.event_type === d.event_type)
    return saved || d
  })

  return NextResponse.json({
    preferences: merged,
    daily_digest: {
      enabled: profile?.daily_digest_enabled ?? false,
      time: profile?.daily_digest_time ?? '18:00',
    },
  })
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
  const { preferences, daily_digest } = body as {
    preferences?: { event_type: string; enabled: boolean; delivery_method: string }[]
    daily_digest?: { enabled: boolean; time: string }
  }

  if (preferences) {
    // Upsert each preference
    for (const pref of preferences) {
      await supabase
        .from('notification_preferences')
        .upsert(
          {
            user_id: user.id,
            event_type: pref.event_type,
            enabled: pref.enabled,
            delivery_method: pref.delivery_method,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,event_type' }
        )
    }
  }

  if (daily_digest) {
    await supabase
      .from('users')
      .update({
        daily_digest_enabled: daily_digest.enabled,
        daily_digest_time: daily_digest.time,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
  }

  return NextResponse.json({ success: true })
}
