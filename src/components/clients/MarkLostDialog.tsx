'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { toast } from 'sonner'

const LOSS_REASONS = [
  { value: 'not_interested', label: 'Not interested' },
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'went_with_competitor', label: 'Went with competitor' },
  { value: 'bad_timing', label: 'Bad timing' },
  { value: 'other', label: 'Other' },
] as const

interface MarkLostDialogProps {
  businessId: string
  businessName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MarkLostDialog({
  businessId,
  businessName,
  open,
  onOpenChange,
}: MarkLostDialogProps) {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed_lost' }),
      })

      if (!res.ok) throw new Error('Failed to update status')

      // Log the loss reason as a separate activity
      if (reason) {
        await fetch(`/api/businesses/${businessId}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `Marked as lost: ${LOSS_REASONS.find((r) => r.value === reason)?.label || reason}${notes ? ` — ${notes}` : ''}`,
          }),
        })
      }

      toast.success(`${businessName} marked as lost`)
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error('Failed to mark as lost')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            Mark as lost
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-gray-500">
            Mark {businessName} as a lost prospect. This helps track why deals don&apos;t close.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                Reason
              </label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select a reason...</option>
                {LOSS_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional context..."
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
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Mark as lost'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
