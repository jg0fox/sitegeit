/**
 * Generate an ICS (iCalendar) file content string for a booking event.
 */
export function generateICS({
  summary,
  description,
  start,
  end,
  location,
  organizerEmail,
  organizerName,
  attendeeEmail,
  attendeeName,
}: {
  summary: string
  description?: string
  start: Date
  end: Date
  location?: string
  organizerEmail?: string
  organizerName?: string
  attendeeEmail?: string
  attendeeName?: string
}): string {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@sitegeit.com`
  const now = formatDate(new Date())

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SimpleInstantSite//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `SUMMARY:${escapeICS(summary)}`,
  ]

  if (description) {
    lines.push(`DESCRIPTION:${escapeICS(description)}`)
  }

  if (location) {
    lines.push(`LOCATION:${escapeICS(location)}`)
  }

  if (organizerEmail) {
    const cn = organizerName ? `;CN=${escapeICS(organizerName)}` : ''
    lines.push(`ORGANIZER${cn}:mailto:${organizerEmail}`)
  }

  if (attendeeEmail) {
    const cn = attendeeName ? `;CN=${escapeICS(attendeeName)}` : ''
    lines.push(`ATTENDEE;PARTSTAT=ACCEPTED${cn}:mailto:${attendeeEmail}`)
  }

  lines.push('STATUS:CONFIRMED')
  lines.push('END:VEVENT')
  lines.push('END:VCALENDAR')

  return lines.join('\r\n')
}

function formatDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}
