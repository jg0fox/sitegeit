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

const FRAUNCES = "'Fraunces', Georgia, serif"

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

function MeetingTypeToggle({
  value,
  onChange,
}: {
  value: string
  onChange: (type: string) => void
}) {
  const options = [
    { key: 'zoom', icon: 'videocam', label: 'Zoom' },
    { key: 'phone', icon: 'call', label: 'Phone' },
  ]

  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5">
      {options.map((opt) => {
        const isActive = value === opt.key
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              isActive
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-[24px] text-blue-600">progress_activity</span>
          <p className="mt-2 text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    }>
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

  const guestTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const [meetingType, setMeetingType] = useState('phone')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const loadDays = useCallback(async () => {
    setLoadingDays(true)
    const monthStr = `${currentMonth.year}-${currentMonth.month.toString().padStart(2, '0')}`
    const res = await fetch(`/api/bookings/slots?month=${monthStr}`)
    if (res.ok) {
      const data = await res.json()
      setAvailableDays(data.days || [])
      if (data.config) {
        setConfig(data.config)
        if (data.config.default_meeting_type) {
          setMeetingType(data.config.default_meeting_type)
        }
      }
    }
    setLoadingDays(false)
  }, [currentMonth])

  useEffect(() => {
    loadDays()
  }, [loadDays])

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
          meeting_type: meetingType,
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

  // ═══════════ CONFIRMED STEP ═══════════
  if (step === 'confirmed' && booking) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://seitgeit.vercel.app'
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mb-6 flex justify-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' }}
          >
            <span className="material-symbols-outlined text-[36px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
        </div>
        <h1
          className="text-slate-900"
          style={{ fontFamily: FRAUNCES, fontSize: 'clamp(1.9rem, 1.5rem + 2vw, 2.25rem)', fontWeight: 700 }}
        >
          You&apos;re booked!
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          {formatDateLong(booking.start_time, guestTimezone)} at{' '}
          {formatTimeInTz(booking.start_time, guestTimezone)}
        </p>

        {booking.zoom_join_url && (
          <div className="mx-auto mt-8 max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-5 text-left">
            <div className="mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-blue-600">videocam</span>
              <span className="text-sm font-semibold text-slate-800">Join via Zoom</span>
            </div>
            <a
              href={booking.zoom_join_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              {booking.zoom_join_url}
            </a>
          </div>
        )}

        {!booking.zoom_join_url && booking.meeting_type === 'phone' && (
          <div className="mx-auto mt-8 max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-blue-600">call</span>
              <span className="text-sm font-medium text-slate-700">We&apos;ll call you at the scheduled time</span>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-3">
          <a
            href={`${appUrl}/book/reschedule/${booking.reschedule_token}`}
            className="text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
          >
            Need to reschedule?
          </a>
          <a
            href={`${appUrl}/book/cancel/${booking.cancel_token}`}
            className="text-sm text-slate-400 transition-colors hover:text-red-500"
          >
            Cancel booking
          </a>
        </div>
      </div>
    )
  }

  // ═══════════ FORM STEP ═══════════
  if (step === 'form' && selectedSlot) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <button
          onClick={() => setStep('select')}
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
          <h2
            className="text-slate-900"
            style={{ fontFamily: FRAUNCES, fontSize: 'clamp(1.35rem, 1.15rem + 1vw, 1.5rem)', fontWeight: 600 }}
          >
            Your details
          </h2>

          {/* Selected time summary */}
          <div
            className="mt-4 rounded-lg px-4 py-3"
            style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-blue-600">calendar_month</span>
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  {formatDateLong(selectedSlot.start, guestTimezone)} at{' '}
                  {formatTimeInTz(selectedSlot.start, guestTimezone)}
                </p>
                <p className="text-xs text-slate-500">
                  {config?.meeting_duration || 15} min
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-blue-100 pt-3">
              <span className="text-xs font-medium text-slate-500">Meeting type:</span>
              <MeetingTypeToggle value={meetingType} onChange={setMeetingType} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Phone *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Message (optional)</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Anything you'd like us to know..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 px-4 py-3.5 font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-blue-700 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0"
              style={{ fontFamily: FRAUNCES, fontSize: '1.0625rem' }}
            >
              {submitting ? 'Confirming...' : 'Confirm booking'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ═══════════ SELECT STEP ═══════════
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Hero heading */}
      <div className="mb-8 text-center">
        <h1
          className="text-slate-900"
          style={{
            fontFamily: FRAUNCES,
            fontSize: 'clamp(1.9rem, 1.5rem + 2vw, 2.25rem)',
            fontWeight: 700,
            lineHeight: 1.15,
          }}
        >
          {config?.booking_page_title || 'Book a Free Call'}
        </h1>
        <p className="mt-2 text-slate-600" style={{ fontSize: 'clamp(1.05rem, 1rem + 0.25vw, 1.125rem)' }}>
          {config?.booking_page_subtitle || 'Pick a time that works for you — no pressure, no pitch.'}
        </p>

        {/* Meeting details */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {config && (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                {config.meeting_duration} min
              </span>
              <MeetingTypeToggle value={meetingType} onChange={setMeetingType} />
            </>
          )}
        </div>
      </div>

      {/* Calendar card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Calendar */}
          <div>
            {loadingDays ? (
              <div className="flex h-64 items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-[24px] text-blue-600">progress_activity</span>
              </div>
            ) : (
              <Calendar
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
                availableDays={availableDays}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            )}
          </div>

          {/* Time slots */}
          <div className="border-t border-slate-100 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
            {!selectedDate ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 py-8 text-center">
                <span className="material-symbols-outlined text-[32px] text-slate-200">calendar_today</span>
                <p className="text-sm text-slate-400">Select a date to see available times</p>
              </div>
            ) : loadingSlots ? (
              <div className="flex h-full items-center justify-center py-8">
                <span className="material-symbols-outlined animate-spin text-[24px] text-blue-600">progress_activity</span>
              </div>
            ) : slots.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 py-8 text-center">
                <span className="material-symbols-outlined text-[32px] text-slate-200">event_busy</span>
                <p className="text-sm text-slate-400">No available times for this date</p>
              </div>
            ) : (
              <div>
                <p
                  className="mb-3 font-semibold text-slate-800"
                  style={{ fontFamily: FRAUNCES }}
                >
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                  {slots.map((slot) => (
                    <button
                      key={slot.start}
                      onClick={() => {
                        setSelectedSlot(slot)
                        setStep('form')
                      }}
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-all hover:-translate-y-px hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm"
                    >
                      {formatTimeInTz(slot.start, guestTimezone)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">public</span>
            {getTimezoneAbbr(guestTimezone)}
          </span>
        </div>
      </div>
    </div>
  )
}

// ═══════════ CALENDAR COMPONENT ═══════════
function Calendar({
  currentMonth,
  setCurrentMonth,
  availableDays,
  selectedDate,
  onSelectDate,
}: {
  currentMonth: { year: number; month: number }
  setCurrentMonth: (m: { year: number; month: number }) => void
  availableDays: string[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
}) {
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
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => {
            const prev = month === 1
              ? { year: year - 1, month: 12 }
              : { year, month: month - 1 }
            setCurrentMonth(prev)
          }}
          disabled={!canGoPrev}
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        <span
          className="font-semibold text-slate-900"
          style={{ fontFamily: FRAUNCES }}
        >
          {monthName}
        </span>
        <button
          onClick={() => {
            const next = month === 12
              ? { year: year + 1, month: 1 }
              : { year, month: month + 1 }
            setCurrentMonth(next)
          }}
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="py-1.5 text-xs font-semibold uppercase text-slate-400" style={{ letterSpacing: '0.05em' }}>
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />

          const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
          const isAvailable = availableDays.includes(dateStr)
          const isSelected = selectedDate === dateStr

          return (
            <button
              key={dateStr}
              onClick={() => isAvailable && onSelectDate(dateStr)}
              disabled={!isAvailable}
              className={`rounded-lg py-2.5 text-sm transition-all ${
                isSelected
                  ? 'bg-blue-600 font-semibold text-white shadow-sm'
                  : isAvailable
                    ? 'font-medium text-slate-900 hover:bg-blue-50 hover:text-blue-700'
                    : 'text-slate-300'
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
