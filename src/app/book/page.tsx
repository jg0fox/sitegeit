'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'

interface SlotConfig {
  meeting_duration: number
  default_meeting_type: string
  timezone: string
  booking_page_title: string
  booking_page_subtitle: string
}

interface TimeSlot {
  start: string
  end: string
}

interface BookingResult {
  id: string
  start_time: string
  end_time: string
  guest_name: string
  guest_email: string
  meeting_type: string
  zoom_join_url?: string
  reschedule_token: string
  cancel_token: string
}

type Step = 'select' | 'form' | 'confirmed'

function formatTimeInTz(isoString: string, timezone: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
    hour12: true,
  })
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

function getTimezoneAbbr(timezone: string): string {
  const abbr = new Date().toLocaleString('en-US', { timeZone: timezone, timeZoneName: 'short' })
  return abbr.split(' ').pop() || timezone
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-sm text-gray-400">Loading...</p></div>}>
      <BookingPageContent />
    </Suspense>
  )
}

function BookingPageContent() {
  const searchParams = useSearchParams()
  const businessId = searchParams.get('ref')

  const [config, setConfig] = useState<SlotConfig | null>(null)
  const [availableDays, setAvailableDays] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [loadingDays, setLoadingDays] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState<Step>('select')
  const [booking, setBooking] = useState<BookingResult | null>(null)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() + 1 }
  })

  // Guest timezone for display
  const guestTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  // Load available days for the current month
  const loadDays = useCallback(async () => {
    setLoadingDays(true)
    const monthStr = `${currentMonth.year}-${currentMonth.month.toString().padStart(2, '0')}`
    const res = await fetch(`/api/bookings/slots?month=${monthStr}`)
    if (res.ok) {
      const data = await res.json()
      setAvailableDays(data.days || [])
      if (data.config) setConfig(data.config)
    }
    setLoadingDays(false)
  }, [currentMonth])

  useEffect(() => {
    loadDays()
  }, [loadDays])

  // Load slots when a date is selected
  const loadSlots = useCallback(async (date: string) => {
    setLoadingSlots(true)
    setSelectedSlot(null)
    const res = await fetch(`/api/bookings/slots?date=${date}`)
    if (res.ok) {
      const data = await res.json()
      setSlots(data.slots || [])
    }
    setLoadingSlots(false)
  }, [])

  useEffect(() => {
    if (selectedDate) loadSlots(selectedDate)
  }, [selectedDate, loadSlots])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSlot || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_time: selectedSlot.start,
          end_time: selectedSlot.end,
          guest_name: form.name,
          guest_email: form.email,
          guest_phone: form.phone || undefined,
          guest_message: form.message || undefined,
          business_id: businessId || undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setBooking(data)
        setStep('confirmed')
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to create booking')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Calendar grid generation
  function renderCalendar() {
    const { year, month } = currentMonth
    const firstDay = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })

    const cells: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let i = 1; i <= daysInMonth; i++) cells.push(i)

    const canGoPrev = currentMonth.year > new Date().getFullYear() ||
      (currentMonth.year === new Date().getFullYear() && currentMonth.month > new Date().getMonth() + 1)

    return (
      <div>
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => {
              const prev = currentMonth.month === 1
                ? { year: currentMonth.year - 1, month: 12 }
                : { year: currentMonth.year, month: currentMonth.month - 1 }
              setCurrentMonth(prev)
            }}
            disabled={!canGoPrev}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <span className="text-sm font-semibold text-gray-900">{monthName}</span>
          <button
            onClick={() => {
              const next = currentMonth.month === 12
                ? { year: currentMonth.year + 1, month: 1 }
                : { year: currentMonth.year, month: currentMonth.month + 1 }
              setCurrentMonth(next)
            }}
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="py-1 text-xs font-medium text-gray-400">{d}</div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />

            const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
            const isAvailable = availableDays.includes(dateStr)
            const isSelected = selectedDate === dateStr

            return (
              <button
                key={dateStr}
                onClick={() => isAvailable && setSelectedDate(dateStr)}
                disabled={!isAvailable}
                className={`rounded-md py-2 text-sm transition-colors ${
                  isSelected
                    ? 'bg-primary font-semibold text-white'
                    : isAvailable
                      ? 'font-medium text-gray-900 hover:bg-primary/10'
                      : 'text-gray-300'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Confirmation step
  if (step === 'confirmed' && booking) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://seitgeit.vercel.app'
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="material-symbols-outlined text-[32px] text-green-600">check_circle</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">You&apos;re booked!</h1>
        <p className="mt-2 text-gray-500">
          {formatDateLong(booking.start_time, guestTimezone)} at{' '}
          {formatTimeInTz(booking.start_time, guestTimezone)}
        </p>

        {booking.zoom_join_url && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-700">Join via Zoom</p>
            <a
              href={booking.zoom_join_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 text-sm text-primary hover:underline"
            >
              {booking.zoom_join_url}
            </a>
          </div>
        )}

        {!booking.zoom_join_url && booking.meeting_type === 'phone' && (
          <p className="mt-4 text-sm text-gray-500">
            We&apos;ll call you at the scheduled time.
          </p>
        )}

        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href={`${appUrl}/book/reschedule/${booking.reschedule_token}`}
            className="text-sm text-gray-500 hover:text-primary hover:underline"
          >
            Need to reschedule?
          </a>
          <a
            href={`${appUrl}/book/cancel/${booking.cancel_token}`}
            className="text-sm text-gray-500 hover:text-red-500 hover:underline"
          >
            Cancel booking
          </a>
        </div>
      </div>
    )
  }

  // Booking form step
  if (step === 'form' && selectedSlot) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <button
          onClick={() => setStep('select')}
          className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back
        </button>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Your details</h2>
          <div className="mt-2 rounded-lg bg-primary/5 px-3 py-2">
            <p className="text-sm font-medium text-primary">
              {formatDateLong(selectedSlot.start, guestTimezone)} at{' '}
              {formatTimeInTz(selectedSlot.start, guestTimezone)}
            </p>
            <p className="text-xs text-gray-500">
              {config?.meeting_duration || 15} min &middot;{' '}
              {config?.default_meeting_type === 'zoom' ? 'Zoom meeting' : config?.default_meeting_type === 'phone' ? 'Phone call' : 'In person'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Message (optional)</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Anything you'd like us to know..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? 'Confirming...' : 'Confirm booking'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Date + slot selection step
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {config?.booking_page_title || 'Book a Call'}
        </h1>
        <p className="mt-1 text-gray-500">
          {config?.booking_page_subtitle || 'Pick a time that works for you.'}
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Calendar */}
          <div>
            {loadingDays ? (
              <div className="flex h-64 items-center justify-center">
                <p className="text-sm text-gray-400">Loading calendar...</p>
              </div>
            ) : (
              renderCalendar()
            )}
          </div>

          {/* Time slots */}
          <div>
            {!selectedDate ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-gray-400">Select a date to see available times</p>
              </div>
            ) : loadingSlots ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-gray-400">Loading available times...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-gray-400">No available times for this date</p>
              </div>
            ) : (
              <div>
                <p className="mb-3 text-sm font-medium text-gray-700">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot?.start === slot.start
                    return (
                      <button
                        key={slot.start}
                        onClick={() => {
                          setSelectedSlot(slot)
                          setStep('form')
                        }}
                        className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 text-gray-700 hover:border-primary/30 hover:bg-gray-50'
                        }`}
                      >
                        {formatTimeInTz(slot.start, guestTimezone)}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-xs text-gray-400">
          <span>
            Showing times in {getTimezoneAbbr(guestTimezone)}
          </span>
          {config && (
            <>
              <span>{config.meeting_duration} min</span>
              <span>
                {config.default_meeting_type === 'zoom'
                  ? 'Zoom meeting'
                  : config.default_meeting_type === 'phone'
                    ? 'Phone call'
                    : 'In person'}
              </span>
            </>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-gray-300">
        Powered by Sitegeit
      </p>
    </div>
  )
}
