'use client'

import { useEffect, useState, use } from 'react'

interface BookingInfo {
  id: string
  start_time: string
  guest_name: string
  meeting_type: string
  status: string
}

function formatDateLong(isoString: string, timezone: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timezone,
  })
}

function formatTimeInTz(isoString: string, timezone: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
    hour12: true,
  })
}

const CANCEL_REASONS = [
  'Schedule conflict',
  'No longer interested',
  'Found another provider',
  'Other',
]

export default function CancelPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const guestTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const [booking, setBooking] = useState<BookingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/bookings/lookup?cancel_token=${token}`)
      if (res.ok) {
        const data = await res.json()
        setBooking(data)
        // Already cancelled — show that state
        if (data.status === 'cancelled') {
          setDone(true)
        }
      } else {
        setError('Invalid or expired cancel link.')
      }
      setLoading(false)
    }
    load()
  }, [token])

  async function handleCancel() {
    if (confirming) return
    setConfirming(true)
    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, reason: reason || undefined }),
      })
      if (res.ok) {
        setDone(true)
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to cancel')
      }
    } catch {
      alert('Something went wrong')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mb-4 flex justify-center">
          <span className="material-symbols-outlined text-[48px] text-red-400">error</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">{error || 'Booking not found'}</h1>
        <a href="/book" className="mt-4 inline-block text-sm text-primary hover:underline">
          Book a new time
        </a>
      </div>
    )
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <span className="material-symbols-outlined text-[32px] text-gray-400">event_busy</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Booking cancelled</h1>
        <p className="mt-2 text-gray-500">
          Your booking on {formatDateLong(booking.start_time, guestTimezone)} has been cancelled.
        </p>
        <a
          href="/book"
          className="mt-6 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
        >
          Book a new time
        </a>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Cancel your booking</h1>

        <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3">
          <p className="text-sm font-medium text-gray-700">
            {formatDateLong(booking.start_time, guestTimezone)}
          </p>
          <p className="text-sm text-gray-500">
            {formatTimeInTz(booking.start_time, guestTimezone)} &middot;{' '}
            {booking.meeting_type === 'zoom' ? 'Zoom meeting' : booking.meeting_type === 'phone' ? 'Phone call' : 'In person'}
          </p>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Reason (optional)
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">Select a reason...</option>
            {CANCEL_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {!showConfirmDialog ? (
          <button
            onClick={() => setShowConfirmDialog(true)}
            className="mt-6 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            Cancel booking
          </button>
        ) : (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              Are you sure? This cannot be undone.
            </p>
            <div className="mt-3 flex gap-3">
              <button
                onClick={handleCancel}
                disabled={confirming}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {confirming ? 'Cancelling...' : 'Yes, cancel'}
              </button>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Keep booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
