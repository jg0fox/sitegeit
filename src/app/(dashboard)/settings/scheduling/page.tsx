'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface SchedulingConfig {
  available_days: string[]
  available_hours: { start: string; end: string }
  day_overrides: Record<string, { start: string; end: string }>
  meeting_duration: number
  buffer_time: number
  min_notice: number
  max_advance_days: number
  timezone: string
  default_meeting_type: string
  default_location: string | null
  booking_page_title: string
  booking_page_subtitle: string
}

const DAYS = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
]

const TIME_OPTIONS = Array.from({ length: 24 * 2 }, (_, i) => {
  const hours = Math.floor(i / 2)
  const mins = i % 2 === 0 ? '00' : '30'
  return `${hours.toString().padStart(2, '0')}:${mins}`
})

const DURATION_OPTIONS = [15, 20, 30, 45, 60]
const BUFFER_OPTIONS = [0, 5, 10, 15, 30]
const NOTICE_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
  { value: 1440, label: '24 hours' },
]
const ADVANCE_OPTIONS = [
  { value: 7, label: '1 week' },
  { value: 14, label: '2 weeks' },
  { value: 21, label: '3 weeks' },
  { value: 28, label: '4 weeks' },
]

const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
]

function formatTime(time24: string): string {
  const [h, m] = time24.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function SchedulingSettingsPage() {
  const [config, setConfig] = useState<SchedulingConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadConfig = useCallback(async () => {
    const res = await fetch('/api/settings/scheduling')
    if (res.ok) {
      setConfig(await res.json())
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  async function save() {
    if (!config) return
    setSaving(true)
    try {
      const res = await fetch('/api/settings/scheduling', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (res.ok) {
        toast.success('Scheduling settings saved')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save')
      }
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  function toggleDay(day: string) {
    if (!config) return
    const days = config.available_days.includes(day)
      ? config.available_days.filter((d) => d !== day)
      : [...config.available_days, day]
    setConfig({ ...config, available_days: days })
  }

  function setDayOverride(day: string, field: 'start' | 'end', value: string) {
    if (!config) return
    const overrides = { ...config.day_overrides }
    if (!overrides[day]) {
      overrides[day] = { ...config.available_hours }
    }
    overrides[day] = { ...overrides[day], [field]: value }
    setConfig({ ...config, day_overrides: overrides })
  }

  function clearDayOverride(day: string) {
    if (!config) return
    const overrides = { ...config.day_overrides }
    delete overrides[day]
    setConfig({ ...config, day_overrides: overrides })
  }

  if (loading || !config) {
    return (
      <div className="space-y-6">
        <p className="py-12 text-center text-sm text-gray-400">Loading scheduling settings...</p>
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
        <h1 className="text-xl font-semibold text-gray-900">Scheduling</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your availability and booking preferences.
        </p>
      </div>

      {/* Availability Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {DAYS.map(({ key, label }) => {
            const isActive = config.available_days.includes(key)
            const override = config.day_overrides[key]
            const hours = override || config.available_hours

            return (
              <div key={key} className="flex items-center gap-3">
                <button
                  onClick={() => toggleDay(key)}
                  className={`flex h-8 w-12 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {label}
                </button>

                {isActive && (
                  <>
                    <select
                      value={hours.start}
                      onChange={(e) => setDayOverride(key, 'start', e.target.value)}
                      className="rounded-md border border-gray-200 px-2 py-1.5 text-sm"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>{formatTime(t)}</option>
                      ))}
                    </select>
                    <span className="text-sm text-gray-400">to</span>
                    <select
                      value={hours.end}
                      onChange={(e) => setDayOverride(key, 'end', e.target.value)}
                      className="rounded-md border border-gray-200 px-2 py-1.5 text-sm"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>{formatTime(t)}</option>
                      ))}
                    </select>
                    {override && (
                      <button
                        onClick={() => clearDayOverride(key)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                        title="Reset to default hours"
                      >
                        <span className="material-symbols-outlined text-[16px]">undo</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            )
          })}
          <p className="mt-2 text-xs text-gray-400">
            Default hours: {formatTime(config.available_hours.start)} &ndash; {formatTime(config.available_hours.end)}.
            Click a day to customize its hours.
          </p>
        </CardContent>
      </Card>

      {/* Meeting Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Meeting settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Meeting duration</label>
              <select
                value={config.meeting_duration}
                onChange={(e) => setConfig({ ...config, meeting_duration: Number(e.target.value) })}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d} minutes</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Buffer between meetings</label>
              <select
                value={config.buffer_time}
                onChange={(e) => setConfig({ ...config, buffer_time: Number(e.target.value) })}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              >
                {BUFFER_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b === 0 ? 'No buffer' : `${b} minutes`}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum notice</label>
              <select
                value={config.min_notice}
                onChange={(e) => setConfig({ ...config, min_notice: Number(e.target.value) })}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              >
                {NOTICE_OPTIONS.map((n) => (
                  <option key={n.value} value={n.value}>{n.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Booking window</label>
              <select
                value={config.max_advance_days}
                onChange={(e) => setConfig({ ...config, max_advance_days: Number(e.target.value) })}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              >
                {ADVANCE_OPTIONS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <select
                value={config.timezone}
                onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Default meeting type</label>
              <div className="mt-2 flex gap-3">
                {(['zoom', 'phone', 'in_person'] as const).map((type) => (
                  <label key={type} className="flex items-center gap-1.5 text-sm">
                    <input
                      type="radio"
                      name="meeting_type"
                      value={type}
                      checked={config.default_meeting_type === type}
                      onChange={() => setConfig({ ...config, default_meeting_type: type })}
                      className="h-4 w-4 text-primary"
                    />
                    {type === 'zoom' ? 'Zoom' : type === 'phone' ? 'Phone' : 'In-person'}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {config.default_meeting_type === 'in_person' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Meeting location</label>
              <input
                type="text"
                value={config.default_location || ''}
                onChange={(e) => setConfig({ ...config, default_location: e.target.value })}
                placeholder="123 Main St, Phoenix, AZ"
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Page Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Booking page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Page title</label>
            <input
              type="text"
              value={config.booking_page_title}
              onChange={(e) => setConfig({ ...config, booking_page_title: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subtitle</label>
            <input
              type="text"
              value={config.booking_page_subtitle}
              onChange={(e) => setConfig({ ...config, booking_page_subtitle: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <p className="text-xs text-gray-400">
            Your booking page is at{' '}
            <code className="rounded bg-gray-100 px-1 py-0.5">
              {process.env.NEXT_PUBLIC_APP_URL || 'https://seitgeit.vercel.app'}/book
            </code>
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save settings'}
        </button>
      </div>
    </div>
  )
}
