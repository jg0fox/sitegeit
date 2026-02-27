import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import { formatDistanceToNow } from 'date-fns'

const ACTIVITY_ICON_MAP: Record<string, { icon: string; color: string }> = {
  site_generated: { icon: 'check_circle', color: 'text-success' },
  email_opened: { icon: 'visibility', color: 'text-blue-500' },
  email_replied: { icon: 'reply', color: 'text-success' },
  email_sent: { icon: 'send', color: 'text-primary' },
  lead_discovered: { icon: 'person_add', color: 'text-gray-500' },
  enrichment_complete: { icon: 'auto_awesome', color: 'text-purple-500' },
  email_drafted: { icon: 'edit_note', color: 'text-amber-500' },
  email_clicked: { icon: 'ads_click', color: 'text-cyan-500' },
}

interface ActivityItem {
  id: string
  type: string
  description: string
  createdAt: Date
}

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: '1',
    type: 'email_replied',
    description: 'New reply from Oakland Auto Repair — wants to schedule a call',
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: '2',
    type: 'site_generated',
    description: "Website generated for Joe's Plumbing — ready for review",
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: '3',
    type: 'email_opened',
    description: 'Sunrise Bakery opened your email (3rd time)',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '4',
    type: 'email_sent',
    description: 'Outreach email sent to Bay Area Dental',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: '5',
    type: 'email_clicked',
    description: 'Fresh Cuts Barber clicked your landing page',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: '6',
    type: 'enrichment_complete',
    description: 'Enrichment complete for 6 new leads in Oakland',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
  {
    id: '7',
    type: 'lead_discovered',
    description: '12 new leads found in "Plumbers in Berkeley" search',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: '8',
    type: 'email_drafted',
    description: 'Email draft ready for Rockridge Yoga Studio',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
  },
]

export function RecentActivity() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-1">
          {MOCK_ACTIVITY.map((item) => {
            const iconConfig = ACTIVITY_ICON_MAP[item.type] ?? {
              icon: 'info',
              color: 'text-gray-400',
            }
            return (
              <button
                key={item.id}
                className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-gray-50"
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
                  <p className="text-sm text-gray-700">{item.description}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
