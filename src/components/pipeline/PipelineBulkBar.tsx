'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const TIERS = [
  { value: 'starter', label: 'Starter', price: '$25/mo' },
  { value: 'growth', label: 'Growth', price: '$50/mo' },
  { value: 'pro', label: 'Pro', price: '$75/mo' },
  { value: 'premium', label: 'Premium', price: '$100/mo' },
]

const TIER_RATES: Record<string, number> = {
  starter: 25,
  growth: 50,
  pro: 75,
  premium: 100,
}

interface PipelineBulkBarProps {
  selectedIds: string[]
  selectedCount: number
  onClear: () => void
}

export function PipelineBulkBar({ selectedIds, selectedCount, onClear }: PipelineBulkBarProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConvert, setShowConvert] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [tier, setTier] = useState('starter')

  async function handleBulkStatus(status: string, successMessage: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/businesses/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, status }),
      })
      if (res.ok) {
        toast.success(successMessage)
        onClear()
        router.refresh()
      } else {
        toast.error('Action failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleBulkConvert() {
    setLoading(true)
    try {
      const res = await fetch('/api/businesses/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          status: 'active',
          tier,
          monthly_rate: TIER_RATES[tier],
        }),
      })
      if (res.ok) {
        toast.success(`${selectedCount} prospect${selectedCount !== 1 ? 's' : ''} converted to ${tier} clients`)
        onClear()
        setShowConvert(false)
        router.refresh()
      } else {
        toast.error('Conversion failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleBulkDelete() {
    setLoading(true)
    try {
      const res = await fetch('/api/businesses/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })
      if (res.ok) {
        toast.success(`${selectedCount} prospect${selectedCount !== 1 ? 's' : ''} deleted`)
        onClear()
        setShowDelete(false)
        router.refresh()
      } else {
        toast.error('Delete failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating bar */}
      <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
          <span className="mr-1 text-sm font-medium text-gray-700">
            {selectedCount} selected
          </span>

          <div className="mx-1 h-5 w-px bg-gray-200" />

          <button
            onClick={() => setShowConvert(true)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            Convert
          </button>

          <button
            onClick={() => handleBulkStatus('closed_lost', `${selectedCount} prospect${selectedCount !== 1 ? 's' : ''} marked as declined`)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700 ring-1 ring-inset ring-orange-200 transition-colors hover:bg-orange-100 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">block</span>
            Decline
          </button>

          <button
            onClick={() => handleBulkStatus('archived', `${selectedCount} prospect${selectedCount !== 1 ? 's' : ''} deferred`)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-200 transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            Defer
          </button>

          <button
            onClick={() => setShowDelete(true)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-200 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Delete
          </button>

          <div className="mx-1 h-5 w-px bg-gray-200" />

          <button
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>

      {/* Convert dialog */}
      <Dialog.Root open={showConvert} onOpenChange={setShowConvert}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Convert {selectedCount} prospect{selectedCount !== 1 ? 's' : ''} to clients
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-500">
              Choose a tier for all selected prospects. You can change individual tiers later from the client detail page.
            </Dialog.Description>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {TIERS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTier(t.value)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    tier === t.value
                      ? 'border-primary bg-primary-light'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                  <p className="text-xs text-gray-500">{t.price}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50">
                  Cancel
                </button>
              </Dialog.Close>
              <Button onClick={handleBulkConvert} disabled={loading}>
                {loading ? 'Converting...' : `Convert ${selectedCount} to ${tier}`}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete confirmation dialog */}
      <Dialog.Root open={showDelete} onOpenChange={setShowDelete}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Delete {selectedCount} prospect{selectedCount !== 1 ? 's' : ''}?
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-500">
              This will permanently remove {selectedCount === 1 ? 'this prospect' : 'these prospects'} and
              all generated sites, landing pages, emails, and activity history. This cannot be undone.
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={handleBulkDelete}
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete permanently'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
