'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface IntegrationStatus {
  instantly: { connected: boolean }
  google_places: { connected: boolean }
  vercel: { connected: boolean }
  google_calendar: { connected: boolean; email: string | null; configured: boolean }
  zoom: { connected: boolean; email: string | null; configured: boolean }
  calendly: { connected: boolean; link: string | null }
  stripe: { connected: boolean; status: string }
  plausible: { connected: boolean; status: string }
}

function StatusBadge({ connected, comingSoon }: { connected: boolean; comingSoon?: boolean }) {
  if (comingSoon) {
    return (
      <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500">
        Coming soon
      </span>
    )
  }
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
        connected
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      {connected ? 'Connected' : 'Not connected'}
    </span>
  )
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div className="space-y-6"><p className="py-12 text-center text-sm text-gray-400">Loading integrations...</p></div>}>
      <IntegrationsContent />
    </Suspense>
  )
}

function IntegrationsContent() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const searchParams = useSearchParams()

  const loadStatus = useCallback(async () => {
    const res = await fetch('/api/settings/integrations')
    if (res.ok) {
      setStatus(await res.json())
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  // Handle OAuth callback messages
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    if (success === 'google_connected') {
      toast.success('Google Calendar connected')
      loadStatus()
    }
    if (error === 'google_denied') {
      toast.error('Google Calendar connection was denied')
    }
    if (error === 'token_exchange_failed') {
      toast.error('Failed to connect Google Calendar. Please try again.')
    }
    if (success === 'zoom_connected') {
      toast.success('Zoom connected')
      loadStatus()
    }
    if (error === 'zoom_denied') {
      toast.error('Zoom connection was denied')
    }
  }, [searchParams, loadStatus])

  async function handleDisconnect(service: 'google' | 'zoom') {
    setDisconnecting(service)
    try {
      const res = await fetch(`/api/auth/${service}/disconnect`, { method: 'POST' })
      if (res.ok) {
        toast.success(`${service === 'google' ? 'Google Calendar' : 'Zoom'} disconnected`)
        await loadStatus()
      } else {
        toast.error('Failed to disconnect')
      }
    } catch {
      toast.error('Failed to disconnect')
    } finally {
      setDisconnecting(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="py-12 text-center text-sm text-gray-400">Loading integrations...</p>
      </div>
    )
  }

  interface IntegrationItem {
    key: string
    title: string
    description: string
    icon: string
    connected?: boolean
    comingSoon?: boolean
    action?: { label: string; href?: string; onClick?: () => void } | null
    hint?: string | null
  }

  const integrations: IntegrationItem[] = [
    {
      key: 'instantly',
      title: 'Instantly.ai',
      description: 'Email sending and domain management.',
      icon: 'mail',
      connected: status?.instantly.connected ?? false,
      action: status?.instantly.connected
        ? { label: 'View domains', href: '/settings/domains' }
        : null,
      hint: !status?.instantly.connected
        ? 'INSTANTLY_API_KEY not configured in environment variables.'
        : null,
    },
    {
      key: 'google_calendar',
      title: 'Google Calendar',
      description: 'Calendar availability and event creation for scheduling.',
      icon: 'event',
      connected: status?.google_calendar.connected ?? false,
      action: status?.google_calendar.connected
        ? { label: 'Disconnect', onClick: () => handleDisconnect('google') }
        : status?.google_calendar.configured
          ? { label: 'Connect Google Calendar', href: '/api/auth/google' }
          : null,
      hint: status?.google_calendar.connected
        ? `Connected as ${status.google_calendar.email || 'unknown'}`
        : !status?.google_calendar.configured
          ? 'GOOGLE_OAUTH_CLIENT_ID not configured in environment variables.'
          : 'Connect your Google Calendar to enable scheduling.',
    },
    {
      key: 'zoom',
      title: 'Zoom',
      description: 'Automatic meeting link generation for bookings.',
      icon: 'videocam',
      connected: status?.zoom.connected ?? false,
      action: status?.zoom.connected
        ? { label: 'Disconnect', onClick: () => handleDisconnect('zoom') }
        : status?.zoom.configured
          ? { label: 'Connect Zoom', href: '/api/auth/zoom' }
          : null,
      hint: status?.zoom.connected
        ? `Connected as ${status.zoom.email || 'unknown'}`
        : !status?.zoom.configured
          ? 'ZOOM_CLIENT_ID not configured. Bookings will default to phone calls.'
          : 'Connect Zoom to generate meeting links for bookings.',
    },
    {
      key: 'google_places',
      title: 'Google Places',
      description: 'Business discovery and enrichment data.',
      icon: 'travel_explore',
      connected: status?.google_places.connected ?? false,
      hint: !status?.google_places.connected
        ? 'GOOGLE_PLACES_API_KEY not configured in environment variables.'
        : null,
    },
    {
      key: 'vercel',
      title: 'Vercel',
      description: 'Site deployment and hosting.',
      icon: 'cloud_upload',
      connected: status?.vercel.connected ?? false,
      hint: !status?.vercel.connected
        ? 'VERCEL_TOKEN not configured in environment variables.'
        : null,
    },
    {
      key: 'calendly',
      title: 'Calendly',
      description: 'Meeting scheduling for outreach (legacy).',
      icon: 'calendar_month',
      connected: status?.calendly.connected ?? false,
      action: { label: status?.calendly.connected ? 'Edit in profile' : 'Set up in profile', href: '/settings/profile' },
      hint: status?.calendly.connected
        ? status.calendly.link
        : 'No Calendly link configured yet.',
    },
    {
      key: 'stripe',
      title: 'Stripe',
      description: 'Subscription billing for clients.',
      icon: 'payments',
      comingSoon: true,
    },
    {
      key: 'plausible',
      title: 'Plausible',
      description: 'Site analytics for Growth+ clients.',
      icon: 'monitoring',
      comingSoon: true,
    },
  ]

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
        <h1 className="text-xl font-semibold text-gray-900">Integrations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Connection status for your external services.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {integrations.map((item) => (
          <Card key={item.key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                    <span className="material-symbols-outlined text-[20px] text-gray-400">
                      {item.icon}
                    </span>
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                </div>
                <StatusBadge
                  connected={item.connected ?? false}
                  comingSoon={item.comingSoon}
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{item.description}</p>
              {item.hint && (
                <p className="mt-2 text-xs text-gray-400">{item.hint}</p>
              )}
              {item.action && (
                item.action.onClick ? (
                  <button
                    onClick={item.action.onClick}
                    disabled={disconnecting === item.key.replace('google_calendar', 'google')}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline disabled:opacity-50"
                  >
                    {disconnecting === item.key.replace('google_calendar', 'google')
                      ? 'Disconnecting...'
                      : item.action.label}
                  </button>
                ) : item.action.href?.startsWith('/api/') ? (
                  <a
                    href={item.action.href}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    {item.action.label}
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>
                ) : (
                  <Link
                    href={item.action.href || '#'}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    {item.action.label}
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                )
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
