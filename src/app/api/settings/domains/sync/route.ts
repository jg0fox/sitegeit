import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listAccounts, getAccountWarmup } from '@/lib/services/instantly'

/**
 * POST /api/settings/domains/sync
 * Syncs sending domain records with Instantly account data.
 */
export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const accounts = await listAccounts()
    let synced = 0

    for (const account of accounts) {
      // Get warmup details
      let warmup = null
      try {
        warmup = await getAccountWarmup(account.email)
      } catch {
        // Warmup endpoint may fail for some accounts
      }

      const domain = account.email.split('@')[1] || ''
      const warmupStatus = warmup?.warmup_status === 'active' ? 'warming'
        : warmup?.warmup_status === 'completed' ? 'ready'
        : warmup?.warmup_status === 'paused' ? 'paused'
        : 'warming'

      // Upsert by email_address for this user
      const { data: existing } = await supabase
        .from('sending_domains')
        .select('id')
        .eq('user_id', user.id)
        .eq('email_address', account.email)
        .single()

      const record = {
        warmup_status: warmupStatus,
        health_score: warmup?.health_score ?? account.health_score ?? null,
        spf_configured: warmup?.spf ?? false,
        dkim_configured: warmup?.dkim ?? false,
        dmarc_configured: warmup?.dmarc ?? false,
        updated_at: new Date().toISOString(),
      }

      if (existing) {
        await supabase
          .from('sending_domains')
          .update(record)
          .eq('id', existing.id)
      } else {
        await supabase.from('sending_domains').insert({
          user_id: user.id,
          domain,
          email_address: account.email,
          daily_send_limit: account.daily_limit ?? 20,
          ...record,
        })
      }

      synced++
    }

    return NextResponse.json({ synced, total: accounts.length })
  } catch (err) {
    console.error('[domains/sync] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sync failed' },
      { status: 500 }
    )
  }
}
