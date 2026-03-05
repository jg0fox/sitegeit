import { cn } from '@/lib/utils/cn'
import { formatDistanceToNow } from 'date-fns'

interface Activity {
  id: string
  event_type: string
  event_data: Record<string, unknown> | null
  created_at: string
}

const EVENT_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  lead_discovered: { label: 'Lead discovered', icon: 'person_add', color: 'text-gray-500' },
  enrichment_complete: { label: 'Enrichment complete', icon: 'auto_awesome', color: 'text-purple-500' },
  site_generated: { label: 'Site generated', icon: 'check_circle', color: 'text-success' },
  site_updated: { label: 'Site updated', icon: 'update', color: 'text-teal-500' },
  landing_page_generated: { label: 'Landing page generated', icon: 'web', color: 'text-indigo-500' },
  email_drafted: { label: 'Emails drafted', icon: 'edit_note', color: 'text-amber-500' },
  email_approved: { label: 'Email approved', icon: 'check_circle', color: 'text-emerald-500' },
  email_sent: { label: 'Email sent', icon: 'send', color: 'text-primary' },
  email_opened: { label: 'Email opened', icon: 'visibility', color: 'text-blue-500' },
  email_clicked: { label: 'Link clicked', icon: 'ads_click', color: 'text-cyan-500' },
  email_replied: { label: 'Reply received', icon: 'reply', color: 'text-success' },
  email_bounced: { label: 'Email bounced', icon: 'error', color: 'text-red-500' },
  status_changed: { label: 'Status changed', icon: 'swap_horiz', color: 'text-gray-400' },
  note_added: { label: 'Note added', icon: 'sticky_note_2', color: 'text-gray-500' },
  tier_changed: { label: 'Tier changed', icon: 'workspace_premium', color: 'text-amber-500' },
  meeting_scheduled: { label: 'Meeting scheduled', icon: 'event', color: 'text-green-600' },
}

function describeEvent(eventType: string, eventData: Record<string, unknown> | null): string {
  const name = (eventData?.business_name as string) || ''
  const config = EVENT_CONFIG[eventType]
  if (!config) {
    return name ? `${eventType.replace(/_/g, ' ')} — ${name}` : eventType.replace(/_/g, ' ')
  }
  if (!name) return config.label

  switch (eventType) {
    case 'lead_discovered':
      return `${name} added to pipeline`
    case 'enrichment_complete':
      return `Enrichment complete for ${name}`
    case 'site_generated':
      return `Website generated for ${name}`
    case 'site_updated':
      return `Website updated for ${name}`
    case 'landing_page_generated':
      return `Landing page generated for ${name}`
    case 'email_drafted':
      return `Email draft ready for ${name}`
    case 'email_approved':
      return `Email approved for ${name}`
    case 'email_sent':
      return `Outreach email sent to ${name}`
    case 'email_opened':
      return `${name} opened your email`
    case 'email_clicked':
      return `${name} clicked your landing page`
    case 'email_replied':
      return `New reply from ${name}`
    case 'email_bounced':
      return `Email to ${name} bounced`
    case 'status_changed':
      return `${name} status changed`
    case 'note_added':
      return `Note added for ${name}`
    default:
      return `${config.label} — ${name}`
  }
}

export function ActivityTimeline({
  activities,
  showBusinessName = false,
}: {
  activities: Activity[]
  showBusinessName?: boolean
}) {
  if (activities.length === 0) return null

  return (
    <div className="space-y-1">
      {activities.map((activity) => {
        const config = EVENT_CONFIG[activity.event_type] ?? {
          label: activity.event_type.replace(/_/g, ' '),
          icon: 'circle',
          color: 'text-gray-400',
        }
        const label = showBusinessName
          ? describeEvent(activity.event_type, activity.event_data)
          : config.label

        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-md px-2 py-2"
          >
            <span
              className={cn(
                'material-symbols-outlined mt-0.5 text-[16px]',
                config.color
              )}
            >
              {config.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-700">{label}</p>
              <p
                className="mt-0.5 text-xs text-gray-400"
                title={new Date(activity.created_at).toLocaleString()}
              >
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
