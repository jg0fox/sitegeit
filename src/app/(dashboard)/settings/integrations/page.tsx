'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface IntegrationStatus {
  instantly: { connected: boolean }
  google_places: { connected: boolean }
  vercel: { connected: boolean }
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
  const [status, setStatus] = useState<IntegrationStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/settings/integrations')
      if (res.ok) {
        setStatus(await res.json())
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="py-12 text-center text-sm text-gray-400">Loading integrations...</p>
      </div>
    )
  }

  const integrations = [
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
      description: 'Meeting scheduling for outreach.',
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
                  connected={'connected' in item ? item.connected ?? false : false}
                  comingSoon={item.comingSoon}
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{item.description}</p>
              {'hint' in item && item.hint && (
                <p className="mt-2 text-xs text-gray-400">{item.hint}</p>
              )}
              {'action' in item && item.action && (
                <Link
                  href={item.action.href}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  {item.action.label}
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
