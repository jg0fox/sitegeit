'use client'

import { useEffect, useState, useCallback, use } from 'react'

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

  // Load booking info
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

  // Load available days
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

  if (booking.status === 'cancelled') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-gray-900">This booking was cancelled</h1>
        <a href="/book" className="mt-4 inline-block text-sm text-primary hover:underline">
          Book a new time
        </a>
      </div>
    )
  }

  if (done && newTime) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="material-symbols-outlined text-[32px] text-green-600">check_circle</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Rescheduled!</h1>
        <p className="mt-2 text-gray-500">
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Reschedule your booking</h1>
        <p className="mt-1 text-gray-500">
          Currently: {formatDateLong(booking.start_time, guestTimezone)} at{' '}
          {formatTimeInTz(booking.start_time, guestTimezone)}
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => setCurrentMonth(m => m.month === 1 ? { year: m.year - 1, month: 12 } : { year: m.year, month: m.month - 1 })}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <span className="text-sm font-semibold text-gray-900">{monthName}</span>
              <button
                onClick={() => setCurrentMonth(m => m.month === 12 ? { year: m.year + 1, month: 1 } : { year: m.year, month: m.month + 1 })}
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
                if (day === null) return <div key={`e-${i}`} />
                const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
                const isAvailable = availableDays.includes(dateStr)
                const isSelected = selectedDate === dateStr
                return (
                  <button
                    key={dateStr}
                    onClick={() => isAvailable && setSelectedDate(dateStr)}
                    disabled={!isAvailable}
                    className={`rounded-md py-2 text-sm transition-colors ${
                      isSelected ? 'bg-primary font-semibold text-white'
                        : isAvailable ? 'font-medium text-gray-900 hover:bg-primary/10'
                          : 'text-gray-300'
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            {!selectedDate ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-gray-400">Select a new date</p>
              </div>
            ) : loadingSlots ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-gray-400">Loading times...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-gray-400">No available times</p>
              </div>
            ) : (
              <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                {slots.map((slot) => (
                  <button
                    key={slot.start}
                    onClick={() => handleReschedule(slot)}
                    disabled={submitting}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:border-primary/30 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {formatTimeInTz(slot.start, guestTimezone)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-400">
          Showing times in {getTimezoneAbbr(guestTimezone)}
        </div>
      </div>
    </div>
  )
}
