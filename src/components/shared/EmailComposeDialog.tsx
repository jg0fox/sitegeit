'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface EmailComposeDialogProps {
  recipientEmail: string
  recipientName: string
  businessId?: string
  bookingId?: string
  defaultSubject?: string
  onClose: () => void
  onSent?: () => void
}

export function EmailComposeDialog({
  recipientEmail,
  recipientName,
  businessId,
  bookingId,
  defaultSubject = '',
  onClose,
  onSent,
}: EmailComposeDialogProps) {
  const [subject, setSubject] = useState(defaultSubject)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [accounts, setAccounts] = useState<{ email: string }[]>([])
  const [fromEmail, setFromEmail] = useState('')

  useEffect(() => {
    async function loadAccounts() {
      try {
        const res = await fetch('/api/settings/domains')
        if (res.ok) {
          const data = await res.json()
          const accts = (Array.isArray(data) ? data : []).map(
            (d: { email_address: string }) => ({ email: d.email_address })
          )
          setAccounts(accts)
          if (accts.length > 0) setFromEmail(accts[0].email)
        }
      } catch {
        // silently fail
      }
    }
    loadAccounts()
  }, [])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!fromEmail || !subject || !body) return

    setSending(true)
    try {
      // Use bookings email endpoint if booking context, otherwise unified send
      const endpoint = bookingId ? '/api/bookings/email' : '/api/emails/send'
      const payload = bookingId
        ? { booking_id: bookingId, from_email: fromEmail, to_email: recipientEmail, subject, body }
        : { from_email: fromEmail, to_email: recipientEmail, subject, body, business_id: businessId }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(`Email sent to ${recipientName}`)
        onSent?.()
        onClose()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to send email')
      }
    } catch {
      toast.error('Failed to send email')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Email {recipientName}</h3>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="w-12 text-gray-500">To:</span>
            <span className="font-medium text-gray-900">{recipientEmail}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <label htmlFor="compose-from" className="w-12 text-gray-500">From:</label>
            {accounts.length === 0 ? (
              <span className="text-xs text-red-500">No sending accounts configured in Instantly</span>
            ) : (
              <select
                id="compose-from"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                className="flex-1 rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {accounts.map((a) => (
                  <option key={a.email} value={a.email}>{a.email}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="compose-subject" className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              id="compose-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="compose-body" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              id="compose-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={6}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Write your message..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || !fromEmail || !body}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
