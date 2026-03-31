'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type BookingMode = 'off' | 'demo' | 'configured'

interface SchedulingConfig {
  id?: string
  mode: BookingMode
  contact_email: string
  timezone: string
  meeting_duration: number
  meeting_types: string[]
  booking_slug: string
  booking_page_title: string
  booking_page_subtitle: string
  is_active: boolean
}

const DEFAULT_CONFIG: SchedulingConfig = {
  mode: 'off',
  contact_email: '',
  timezone: 'America/Phoenix',
  meeting_duration: 15,
  meeting_types: ['phone'],
  booking_slug: '',
  booking_page_title: '',
  booking_page_subtitle: '',
  is_active: false,
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function ClientBookingSetup({
  businessId,
  businessName,
  businessEmail,
}: {
  businessId: string
  businessName: string
  businessEmail: string | null
}) {
  const [config, setConfig] = useState<SchedulingConfig>({
    ...DEFAULT_CONFIG,
    contact_email: businessEmail || '',
    booking_slug: slugify(businessName),
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/client-scheduling/${businessId}`)
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setConfig({
            ...DEFAULT_CONFIG,
            ...data,
            mode: data.mode || (data.is_active ? 'configured' : 'off'),
            meeting_types: data.meeting_types || ['phone'],
          })
        }
      }
      setLoading(false)
    }
    load()
  }, [businessId])

  async function saveMode(mode: BookingMode, overrides?: Partial<SchedulingConfig>) {
    setSaving(true)
    const payload = { ...config, mode, ...overrides }
    try {
      const res = await fetch(`/api/client-scheduling/${businessId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const data = await res.json()
        setConfig({ ...DEFAULT_CONFIG, ...data, mode: data.mode || mode, meeting_types: data.meeting_types || ['phone'] })
        toast.success(
          mode === 'off' ? 'Booking disabled' :
          mode === 'demo' ? 'Demo booking enabled' :
          'Booking settings saved'
        )
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save')
      }
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-blue-500">calendar_month</span>
            <CardTitle>Booking</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  const bookingUrl = config.booking_slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${config.booking_slug}`
    : null

  const MODE_OPTIONS: { key: BookingMode; label: string; icon: string; description: string }[] = [
    { key: 'off', label: 'Off', icon: 'block', description: 'No booking on the site' },
    { key: 'demo', label: 'Demo', icon: 'play_circle', description: 'Quick booking for demos and pitches' },
    { key: 'configured', label: 'Configured', icon: 'settings', description: 'Full client booking setup' },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-blue-500">calendar_month</span>
          <CardTitle>Booking</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 3-state mode selector */}
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                if (opt.key === config.mode) return
                if (opt.key === 'off') {
                  saveMode('off')
                } else if (opt.key === 'demo') {
                  saveMode('demo', { booking_slug: config.booking_slug || slugify(businessName) })
                } else {
                  // Switch to configured — don't auto-save, show form
                  setConfig({ ...config, mode: 'configured' })
                }
              }}
              disabled={saving}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                config.mode === opt.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Mode description */}
        <p className="text-xs text-gray-500">
          {MODE_OPTIONS.find((o) => o.key === config.mode)?.description}
        </p>

        {/* Demo mode: show booking URL */}
        {config.mode === 'demo' && bookingUrl && (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
              <p className="text-xs font-medium text-emerald-700">Demo booking is live</p>
            </div>
            <p className="mt-1 text-xs text-emerald-600">
              <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="font-medium underline">
                {bookingUrl}
              </a>
            </p>
            <p className="mt-1.5 text-xs text-emerald-600/70">
              Uses your own scheduling availability. Notifications go to your account email.
            </p>
          </div>
        )}

        {/* Configured mode: full form */}
        {config.mode === 'configured' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600">Contact email</label>
              <input
                type="email"
                value={config.contact_email}
                onChange={(e) => setConfig({ ...config, contact_email: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="business@example.com"
              />
              <p className="mt-1 text-xs text-gray-400">Booking notifications will be sent here.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600">Booking URL slug</label>
              <div className="mt-1 flex items-center rounded-lg border border-gray-200 bg-gray-50 text-sm">
                <span className="shrink-0 px-3 text-gray-400">/book/</span>
                <input
                  type="text"
                  value={config.booking_slug}
                  onChange={(e) => setConfig({ ...config, booking_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="w-full rounded-r-lg border-0 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="business-name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600">Duration (min)</label>
                <select
                  value={config.meeting_duration}
                  onChange={(e) => setConfig({ ...config, meeting_duration: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Timezone</label>
                <select
                  value={config.timezone}
                  onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="America/Phoenix">Arizona (MST)</option>
                  <option value="America/Los_Angeles">Pacific (PT)</option>
                  <option value="America/Denver">Mountain (MT)</option>
                  <option value="America/Chicago">Central (CT)</option>
                  <option value="America/New_York">Eastern (ET)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600">Meeting types</label>
              <div className="mt-1 flex gap-3">
                {['phone', 'zoom', 'in_person'].map((type) => (
                  <label key={type} className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={config.meeting_types.includes(type)}
                      onChange={(e) => {
                        const types = e.target.checked
                          ? [...config.meeting_types, type]
                          : config.meeting_types.filter((t) => t !== type)
                        setConfig({ ...config, meeting_types: types.length ? types : ['phone'] })
                      }}
                      className="h-3.5 w-3.5 rounded border-gray-300"
                    />
                    {type === 'in_person' ? 'In person' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {bookingUrl && config.is_active && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                <p className="text-xs text-blue-700">
                  Booking page:{' '}
                  <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="font-medium underline">
                    {bookingUrl}
                  </a>
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => saveMode('configured')} disabled={saving} size="sm">
                {saving ? 'Saving...' : 'Save booking settings'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
