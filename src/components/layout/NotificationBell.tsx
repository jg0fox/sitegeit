'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { formatDistanceToNow } from 'date-fns'

const NOTIFICATION_ICON_MAP: Record<string, string> = {
  email_opened: 'visibility',
  email_clicked: 'ads_click',
  email_replied: 'reply',
  email_bounced: 'warning',
  site_generated: 'check_circle',
  email_drafted: 'edit_note',
  campaign_launched: 'rocket_launch',
  system_alert: 'error',
  lead_imported: 'person_add',
}

interface MockNotification {
  id: string
  type: string
  title: string
  body: string
  href: string
  read: boolean
  createdAt: Date
}

const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: '1',
    type: 'email_replied',
    title: 'New reply from Oakland Auto Repair',
    body: 'They want to schedule a meeting this week',
    href: '/pipeline',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: '2',
    type: 'site_generated',
    title: "Website ready for Joe's Plumbing",
    body: 'Review the generated site and approve the email draft',
    href: '/pipeline',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '3',
    type: 'email_opened',
    title: 'Sunrise Bakery opened your email',
    body: '3rd open — this looks like a warm lead',
    href: '/pipeline',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: '4',
    type: 'email_drafted',
    title: 'Email draft ready for Bay Area Dental',
    body: 'Review and approve to send',
    href: '/email-review',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
]

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <span className="material-symbols-outlined text-[20px]">
          notifications
        </span>
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications
            </h3>
            <button className="text-xs font-medium text-primary hover:text-primary-hover">
              Mark all read
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {MOCK_NOTIFICATIONS.map((notification) => (
              <Link
                key={notification.id}
                href={notification.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex gap-3 border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50',
                  !notification.read && 'bg-primary-light/30'
                )}
              >
                <span
                  className={cn(
                    'material-symbols-outlined mt-0.5 text-[18px]',
                    notification.type === 'email_replied'
                      ? 'text-success'
                      : notification.type === 'email_bounced' ||
                          notification.type === 'system_alert'
                        ? 'text-error'
                        : 'text-gray-400'
                  )}
                >
                  {NOTIFICATION_ICON_MAP[notification.type] || 'info'}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'truncate text-sm',
                      notification.read
                        ? 'text-gray-600'
                        : 'font-medium text-gray-900'
                    )}
                  >
                    {notification.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {notification.body}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDistanceToNow(notification.createdAt, {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {!notification.read && (
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-200 px-4 py-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-medium text-primary hover:text-primary-hover"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
