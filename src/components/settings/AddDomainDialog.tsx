'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'

interface AddDomainDialogProps {
  onAdded: () => void
}

export function AddDomainDialog({ onAdded }: AddDomainDialogProps) {
  const [open, setOpen] = useState(false)
  const [domain, setDomain] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [dailyLimit, setDailyLimit] = useState('20')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/settings/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domain.trim(),
          email_address: emailAddress.trim(),
          daily_send_limit: parseInt(dailyLimit, 10) || 20,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add domain')
      }

      setDomain('')
      setEmailAddress('')
      setDailyLimit('20')
      setOpen(false)
      onAdded()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary,#3E63DD)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover,#3358D4)]">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add domain
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            Add sending domain
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-gray-500">
            Add an email address you&apos;ve connected to Instantly for outreach.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                Domain
              </label>
              <input
                id="domain"
                type="text"
                placeholder="outreach.example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="hello@outreach.example.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="limit" className="block text-sm font-medium text-gray-700">
                Daily send limit
              </label>
              <input
                id="limit"
                type="number"
                min="1"
                max="200"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

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
                {saving ? 'Adding...' : 'Add domain'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
