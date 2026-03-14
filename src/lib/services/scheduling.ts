/**
 * Slot Calculation Engine
 *
 * Core scheduling logic that computes available booking slots
 * for a given date. Handles timezone conversion, buffer times,
 * minimum notice, busy period exclusion, and day-of-week rules.
 */

import { getAdminClient } from '@/lib/supabase/admin'
import { getFreeBusy, type BusySlot } from './google-calendar'

// ── Types ──────────────────────────────────────────────

export interface SchedulingConfig {
  id: string
  user_id: string
  available_days: string[]
  available_hours: { start: string; end: string }
  day_overrides: Record<string, { start: string; end: string }>
  meeting_duration: number
  buffer_time: number
  min_notice: number
  max_advance_days: number
  timezone: string
  default_meeting_type: string
  default_location: string | null
  booking_page_title: string
  booking_page_subtitle: string
}

export interface TimeSlot {
  start: string // ISO string
  end: string   // ISO string
}

// ── Helpers ────────────────────────────────────────────

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

/**
 * Get the day name from a Date in a specific timezone.
 */
function getDayName(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: timezone })
  return formatter.format(date).toLowerCase()
}

/**
 * Create a Date object for a specific time on a specific date in a specific timezone.
 * e.g., "2026-03-15" at "09:00" in "America/Phoenix"
 *
 * Uses Intl.DateTimeFormat to determine the UTC offset for the target timezone
 * on the given date, then constructs the correct UTC timestamp.
 */
function createDateInTimezone(dateStr: string, timeStr: string, timezone: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number)

  // Use a reference point at noon on the target date to determine the timezone offset
  const refDate = new Date(`${dateStr}T12:00:00Z`)

  const tzFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
  const utcFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })

  const getPart = (parts: Intl.DateTimeFormatPart[], type: string) =>
    parseInt(parts.find(p => p.type === type)?.value || '0')

  const tzParts = tzFormatter.formatToParts(refDate)
  const utcParts = utcFormatter.formatToParts(refDate)

  const tzHour = getPart(tzParts, 'hour')
  const utcHour = getPart(utcParts, 'hour')
  const tzDay = getPart(tzParts, 'day')
  const utcDay = getPart(utcParts, 'day')

  let offsetHours = tzHour - utcHour
  if (tzDay > utcDay) offsetHours += 24
  if (tzDay < utcDay) offsetHours -= 24

  // Create the UTC date that corresponds to the target local time
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, hours - offsetHours, minutes))
}

/**
 * Get the date string (YYYY-MM-DD) in a specific timezone.
 */
function getDateString(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: timezone })
  return formatter.format(date)
}

/**
 * Check if two time ranges overlap.
 */
function overlaps(slot: TimeSlot, busy: BusySlot): boolean {
  const slotStart = new Date(slot.start).getTime()
  const slotEnd = new Date(slot.end).getTime()
  const busyStart = new Date(busy.start).getTime()
  const busyEnd = new Date(busy.end).getTime()
  return slotStart < busyEnd && slotEnd > busyStart
}

// ── Main Function ──────────────────────────────────────

/**
 * Load the scheduling config for a user.
 */
export async function getSchedulingConfig(userId: string): Promise<SchedulingConfig | null> {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from('scheduling_config')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data as SchedulingConfig | null
}

/**
 * Get the first operator user ID. For now we have a single operator,
 * so this returns the first user.
 */
export async function getOperatorUserId(): Promise<string | null> {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from('users')
    .select('id')
    .limit(1)
    .single()
  return data?.id || null
}

/**
 * Calculate available time slots for a given date.
 *
 * Algorithm:
 * 1. Load scheduling_config for the user
 * 2. Check day-of-week is available
 * 3. Check date is within max_advance_days window
 * 4. Get hours for the day (overrides or defaults)
 * 5. Generate all possible slots
 * 6. Fetch Google Calendar free/busy
 * 7. Remove slots that overlap with busy periods
 * 8. Remove slots before now + min_notice
 * 9. Also remove slots that overlap with existing bookings
 */
