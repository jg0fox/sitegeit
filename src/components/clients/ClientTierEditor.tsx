'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TierBadge } from '@/components/shared/TierBadge'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

const TIERS = [
  { value: 'starter', label: 'Starter', price: 25 },
  { value: 'growth', label: 'Growth', price: 50 },
  { value: 'pro', label: 'Pro', price: 75 },
  { value: 'premium', label: 'Premium', price: 100 },
] as const

interface ClientTierEditorProps {
  businessId: string
  currentTier: string
  currentRate: number
  status: string
  convertedAt: string | null
  stripeSubscriptionId?: string | null
}

export function ClientTierEditor({
  businessId,
  currentTier,
  currentRate,
  status,
  convertedAt,
  stripeSubscriptionId,
}: ClientTierEditorProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [tier, setTier] = useState(currentTier)
  const [rate, setRate] = useState(String(currentRate))
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          monthly_rate: parseInt(rate, 10) || 0,
        }),
      })

      if (!res.ok) throw new Error('Failed to update')

      toast.success('Tier and rate updated')
      setEditing(false)
      router.refresh()
    } catch {
      toast.error('Failed to update tier')
    } finally {
      setSaving(false)
    }
  }

  async function handleChurn() {
    if (!confirm('Mark this client as churned? This can be reversed later.')) return

    setSaving(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'churned' }),
      })

      if (!res.ok) throw new Error('Failed to update')

      toast.success('Client marked as churned')
      router.refresh()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  async function handleReactivate() {
    setSaving(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      })

      if (!res.ok) throw new Error('Failed to update')

      toast.success('Client reactivated')
      router.refresh()
    } catch {
      toast.error('Failed to reactivate')
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tier</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {TIERS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setTier(t.value)
                  setRate(String(t.price))
                }}
                className={`rounded-lg border p-2 text-left text-sm transition-all ${
                  tier === t.value
                    ? 'border-primary bg-primary-light ring-1 ring-primary'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-semibold">{t.label}</span>
                <span className="ml-1 text-gray-500">${t.price}/mo</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="edit-rate" className="block text-sm font-medium text-gray-700">
            Monthly rate ($)
          </label>
          <input
            id="edit-rate"
            type="number"
            min="0"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={saving}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Current tier</p>
          <div className="mt-1">
            <TierBadge tier={currentTier} />
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Monthly rate</p>
          <p className="mt-1 text-lg font-bold text-gray-900">${currentRate}/mo</p>
        </div>
        {convertedAt && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Converted</p>
            <p className="mt-1 text-sm text-gray-700">
              {formatDistanceToNow(new Date(convertedAt), { addSuffix: true })}
            </p>
          </div>
        )}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Status</p>
          <p className="mt-1 text-sm font-medium capitalize text-gray-700">
            {status.replace(/_/g, ' ')}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
        <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
          <span className="material-symbols-outlined text-[16px]">edit</span>
          Edit tier & rate
        </Button>
        {status === 'active' && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleChurn}
            disabled={saving}
            className="text-red-600 hover:bg-red-50"
          >
            <span className="material-symbols-outlined text-[16px]">cancel</span>
            Mark churned
          </Button>
        )}
        {status === 'churned' && (
          <Button size="sm" variant="outline" onClick={handleReactivate} disabled={saving}>
            <span className="material-symbols-outlined text-[16px]">replay</span>
            Reactivate
          </Button>
        )}
        {stripeSubscriptionId && (
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              setSaving(true)
              try {
                const res = await fetch('/api/stripe/portal', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ businessId }),
                })
                if (res.ok) {
                  const data = await res.json()
                  if (data.url) window.open(data.url, '_blank')
                } else {
                  toast.error('Failed to open billing portal')
                }
              } catch {
                toast.error('Failed to open billing portal')
              } finally {
                setSaving(false)
              }
            }}
            disabled={saving}
          >
            <span className="material-symbols-outlined text-[16px]">credit_card</span>
            Manage billing
          </Button>
        )}
      </div>
    </div>
  )
}
