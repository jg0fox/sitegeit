'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { toast } from 'sonner'

const TIERS = [
  {
    value: 'starter',
    label: 'Starter',
    price: 25,
    features: 'Single-page site, basic SEO, subdomain hosting',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  {
    value: 'growth',
    label: 'Growth',
    price: 50,
    features: 'Multi-page site, custom domain, monthly analytics report',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    value: 'pro',
    label: 'Pro',
    price: 75,
    features: 'Everything in Growth + priority support, quarterly content refresh',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    value: 'premium',
    label: 'Premium',
    price: 100,
    features: 'Everything in Pro + monthly content refresh, blog posts, social content',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
] as const

interface ConvertToClientDialogProps {
  businessId: string
  businessName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConvertToClientDialog({
  businessId,
  businessName,
  open,
  onOpenChange,
}: ConvertToClientDialogProps) {
  const router = useRouter()
  const [tier, setTier] = useState('starter')
  const [monthlyRate, setMonthlyRate] = useState('25')
  const [customDomain, setCustomDomain] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const selectedTier = TIERS.find((t) => t.value === tier)
  const isGrowthPlus = tier !== 'starter'

  function handleTierChange(value: string) {
    setTier(value)
    const t = TIERS.find((t) => t.value === value)
    if (t) setMonthlyRate(String(t.price))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/businesses/${businessId}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          monthly_rate: parseInt(monthlyRate, 10) || selectedTier?.price || 25,
          custom_domain: isGrowthPlus && customDomain.trim() ? customDomain.trim() : undefined,
          note: note.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to convert')
      }

      toast.success(`${businessName} converted to ${selectedTier?.label} client`)
      onOpenChange(false)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Conversion failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            Convert to client
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-gray-500">
            Set up {businessName} as a paying client.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Tier selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Service tier</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {TIERS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => handleTierChange(t.value)}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      tier === t.value
                        ? `${t.color} ring-2 ring-offset-1 ring-current`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{t.label}</span>
                      <span className="text-sm font-medium">${t.price}/mo</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-tight text-gray-500">{t.features}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly rate */}
            <div>
              <label htmlFor="rate" className="block text-sm font-medium text-gray-700">
                Monthly rate ($)
              </label>
              <input
                id="rate"
                type="number"
                min="0"
                value={monthlyRate}
                onChange={(e) => setMonthlyRate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Custom domain (Growth+ only) */}
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                Custom domain
                {!isGrowthPlus && (
                  <span className="ml-1.5 text-xs font-normal text-gray-400">Growth+ only</span>
                )}
              </label>
              <input
                id="domain"
                type="text"
                placeholder="joesplumbing.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                disabled={!isGrowthPlus}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="note"
                rows={2}
                placeholder="e.g., Met via Zoom, wants to launch next week"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[var(--color-primary,#3E63DD)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover,#3358D4)] disabled:opacity-50"
              >
                {saving ? 'Converting...' : 'Convert to client'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
