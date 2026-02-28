'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils/cn'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

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
  pipeline: 'pipeline',
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
  pipeline: { icon: 'check_circle', color: 'text-success' },
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
  href: string | null
  read: boolean
  created_at: string
}

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
    const d = new Date(item.created_at)
    if (d >= today) groups[0].items.push(item)
    else if (d >= yesterday) groups[1].items.push(item)
    else if (d >= weekAgo) groups[2].items.push(item)
    else groups[3].items.push(item)
  })

  return groups.filter((g) => g.items.length > 0)
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notifications')
      .select('id, type, title, body, href, read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      setNotifications(data)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  async function markAllRead() {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  async function markRead(id: string) {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const filtered =
    activeTab === 'all'
      ? notifications
      : notifications.filter(
          (n) => NOTIFICATION_CATEGORY_MAP[n.type] === activeTab
        )

  const groups = groupByDate(filtered)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Stay on top of pipeline events, email engagement, and system alerts.
        </p>
        {notifications.some((n) => !n.read) && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            Mark all read
          </Button>
        )}
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
      {loading ? (
        <Card className="px-6 py-12 text-center">
          <p className="text-sm text-gray-500">Loading notifications...</p>
        </Card>
      ) : groups.length === 0 ? (
        <Card className="px-6 py-12 text-center">
          <span className="material-symbols-outlined mb-2 text-4xl text-gray-300">
            notifications_off
          </span>
          <p className="text-sm text-gray-500">
            {activeTab === 'all'
              ? 'No notifications yet.'
              : 'No notifications in this category.'}
          </p>
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

                  const inner = (
                    <div
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
                          {formatDistanceToNow(new Date(item.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {!item.read && (
                        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                  )

                  if (item.href) {
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => markRead(item.id)}
                      >
                        {inner}
                      </Link>
                    )
                  }

                  return (
                    <button
                      key={item.id}
                      className="w-full"
                      onClick={() => markRead(item.id)}
                    >
                      {inner}
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