export async function getAvailableSlots(
  userId: string,
  dateStr: string // YYYY-MM-DD
): Promise<TimeSlot[]> {
  const config = await getSchedulingConfig(userId)
  if (!config) return []

  const timezone = config.timezone

  // 1. Check day-of-week
  // Parse the date string to get the day in the operator's timezone
  const targetDate = new Date(`${dateStr}T12:00:00Z`) // noon UTC as reference
  const dayName = getDayName(targetDate, timezone)

  if (!config.available_days.includes(dayName)) {
    return []
  }

  // 2. Check max_advance_days window
  const now = new Date()
  const maxDate = new Date(now)
  maxDate.setDate(maxDate.getDate() + config.max_advance_days)

  if (targetDate > maxDate) {
    return []
  }

  // Also reject past dates
  const todayStr = getDateString(now, timezone)
  if (dateStr < todayStr) {
    return []
  }

  // 3. Get hours for this day
  const hours = config.day_overrides[dayName] || config.available_hours
  const [startH, startM] = hours.start.split(':').map(Number)
  const [endH, endM] = hours.end.split(':').map(Number)

  // 4. Generate all possible slots
  const slots: TimeSlot[] = []
  let currentMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM

  while (currentMinutes + config.meeting_duration <= endMinutes) {
    const slotStartH = Math.floor(currentMinutes / 60)
    const slotStartM = currentMinutes % 60
    const slotEndMinutes = currentMinutes + config.meeting_duration
    const slotEndH = Math.floor(slotEndMinutes / 60)
    const slotEndM = slotEndMinutes % 60

    const startTime = `${slotStartH.toString().padStart(2, '0')}:${slotStartM.toString().padStart(2, '0')}`
    const endTime = `${slotEndH.toString().padStart(2, '0')}:${slotEndM.toString().padStart(2, '0')}`

    const slotStart = createDateInTimezone(dateStr, startTime, timezone)
    const slotEnd = createDateInTimezone(dateStr, endTime, timezone)

    slots.push({
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
    })

    currentMinutes += config.meeting_duration + config.buffer_time
  }

  if (slots.length === 0) return []

  // 5. Fetch Google Calendar free/busy for the day
  let busySlots: BusySlot[] = []
  try {
    const dayStart = createDateInTimezone(dateStr, hours.start, timezone)
    const dayEnd = createDateInTimezone(dateStr, hours.end, timezone)
    busySlots = await getFreeBusy(userId, dayStart, dayEnd)
  } catch (err) {
    // If Google Calendar is not connected, proceed without free/busy filtering
    console.warn('[scheduling] Could not fetch free/busy (calendar may not be connected):', err)
  }

  // 6. Also check existing bookings
  const supabase = getAdminClient()
  const dayStartIso = slots[0].start
  const dayEndIso = slots[slots.length - 1].end
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('user_id', userId)
    .in('status', ['confirmed', 'rescheduled'])
    .gte('start_time', dayStartIso)
    .lte('end_time', dayEndIso)

  const bookingBusySlots: BusySlot[] = (existingBookings || []).map((b) => ({
    start: b.start_time,
    end: b.end_time,
  }))

  const allBusySlots = [...busySlots, ...bookingBusySlots]

  // 7. Filter out busy slots and min_notice
  const minNoticeTime = new Date(now.getTime() + config.min_notice * 60 * 1000)

  return slots.filter((slot) => {
    // Remove slots that start before min_notice
    if (new Date(slot.start) < minNoticeTime) {
      return false
    }

    // Remove slots that overlap with busy periods
    for (const busy of allBusySlots) {
      if (overlaps(slot, busy)) {
        return false
      }
    }

    return true
  })
}

/**
 * Get available days for a month. Returns an array of date strings (YYYY-MM-DD)
 * that have at least potential availability (correct day of week, within window).
 * Does NOT check free/busy — that's done per-day when the user selects a date.
 */
export async function getAvailableDays(
  userId: string,
  year: number,
  month: number // 1-12
): Promise<string[]> {
  const config = await getSchedulingConfig(userId)
  if (!config) return []

  const now = new Date()
  const timezone = config.timezone
  const todayStr = getDateString(now, timezone)

  const maxDate = new Date(now)
  maxDate.setDate(maxDate.getDate() + config.max_advance_days)
  const maxDateStr = getDateString(maxDate, timezone)

  const availableDays: string[] = []
  const daysInMonth = new Date(year, month, 0).getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`

    // Skip past dates
    if (dateStr < todayStr) continue
    // Skip dates beyond booking window
    if (dateStr > maxDateStr) continue

    // Check day of week
    const date = new Date(`${dateStr}T12:00:00Z`)
    const dayName = getDayName(date, timezone)
    if (!config.available_days.includes(dayName)) continue

    availableDays.push(dateStr)
  }

  return availableDays
}
