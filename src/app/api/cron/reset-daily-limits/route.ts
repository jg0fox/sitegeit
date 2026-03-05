import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/cron/reset-daily-limits
 * Vercel Cron job that runs daily at 6:00 AM UTC.
 * Resets emails_sent_today to 0 for all sending domains.
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getAdminClient()

    // Reset all domain counters
    const { data, error } = await supabase
      .from('sending_domains')
      .update({ emails_sent_today: 0 })
      .gt('emails_sent_today', 0)
      .select('id')

    if (error) {
      throw new Error(`Failed to reset counters: ${error.message}`)
    }

    const resetCount = data?.length ?? 0
    console.log(`[cron/reset-daily-limits] Reset ${resetCount} domain counters`)

    return NextResponse.json({ success: true, domainsReset: resetCount })
  } catch (err) {
    console.error('[cron/reset-daily-limits] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
