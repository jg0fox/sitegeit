'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Preference {
  event_type: string
  enabled: boolean
  delivery_method: string
}

interface NotificationSettings {
  preferences: Preference[]
  daily_digest: { enabled: boolean; time: string }
}

const EVENT_GROUPS = [
  {
    title: 'Pipeline',
    icon: 'route',
    events: [
      { type: 'email_drafted', label: 'Email draft ready' },
      { type: 'site_generated', label: 'Site generated' },
    ],
  },
  {
    title: 'Engagement',
    icon: 'trending_up',
    events: [
      { type: 'email_opened', label: 'Email opened' },
      { type: 'email_clicked', label: 'Email clicked' },
      { type: 'email_replied', label: 'Email replied' },
    ],
  },
  {
    title: 'Delivery',
    icon: 'send',
    events: [
      { type: 'email_bounced', label: 'Email bounced' },
    ],
  },
  {
    title: 'System',
    icon: 'settings',
    events: [
      { type: 'system_error', label: 'System errors' },
    ],
  },
]

const DELIVERY_OPTIONS = [
  { value: 'push', label: 'Push' },
  { value: 'email', label: 'Email' },
  { value: 'both', label: 'Both' },
]

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/settings/notifications')
      if (res.ok) {
        setSettings(await res.json())
      }
      setLoading(false)
    }
    load()
  }, [])

  function updatePref(eventType: string, field: 'enabled' | 'delivery_method', value: boolean | string) {
    if (!settings) return
    setSettings({
      ...settings,
      preferences: settings.preferences.map((p) =>
        p.event_type === eventType ? { ...p, [field]: value } : p
      ),
    })
  }

  function getPref(eventType: string): Preference {
    return settings?.preferences.find((p) => p.event_type === eventType) || {
      event_type: eventType,
      enabled: true,
      delivery_method: 'push',
    }
  }

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: settings.preferences,
          daily_digest: settings.daily_digest,
        }),
      })
      if (!res.ok) {
        toast.error('Failed to save notification preferences')
        return
      }
      toast.success('Notification preferences updated')
    } catch {
      toast.error('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        <p className="py-12 text-center text-sm text-gray-400">Loading preferences...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/settings"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to settings
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Notification preferences</h1>
        <p className="mt-1 text-sm text-gray-500">
          Choose which events notify you and how.
        </p>
      </div>

      {EVENT_GROUPS.map((group) => (
        <Card key={group.title}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-gray-400">
                {group.icon}
              </span>
              <CardTitle>{group.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-0 divide-y divide-gray-100">
            {group.events.map((event) => {
              const pref = getPref(event.type)
              return (
                <div key={event.type} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-3">
                      <button
                        role="switch"
                        aria-checked={pref.enabled}
                        onClick={() => updatePref(event.type, 'enabled', !pref.enabled)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                          pref.enabled ? 'bg-primary' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                            pref.enabled ? 'translate-x-[18px]' : 'translate-x-[2px]'
                          } mt-[2px]`}
                        />
                      </button>
                      <span className="text-sm text-gray-700">{event.label}</span>
                    </label>
                    {event.type === 'email_replied' && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                        High priority
                      </span>
                    )}
                  </div>

                  <select
                    value={pref.delivery_method}
                    onChange={(e) => updatePref(event.type, 'delivery_method', e.target.value)}
                    disabled={!pref.enabled}
                    className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 disabled:opacity-40"
                  >
                    {DELIVERY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}

      {/* Daily digest */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-gray-400">
              summarize
            </span>
            <CardTitle>Daily digest</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              role="switch"
              aria-checked={settings.daily_digest.enabled}
              onClick={() =>
                setSettings({
                  ...settings,
                  daily_digest: { ...settings.daily_digest, enabled: !settings.daily_digest.enabled },
                })
              }
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                settings.daily_digest.enabled ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  settings.daily_digest.enabled ? 'translate-x-[18px]' : 'translate-x-[2px]'
                } mt-[2px]`}
              />
            </button>
            <span className="text-sm text-gray-700">Send daily summary email</span>
          </div>

          {settings.daily_digest.enabled && (
            <div>
              <label htmlFor="digest_time" className="block text-sm font-medium text-gray-700">
                Delivery time
              </label>
              <input
                id="digest_time"
                type="time"
                value={settings.daily_digest.time}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    daily_digest: { ...settings.daily_digest, time: e.target.value },
                  })
                }
                className="mt-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700"
              />
              <p className="mt-1 text-xs text-gray-400">
                Receive a summary of the day&apos;s activity at this time.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save preferences'}
        </Button>
      </div>
    </div>
  )
}
