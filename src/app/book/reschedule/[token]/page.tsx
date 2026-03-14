'use client'

import { useEffect, useState, useCallback, use } from 'react'

const FRAUNCES = "'Fraunces', Georgia, serif"

interface TimeSlot {
  start: string
  end: string
}

interface BookingInfo {
  id: string
  start_time: string
  end_time: string
  guest_name: string
  meeting_type: string
  status: string
}

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

export default function ReschedulePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const guestTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const [booking, setBooking] = useState<BookingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableDays, setAvailableDays] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [newTime, setNewTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() + 1 }
  })

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/bookings/lookup?reschedule_token=${token}`)
      if (res.ok) {
        setBooking(await res.json())
      } else {
        setError('Invalid or expired reschedule link.')
      }
      setLoading(false)
    }
    load()
  }, [token])

  const loadDays = useCallback(async () => {
    const monthStr = `${currentMonth.year}-${currentMonth.month.toString().padStart(2, '0')}`
    const res = await fetch(`/api/bookings/slots?month=${monthStr}`)
    if (res.ok) {
      const data = await res.json()
      setAvailableDays(data.days || [])
    }
  }, [currentMonth])

  useEffect(() => {
    if (booking) loadDays()
  }, [booking, loadDays])

  useEffect(() => {
    if (!selectedDate) return
    setLoadingSlots(true)
    fetch(`/api/bookings/slots?date=${selectedDate}`)
      .then(r => r.json())
      .then(data => setSlots(data.slots || []))
      .finally(() => setLoadingSlots(false))
  }, [selectedDate])

  async function handleReschedule(slot: TimeSlot) {
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          start_time: slot.start,
          end_time: slot.end,
        }),
      })
      if (res.ok) {
        setNewTime(slot.start)
        setDone(true)
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to reschedule')
      }
    } catch {
      alert('Something went wrong')
    } finally {
      setSubmitting(false)
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

  if (booking.status === 'cancelled') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <span className="material-symbols-outlined text-[32px] text-slate-400">event_busy</span>
          </div>
        </div>
        <h1
          className="text-slate-900"
          style={{ fontFamily: FRAUNCES, fontSize: 'clamp(1.35rem, 1.15rem + 1vw, 1.5rem)', fontWeight: 600 }}
        >
          This booking was cancelled
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

  if (done && newTime) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mb-6 flex justify-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' }}
          >
            <span
              className="material-symbols-outlined text-[36px] text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
        </div>
        <h1
          className="text-slate-900"
          style={{ fontFamily: FRAUNCES, fontSize: 'clamp(1.9rem, 1.5rem + 2vw, 2.25rem)', fontWeight: 700 }}
        >
          Rescheduled!
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Your new time is {formatDateLong(newTime, guestTimezone)} at{' '}
          {formatTimeInTz(newTime, guestTimezone)}.
        </p>
      </div>
    )
  }

  // Calendar + slot selection
  const { year, month } = currentMonth
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(i)

  const canGoPrev = currentMonth.year > new Date().getFullYear() ||
    (currentMonth.year === new Date().getFullYear() && currentMonth.month > new Date().getMonth() + 1)

  const meetingLabel =
    booking.meeting_type === 'zoom' ? 'Zoom meeting'
      : booking.meeting_type === 'phone' ? 'Phone call'
        : 'In person'

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
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
          Reschedule your booking
        </h1>
        <div
          className="mx-auto mt-4 inline-flex items-center gap-3 rounded-lg px-4 py-2.5"
          style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}
        >
          <span className="material-symbols-outlined text-[18px] text-blue-600">event</span>
          <p className="text-sm font-medium text-blue-700">
            Currently: {formatDateLong(booking.start_time, guestTimezone)} at{' '}
            {formatTimeInTz(booking.start_time, guestTimezone)}
            <span className="text-blue-500"> &middot; {meetingLabel}</span>
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Calendar */}
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
                if (day === null) return <div key={`e-${i}`} />
                const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
                const isAvailable = availableDays.includes(dateStr)
                const isSelected = selectedDate === dateStr
                return (
                  <button
                    key={dateStr}
                    onClick={() => isAvailable && setSelectedDate(dateStr)}
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

          {/* Time slots */}
          <div className="border-t border-slate-100 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
            {!selectedDate ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 py-8 text-center">
                <span className="material-symbols-outlined text-[32px] text-slate-200">calendar_today</span>
                <p className="text-sm text-slate-400">Select a new date</p>
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
                      onClick={() => handleReschedule(slot)}
                      disabled={submitting}
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-all hover:-translate-y-px hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm disabled:opacity-50"
                    >
                      {formatTimeInTz(slot.start, guestTimezone)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
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
