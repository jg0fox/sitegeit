'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddDomainDialog } from '@/components/settings/AddDomainDialog'

interface SendingDomain {
  id: string
  domain: string
  email_address: string
  warmup_status: string
  health_score: number | null
  spf_configured: boolean
  dkim_configured: boolean
  dmarc_configured: boolean
  daily_send_limit: number
  emails_sent_today: number
  created_at: string
}

const WARMUP_BADGE: Record<string, { label: string; className: string }> = {
  warming: { label: 'Warming', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  ready: { label: 'Ready', className: 'bg-green-50 text-green-700 border-green-200' },
  flagged: { label: 'Flagged', className: 'bg-red-50 text-red-700 border-red-200' },
  paused: { label: 'Paused', className: 'bg-gray-50 text-gray-600 border-gray-200' },
}

function CheckIcon({ ok }: { ok: boolean }) {
  return (
    <span
      className={`material-symbols-outlined text-[16px] ${ok ? 'text-green-600' : 'text-gray-300'}`}
    >
      {ok ? 'check_circle' : 'cancel'}
    </span>
  )
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<SendingDomain[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const fetchDomains = useCallback(async () => {
    const res = await fetch('/api/settings/domains')
    if (res.ok) {
      setDomains(await res.json())
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchDomains()
  }, [fetchDomains])

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch('/api/settings/domains/sync', { method: 'POST' })
      if (res.ok) {
        await fetchDomains()
      }
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Sending domains</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage email accounts connected to Instantly for outreach.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[18px] ${syncing ? 'animate-spin' : ''}`}>
              sync
            </span>
            {syncing ? 'Syncing...' : 'Sync from Instantly'}
          </button>
          <AddDomainDialog onAdded={fetchDomains} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Domains ({domains.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-400">Loading domains...</p>
          ) : domains.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <span className="material-symbols-outlined text-[40px] text-gray-300">mail</span>
              <p className="text-sm font-medium text-gray-600">No sending domains yet</p>
              <p className="text-sm text-gray-400">
                Add a domain or sync from Instantly to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Health</th>
                    <th className="pb-3 pr-4">SPF</th>
                    <th className="pb-3 pr-4">DKIM</th>
                    <th className="pb-3 pr-4">DMARC</th>
                    <th className="pb-3 pr-4">Sent today</th>
                    <th className="pb-3">Limit</th>
                  </tr>
                </thead>
                <tbody>
                  {domains.map((d) => {
                    const badge = WARMUP_BADGE[d.warmup_status] || WARMUP_BADGE.warming
                    const utilization = d.daily_send_limit > 0
                      ? Math.round((d.emails_sent_today / d.daily_send_limit) * 100)
                      : 0
                    return (
                      <tr key={d.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-gray-900">{d.email_address}</div>
                          <div className="text-xs text-gray-400">{d.domain}</div>
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          {d.health_score != null ? (
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${d.health_score}%`,
                                    backgroundColor:
                                      d.health_score >= 80 ? '#10b981' : d.health_score >= 50 ? '#f59e0b' : '#ef4444',
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">{d.health_score}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-4"><CheckIcon ok={d.spf_configured} /></td>
                        <td className="py-3 pr-4"><CheckIcon ok={d.dkim_configured} /></td>
                        <td className="py-3 pr-4"><CheckIcon ok={d.dmarc_configured} /></td>
                        <td className="py-3 pr-4">
                          <span className={utilization >= 90 ? 'font-medium text-red-600' : 'text-gray-700'}>
                            {d.emails_sent_today}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500">{d.daily_send_limit}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
