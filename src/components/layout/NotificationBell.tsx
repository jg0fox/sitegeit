'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { formatDistanceToNow } from 'date-fns'
import { createBrowserClient } from '@supabase/ssr'

const NOTIFICATION_ICON_MAP: Record<string, string> = {
  pipeline: 'check_circle',
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

interface Notification {
  id: string
  type: string
  title: string
  body: string
  href: string | null
  read: boolean
  created_at: string
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

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
      .limit(10)

    if (data) {
      setNotifications(data)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Realtime subscription for new notifications
  useEffect(() => {
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotif = payload.new as Notification
          setNotifications((prev) => [newNotif, ...prev].slice(0, 10))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

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

  const unreadCount = notifications.filter((n) => !n.read).length

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
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-primary hover:text-primary-hover"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => {
                const content = (
                  <div
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
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                )

                if (notification.href) {
                  return (
                    <Link
                      key={notification.id}
                      href={notification.href}
                      onClick={() => {
                        markRead(notification.id)
                        setOpen(false)
                      }}
                    >
                      {content}
                    </Link>
                  )
                }

                return (
                  <button
                    key={notification.id}
                    className="w-full text-left"
                    onClick={() => markRead(notification.id)}
                  >
                    {content}
                  </button>
                )
              })
            )}
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
