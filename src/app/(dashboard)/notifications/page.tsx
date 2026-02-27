'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'

type FilterTab = 'all' | 'emails' | 'pipeline' | 'system'

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'emails', label: 'Emails' },
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'system', label: 'System' },
]

const NOTIFICATION_CATEGORY_MAP: Record<string, FilterTab> = {
  email_opened: 'emails',
  email_clicked: 'emails',
  email_replied: 'emails',
  email_bounced: 'emails',
  email_drafted: 'emails',
  email_sent: 'emails',
  site_generated: 'pipeline',
  lead_imported: 'pipeline',
  enrichment_complete: 'pipeline',
  campaign_launched: 'emails',
  system_alert: 'system',
}

const ICON_MAP: Record<string, { icon: string; color: string }> = {
  email_replied: { icon: 'reply', color: 'text-success' },
  email_opened: { icon: 'visibility', color: 'text-blue-500' },
  email_clicked: { icon: 'ads_click', color: 'text-cyan-500' },
  email_bounced: { icon: 'warning', color: 'text-error' },
  email_drafted: { icon: 'edit_note', color: 'text-amber-500' },
  site_generated: { icon: 'check_circle', color: 'text-success' },
  lead_imported: { icon: 'person_add', color: 'text-gray-500' },
  campaign_launched: { icon: 'rocket_launch', color: 'text-primary' },
  system_alert: { icon: 'error', color: 'text-error' },
}

interface NotificationItem {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  createdAt: Date
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: '1', type: 'email_replied', title: 'New reply from Oakland Auto Repair', body: 'They want to schedule a meeting this week', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 15) },
  { id: '2', type: 'site_generated', title: "Website ready for Joe's Plumbing", body: 'Review the generated site and approve the email draft', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: '3', type: 'email_opened', title: 'Sunrise Bakery opened your email', body: '3rd open — this looks like a warm lead', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) },
  { id: '4', type: 'email_drafted', title: 'Email draft ready for Bay Area Dental', body: 'Review and approve to send', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  { id: '5', type: 'email_clicked', title: 'Fresh Cuts Barber clicked your landing page', body: 'High intent signal — consider following up', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26) },
  { id: '6', type: 'lead_imported', title: '12 new leads imported', body: 'From "Plumbers in Berkeley" search', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48) },
  { id: '7', type: 'campaign_launched', title: 'Batch of 8 emails sent', body: 'Delivery tracking will update as recipients open', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72) },
  { id: '8', type: 'system_alert', title: 'Instantly.ai domain health dropped below 80', body: 'Consider pausing sends on outreach@sitegeit.com', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96) },
]

function groupByDate(items: NotificationItem[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 7 * 86400000)

  const groups: { label: string; items: NotificationItem[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'This week', items: [] },
    { label: 'Earlier', items: [] },
  ]

  items.forEach((item) => {
    if (item.createdAt >= today) groups[0].items.push(item)
    else if (item.createdAt >= yesterday) groups[1].items.push(item)
    else if (item.createdAt >= weekAgo) groups[2].items.push(item)
    else groups[3].items.push(item)
  })

  return groups.filter((g) => g.items.length > 0)
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  const filtered =
    activeTab === 'all'
      ? MOCK_NOTIFICATIONS
      : MOCK_NOTIFICATIONS.filter(
          (n) => NOTIFICATION_CATEGORY_MAP[n.type] === activeTab
        )

  const groups = groupByDate(filtered)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Stay on top of pipeline events, email engagement, and system alerts.
        </p>
        <Button variant="ghost" size="sm">
          Mark all read
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification groups */}
      {groups.length === 0 ? (
        <Card className="px-6 py-12 text-center">
          <span className="material-symbols-outlined mb-2 text-4xl text-gray-300">
            notifications_off
          </span>
          <p className="text-sm text-gray-500">No notifications in this category.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {group.label}
              </h3>
              <Card className="divide-y divide-gray-100">
                {group.items.map((item) => {
                  const iconConfig = ICON_MAP[item.type] ?? {
                    icon: 'info',
                    color: 'text-gray-400',
                  }
                  return (
                    <button
                      key={item.id}
                      className={cn(
                        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50',
                        !item.read && 'bg-primary-light/20'
                      )}
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
                        <p
                          className={cn(
                            'text-sm',
                            item.read
                              ? 'text-gray-600'
                              : 'font-medium text-gray-900'
                          )}
                        >
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {item.body}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {formatDistanceToNow(item.createdAt, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {!item.read && (
                        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                      )}
                    </button>
                  )
                })}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
