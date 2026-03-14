'use client'

import { useEffect, useState, use } from 'react'

const FRAUNCES = "'Fraunces', Georgia, serif"

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
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-[24px] text-blue-600">progress_activity</span>
          <p className="mt-2 text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <span className="material-symbols-outlined text-[32px] text-red-400">error</span>
          </div>
        </div>
        <h1
          className="text-slate-900"
          style={{ fontFamily: FRAUNCES, fontSize: 'clamp(1.35rem, 1.15rem + 1vw, 1.5rem)', fontWeight: 600 }}
        >
          {error || 'Booking not found'}
        </h1>
        <a
          href="/book"
          className="mt-4 inline-block text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
        >
          Book a new time
        </a>
      </div>
    )
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <span
              className="material-symbols-outlined text-[36px] text-slate-400"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              event_busy
            </span>
          </div>
        </div>
        <h1
          className="text-slate-900"
          style={{ fontFamily: FRAUNCES, fontSize: 'clamp(1.9rem, 1.5rem + 2vw, 2.25rem)', fontWeight: 700 }}
        >
          Booking cancelled
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Your booking on {formatDateLong(booking.start_time, guestTimezone)} has been cancelled.
        </p>
        <a
          href="/book"
          className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-blue-700 hover:shadow-md"
          style={{ fontFamily: FRAUNCES, fontSize: '1.0625rem' }}
        >
          Book a new time
        </a>
      </div>
    )
  }

  const meetingLabel =
    booking.meeting_type === 'zoom' ? 'Zoom meeting'
      : booking.meeting_type === 'phone' ? 'Phone call'
        : 'In person'
  const meetingIcon =
    booking.meeting_type === 'zoom' ? 'videocam'
      : booking.meeting_type === 'phone' ? 'call'
        : 'location_on'

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
        <h1
          className="text-slate-900"
          style={{ fontFamily: FRAUNCES, fontSize: 'clamp(1.35rem, 1.15rem + 1vw, 1.5rem)', fontWeight: 600 }}
        >
          Cancel your booking
        </h1>

        <div
          className="mt-4 flex items-center gap-3 rounded-lg px-4 py-3"
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
        >
          <span className="material-symbols-outlined text-[20px] text-slate-400">{meetingIcon}</span>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {formatDateLong(booking.start_time, guestTimezone)} at{' '}
              {formatTimeInTz(booking.start_time, guestTimezone)}
            </p>
            <p className="text-xs text-slate-500">{meetingLabel}</p>
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-sm font-semibold text-slate-700">
            Reason (optional)
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="mt-6 w-full rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition-all hover:border-red-300 hover:bg-red-100"
          >
            Cancel booking
          </button>
        ) : (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              Are you sure? This cannot be undone.
            </p>
            <div className="mt-3 flex gap-3">
              <button
                onClick={handleCancel}
                disabled={confirming}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 disabled:opacity-50"
              >
                {confirming ? 'Cancelling...' : 'Yes, cancel'}
              </button>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
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
