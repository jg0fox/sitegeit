import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/server'

const ACTIVITY_ICON_MAP: Record<string, { icon: string; color: string }> = {
  site_generated: { icon: 'check_circle', color: 'text-success' },
  email_opened: { icon: 'visibility', color: 'text-blue-500' },
  email_replied: { icon: 'reply', color: 'text-success' },
  email_sent: { icon: 'send', color: 'text-primary' },
  lead_discovered: { icon: 'person_add', color: 'text-gray-500' },
  enrichment_complete: { icon: 'auto_awesome', color: 'text-purple-500' },
  email_drafted: { icon: 'edit_note', color: 'text-amber-500' },
  email_clicked: { icon: 'ads_click', color: 'text-cyan-500' },
  landing_page_generated: { icon: 'web', color: 'text-indigo-500' },
  site_updated: { icon: 'update', color: 'text-teal-500' },
  status_changed: { icon: 'swap_horiz', color: 'text-gray-400' },
}

function describeEvent(eventType: string, eventData: Record<string, unknown> | null): string {
  const name = (eventData?.business_name as string) || 'a business'
  switch (eventType) {
    case 'lead_discovered':
      return `${name} added to pipeline`
    case 'enrichment_complete':
      return `Enrichment complete for ${name}`
    case 'site_generated':
      return `Website generated for ${name}`
    case 'landing_page_generated':
      return `Landing page generated for ${name}`
    case 'email_drafted':
      return `Email draft ready for ${name}`
    case 'email_sent':
      return `Outreach email sent to ${name}`
    case 'email_opened':
      return `${name} opened your email`
    case 'email_clicked':
      return `${name} clicked your landing page`
    case 'email_replied':
      return `New reply from ${name}`
    default:
      return `${eventType.replace(/_/g, ' ')} — ${name}`
  }
}

export async function RecentActivity() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: activities } = await supabase
    .from('activity_log')
    .select('id, event_type, event_data, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!activities || activities.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="material-symbols-outlined mb-2 text-[32px] text-gray-300">
              history
            </span>
            <p className="text-sm text-gray-500">No activity yet</p>
            <p className="mt-1 text-xs text-gray-400">
              Activity will appear here as you use the pipeline.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-1">
          {activities.map((item) => {
            const iconConfig = ACTIVITY_ICON_MAP[item.event_type] ?? {
              icon: 'info',
              color: 'text-gray-400',
            }
            return (
              <div
                key={item.id}
                className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left"
              >
                <span
                  className={cn(
                    'material-symbols-outlined mt-0.5 text-[18px]',
                    iconConfig.color
                  )}
                >
                  {iconConfig.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700">
                    {describeEvent(item.event_type, item.event_data as Record<string, unknown> | null)}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
