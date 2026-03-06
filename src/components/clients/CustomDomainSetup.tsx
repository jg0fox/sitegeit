'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface CustomDomainSetupProps {
  businessId: string
  currentDomain: string | null
  tier: string
}

export function CustomDomainSetup({ businessId, currentDomain, tier }: CustomDomainSetupProps) {
  const router = useRouter()
  const [domain, setDomain] = useState(currentDomain || '')
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(false)
  const [dnsStatus, setDnsStatus] = useState<'unknown' | 'checking' | 'resolved' | 'not_found'>('unknown')

  const isGrowthPlus = tier !== 'starter'

  if (!isGrowthPlus) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-500">
          Custom domains are available on Growth, Pro, and Premium tiers.
        </p>
      </div>
    )
  }

  async function handleSaveDomain() {
    const cleaned = domain
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/+$/, '')

    if (!cleaned) {
      toast.error('Please enter a domain')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}/domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleaned }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save domain')
      }

      toast.success('Custom domain saved')
      setDomain(cleaned)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save domain')
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
      setDomain('')
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

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="yourdomain.com"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {currentDomain ? (
          <div className="flex gap-2">
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
        ) : (
          <Button size="sm" onClick={handleSaveDomain} disabled={saving || !domain.trim()}>
            {saving ? 'Saving...' : 'Save domain'}
          </Button>
        )}
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
          {dnsStatus === 'not_found' && 'DNS not yet configured — see instructions below'}
          {dnsStatus === 'checking' && 'Checking DNS...'}
        </div>
      )}

      {/* DNS instructions */}
      {currentDomain && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            DNS Configuration
          </p>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-3 gap-2 rounded-md bg-white p-2 text-xs">
              <span className="font-medium text-gray-500">Type</span>
              <span className="font-medium text-gray-500">Name</span>
              <span className="font-medium text-gray-500">Value</span>

              <span className="font-mono text-gray-700">CNAME</span>
              <span className="font-mono text-gray-700">www</span>
              <span className="font-mono text-gray-700">cname.vercel-dns.com</span>

              <span className="font-mono text-gray-700">A</span>
              <span className="font-mono text-gray-700">@</span>
              <span className="font-mono text-gray-700">76.76.21.21</span>
            </div>
            <p className="text-xs text-gray-500">
              Add these records at your domain registrar. DNS changes can take up to 48 hours to propagate.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
