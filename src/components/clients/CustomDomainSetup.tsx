'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface AvailableDomain {
  name: string
  verified: boolean
}

interface CustomDomainSetupProps {
  businessId: string
  currentDomain: string | null
}

export function CustomDomainSetup({ businessId, currentDomain }: CustomDomainSetupProps) {
  const router = useRouter()
  const [domains, setDomains] = useState<AvailableDomain[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState('')
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(false)
  const [dnsStatus, setDnsStatus] = useState<'unknown' | 'checking' | 'resolved' | 'not_found'>('unknown')

  useEffect(() => {
    if (!currentDomain) {
      fetchDomains()
    }
  }, [currentDomain])

  async function fetchDomains() {
    setLoading(true)
    try {
      const res = await fetch('/api/vercel/domains')
      if (res.ok) {
        const data = await res.json()
        setDomains(data.domains)
      }
    } catch {
      // Dropdown will be empty
    } finally {
      setLoading(false)
    }
  }

  async function handleAssignDomain() {
    if (!selectedDomain) return

    setSaving(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}/domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: selectedDomain }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to assign domain')
      }

      toast.success(`Domain ${selectedDomain} assigned`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign domain')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveDomain() {
    setSaving(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}/domain`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to remove domain')

      toast.success('Custom domain removed')
      setDnsStatus('unknown')
      router.refresh()
    } catch {
      toast.error('Failed to remove domain')
    } finally {
      setSaving(false)
    }
  }

  async function handleCheckDns() {
    setChecking(true)
    setDnsStatus('checking')
    try {
      const res = await fetch(`/api/businesses/${businessId}/check-dns`)
      const data = await res.json()
      setDnsStatus(data.resolved ? 'resolved' : 'not_found')
    } catch {
      setDnsStatus('not_found')
    } finally {
      setChecking(false)
    }
  }

  // Domain already assigned — show status + remove
  if (currentDomain) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span className="truncate">{currentDomain}</span>
          </div>
          <Button size="sm" variant="outline" onClick={handleCheckDns} disabled={checking}>
            {checking ? 'Checking...' : 'Check DNS'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRemoveDomain}
            disabled={saving}
            className="text-red-600 hover:bg-red-50"
          >
            Remove
          </Button>
        </div>

        {/* DNS status */}
        {dnsStatus !== 'unknown' && (
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              dnsStatus === 'resolved'
                ? 'bg-emerald-50 text-emerald-700'
                : dnsStatus === 'not_found'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-gray-50 text-gray-600'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {dnsStatus === 'resolved' ? 'check_circle' : dnsStatus === 'not_found' ? 'warning' : 'pending'}
            </span>
            {dnsStatus === 'resolved' && 'DNS is configured correctly'}
            {dnsStatus === 'not_found' && 'DNS not yet pointing to Vercel'}
            {dnsStatus === 'checking' && 'Checking DNS...'}
          </div>
        )}
      </div>
    )
  }

  // No domain assigned — show picker
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          disabled={loading}
          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">
            {loading ? 'Loading domains...' : 'Select a domain'}
          </option>
          {domains.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
        <Button size="sm" className="shrink-0" onClick={handleAssignDomain} disabled={saving || !selectedDomain}>
          {saving ? 'Assigning...' : 'Assign domain'}
        </Button>
      </div>
      {domains.length === 0 && !loading && (
        <p className="text-xs text-gray-500">
          No available domains. Purchase a domain on Vercel to assign it here.
        </p>
      )}
    </div>
  )
}
