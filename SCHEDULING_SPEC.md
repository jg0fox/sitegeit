# Build: Sitegeit Scheduling — Custom Booking Tool

This is a standalone feature build within the Sitegeit codebase. It
replaces the current Calendly integration with a self-hosted scheduling
tool that integrates directly with the Sitegeit pipeline.

## Step 0: Audit Existing Calendly Code

Before writing any new code, find and document all existing
Calendly-related code in the codebase:

- Calendly links in the landing page (`/sites/go/[slug]`)
- Calendly link field in the `users` table and settings UI
- Any Calendly webhook handlers or API integrations
- Any references to `calendly.com` in components, templates, or
  generated content (landing pages, emails)
- The scheduling CTA sections on the outreach landing page

Write a list of every file that references Calendly. You'll replace
these references as you build, but you need the full inventory first.
Do NOT remove Calendly references until the replacement is functional.

---

## What to Build

A complete scheduling system with:
- Operator availability configuration
- Google Calendar integration (read free/busy, create events)
- Zoom meeting link generation
- Public booking page for prospects
- Rescheduling and cancellation flows
- Pipeline integration (booking → status update)
- Replacement of all Calendly references

---

## Task 1: Google Calendar API Integration

### OAuth Setup

Set up Google OAuth for calendar access:

- Use Google Cloud Console credentials (OAuth 2.0 client ID)
- Required scopes:
  - `https://www.googleapis.com/auth/calendar.freebusy` (read availability)
  - `https://www.googleapis.com/auth/calendar.events` (create/update/delete events)
- Store refresh token in the `users` table (add `google_calendar_token`
  jsonb column — encrypted at rest)
- Build a "Connect Google Calendar" button in Settings that initiates
  the OAuth flow and stores the token on callback
- Handle token refresh automatically (Google tokens expire after 1 hour)

### Core Calendar Functions

```typescript
// Check availability for a date range
getFreeBusy(calendarId: string, timeMin: Date, timeMax: Date): BusySlot[]

// Create a calendar event
createEvent(calendarId: string, event: {
  summary: string
  description: string
  start: Date
  end: Date
  attendees: { email: string; name?: string }[]
  conferenceData?: ZoomLink  // or Google Meet
  location?: string
}): CalendarEvent

// Update an event (for rescheduling)
updateEvent(calendarId: string, eventId: string, updates: Partial<Event>): CalendarEvent

// Delete an event (for cancellation)
deleteEvent(calendarId: string, eventId: string): void
```

### Environment Variables

```
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=
```

---

## Task 2: Zoom Integration

### OAuth Setup

Set up Zoom OAuth for meeting creation:

- Use Zoom Marketplace OAuth app (server-to-server or user-level)
- Required scopes: `meeting:write`
- Store refresh token in the `users` table (add `zoom_token` jsonb
  column)
- Build a "Connect Zoom" button in Settings alongside Google Calendar

### Meeting Creation

```typescript
createZoomMeeting(options: {
  topic: string
  startTime: Date
  duration: number  // minutes
  agenda?: string
}): { join_url: string; meeting_id: string }
```

When a booking is confirmed, generate a Zoom link and:
- Add it to the Google Calendar event as the location/conference link
- Include it in the confirmation email to the prospect
- Store it on the booking record

### Fallback

If Zoom is not connected, skip Zoom link generation. Show the booking
as an in-person or phone meeting instead. The calendar event description
should say "Phone call — we'll call you at {prospect_phone}" as the
default when no Zoom is configured.

---

## Task 3: Availability Configuration

### Database Schema

Add a new table:

```sql
CREATE TABLE scheduling_config (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(id) UNIQUE,
  -- Availability windows
  available_days    jsonb NOT NULL DEFAULT '["monday","tuesday","wednesday","thursday","friday"]',
  available_hours   jsonb NOT NULL DEFAULT '{"start":"09:00","end":"17:00"}',
  -- Per-day overrides (optional)
  day_overrides     jsonb DEFAULT '{}',
    -- e.g. { "friday": { "start": "09:00", "end": "14:00" } }
  -- Meeting settings
  meeting_duration  integer NOT NULL DEFAULT 15,  -- minutes
  buffer_time       integer NOT NULL DEFAULT 15,  -- minutes between meetings
  min_notice        integer NOT NULL DEFAULT 120, -- minutes (2 hours)
  max_advance_days  integer NOT NULL DEFAULT 14,  -- how far out people can book
  -- Timezone
  timezone          text NOT NULL DEFAULT 'America/Phoenix',
  -- Meeting defaults
  default_meeting_type text NOT NULL DEFAULT 'zoom', -- 'zoom' | 'phone' | 'in_person'
  default_location  text,  -- physical address for in_person
  -- Branding
  booking_page_title     text DEFAULT 'Book a Call',
  booking_page_subtitle  text DEFAULT 'Pick a time that works for you.',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
```

### Settings UI

New section in Settings: "Scheduling"

- **Availability grid:** Visual weekly grid (Mon-Sun) where each day
  has a toggle (on/off) and start/end time pickers. Default: Mon-Fri
  9am-5pm.
- **Per-day overrides:** Click a day to set custom hours (e.g., Friday
  9am-2pm)
- **Meeting duration:** Dropdown — 15, 20, 30, 45, 60 minutes
- **Buffer time:** Dropdown — 0, 5, 10, 15, 30 minutes
- **Minimum notice:** Dropdown — 30 min, 1 hour, 2 hours, 4 hours,
  24 hours
- **Booking window:** Dropdown — 1 week, 2 weeks, 3 weeks, 4 weeks
- **Timezone:** Searchable dropdown of IANA timezones, default to
  operator's detected timezone
- **Default meeting type:** Radio — Zoom / Phone / In-person
- **Connected accounts:** Show Google Calendar connection status and
  Zoom connection status with connect/disconnect buttons

---

## Task 4: Slot Calculation Engine

This is the core logic. Build a function that takes a date and returns
available time slots:

```typescript
async function getAvailableSlots(
  userId: string,
  date: Date
): Promise<TimeSlot[]>
```

**Algorithm:**

1. Load `scheduling_config` for the user
2. Check if the requested date's day-of-week is in `available_days`
   — if not, return empty
3. Check if the date is within the `max_advance_days` window — if
   not, return empty
4. Get the available hours for that day (check `day_overrides` first,
   fall back to `available_hours`)
5. Generate all possible slot start times:
   - Start at `available_hours.start`
   - Each slot is `meeting_duration` minutes long
   - Advance by `meeting_duration + buffer_time` between slots
   - Stop when the next slot would end after `available_hours.end`
6. Fetch Google Calendar free/busy for the date's full range
7. Remove any slot that overlaps with a busy period
8. Remove any slot that starts before now + `min_notice`
9. Return remaining slots

**Timezone handling:** All calculations happen in the operator's
configured timezone. The public booking page shows times in the
visitor's local timezone (detected via browser) with the operator's
timezone noted.

---

## Task 5: Bookings Table

```sql
CREATE TABLE bookings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id),
  business_id     uuid REFERENCES businesses(id),  -- nullable for external bookings
  -- Booking details
  start_time      timestamptz NOT NULL,
  end_time        timestamptz NOT NULL,
  meeting_type    text NOT NULL,  -- 'zoom' | 'phone' | 'in_person'
  -- Prospect info
  guest_name      text NOT NULL,
  guest_email     text NOT NULL,
  guest_phone     text,
  guest_message   text,
  -- Meeting link
  zoom_join_url   text,
  zoom_meeting_id text,
  -- Google Calendar
  gcal_event_id   text,
  -- Status
  status          text NOT NULL DEFAULT 'confirmed',
    -- 'confirmed' | 'rescheduled' | 'cancelled' | 'completed' | 'no_show'
  cancelled_at    timestamptz,
  cancel_reason   text,
  rescheduled_from timestamptz,  -- original time if rescheduled
  -- Tokens for guest actions (no login required)
  reschedule_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  cancel_token     text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
```

The `reschedule_token` and `cancel_token` are important: they let
the guest reschedule or cancel without logging in. The confirmation
email includes links with these tokens.

---

## Task 6: Public Booking Page

Route: `/book` (or `/book/[slug]` if you want per-operator booking
pages in the future — start with `/book` since there's one operator)

### Page Layout

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  [Sitegeit logo or operator name]               │
│                                                 │
│  Book a Call                                    │
│  Pick a time that works for you.                │
│                                                 │
│  ┌─────────────────┐  ┌─────────────────────┐  │
│  │                 │  │                     │  │
│  │  Calendar       │  │  Available times    │  │
│  │  date picker    │  │  for selected day   │  │
│  │                 │  │                     │  │
│  │  < March 2026 > │  │  9:00 AM            │  │
│  │  Mo Tu We Th Fr │  │  9:30 AM            │  │
│  │  [interactive]  │  │  10:00 AM           │  │
│  │                 │  │  10:30 AM  ← pick   │  │
│  │                 │  │  11:00 AM           │  │
│  │                 │  │  ...                │  │
│  └─────────────────┘  └─────────────────────┘  │
│                                                 │
│  Showing times in Pacific Time (PT)             │
│  ⏱ 15 minute call                              │
│  📹 Zoom meeting                                │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Interaction Flow

1. **Date selection:** Calendar shows current month. Days with no
   availability are grayed out (weekends, fully booked days, past
   days, days beyond max_advance_days). Clicking a date fetches
   available slots via API.

2. **Slot selection:** Available times appear as clickable buttons
   beside the calendar. Show times in visitor's detected timezone.
   Selected slot highlights.

3. **Booking form:** After selecting a slot, slide/transition to
   the booking form:
   - Name (required)
   - Email (required)
   - Phone (required)
   - Message (optional, textarea)
   - "Confirm Booking" button

4. **On confirm:**
   - Create `bookings` record
   - Create Google Calendar event with:
     - Summary: "Sitegeit — {guest_name} ({business_name if linked})"
     - Description: guest message, phone, email, link to prospect
       in Sitegeit pipeline
     - Attendees: guest email + operator email
     - Zoom link (if configured)
   - If `business_id` is linked (booking came from a landing page),
     update `businesses.status` → `meeting_scheduled`
   - Log `meeting_scheduled` event to activity_log
   - Create notification for operator
   - Send confirmation email to guest (see Task 8)

5. **Confirmation page:** "You're booked!" with:
   - Date/time in guest's timezone
   - Zoom link (if applicable)
   - "Add to calendar" links (Google Calendar .ics download)
   - "Need to reschedule?" and "Cancel booking" links

### Linking to Pipeline

When the booking page is accessed from an outreach landing page, pass
the `business_id` as a query parameter: `/book?ref={business_id}`.
The booking form pre-fills the business name and stores the
`business_id` on the booking record. This is how a booking
automatically advances the prospect in the pipeline.

### Design

The booking page should use Sitegeit's brand styling (French Blue
primary, Manrope font) — NOT the client site's theme. This is an
operator tool, not a client-facing site. Keep it clean, minimal,
fast. No sidebar, no navigation — it's a standalone public page.

---

## Task 7: Rescheduling Flow

Route: `/book/reschedule/[token]`

The guest clicks the reschedule link from their confirmation or
reminder email. The token maps to a booking record.

### Flow

1. Show current booking details (date, time, meeting type)
2. Show the same date picker + slot selector from the booking page
3. Guest picks a new time → confirm
4. On confirm:
   - Update the Google Calendar event to the new time
   - If Zoom: generate a new Zoom link (or keep the same one if
     Zoom allows updating the time)
   - Update `bookings` record: new start/end time, set
     `rescheduled_from` to the original time, status → `rescheduled`
   - Send updated confirmation email to guest
   - Send notification to operator: "{guest_name} rescheduled from
     {old_time} to {new_time}"
   - Log activity event

### Constraints

- Rescheduling follows the same availability rules (buffer, min
  notice, etc.)
- A booking can be rescheduled multiple times
- The reschedule token doesn't change — same link always works

---

## Task 8: Cancellation Flow

Route: `/book/cancel/[token]`

### Flow

1. Show current booking details
2. Optional: reason dropdown (schedule conflict, no longer interested,
   found another provider, other)
3. "Cancel Booking" button
4. On confirm:
   - Delete the Google Calendar event
   - Cancel the Zoom meeting (if applicable)
   - Update `bookings` record: status → `cancelled`, set
     `cancelled_at` and `cancel_reason`
   - Send cancellation confirmation email to guest
   - Send notification to operator: "{guest_name} cancelled their
     booking"
   - Do NOT revert the business status from `meeting_scheduled` —
     leave it and let the operator decide next steps
   - Log activity event

### Constraints

- Cancellation is permanent (no undo)
- Show a confirmation dialog before cancelling
- After cancellation, show a "Book a new time" link back to `/book`

---

## Task 9: Email Notifications

Build simple transactional emails for the booking flow. Use the
existing email sending infrastructure if available, or use Resend
(cheap, simple API) or Gmail API.

### Emails to Send

**Confirmation (to guest on booking):**
```
Subject: Your call with Jason from Sitegeit is confirmed

Hi {guest_name},

You're booked for {date} at {time} ({timezone}).

{if zoom}
Join via Zoom: {zoom_link}
{else}
We'll call you at {guest_phone}.
{endif}

Need to change plans?
Reschedule: {reschedule_link}
Cancel: {cancel_link}

Talk soon,
Jason
```

**Rescheduled (to guest):**
```
Subject: Your call has been rescheduled

Hi {guest_name},

Your call has been moved to {new_date} at {new_time} ({timezone}).

{zoom_link or phone details}

Reschedule again: {reschedule_link}
Cancel: {cancel_link}
```

**Cancellation (to guest):**
```
Subject: Your call has been cancelled

Hi {guest_name},

Your call on {date} at {time} has been cancelled.

Want to book a new time? {booking_link}
```

**Reminder (to guest, 1 hour before — optional for v1):**
```
Subject: Reminder: Your call is in 1 hour

Hi {guest_name},

Just a reminder — your call is at {time} today.

{zoom_link or phone details}
```

The reminder email requires a scheduler (cron job). Implement it if
straightforward, defer if complex. Google Calendar already sends its
own reminders, so this is a nice-to-have.

---

## Task 10: Operator Booking Management

Add a "Bookings" section to the operator UI. This doesn't need to
be a top-level sidebar item — it can live in Settings or as a tab
within the Dashboard.

### Bookings List

- Upcoming bookings (sorted by soonest first)
- Past bookings (collapsed by default)
- Each row: guest name, business name (if linked), date/time, type
  (Zoom/phone), status, actions
- Actions: "Cancel" and "Mark as No-Show" and "Mark as Completed"
- Click row → booking detail with all info + links to prospect

### Quick View on Dashboard

Add an "Upcoming Bookings" card to the dashboard showing the next
3 upcoming bookings. Deep link to the full bookings list.

---

## Task 11: Replace Calendly References

Once the booking system is functional and tested, replace all Calendly
references:

1. **Outreach landing page** (`/sites/go/[slug]`): Replace Calendly
   scheduling CTAs with links to `/book?ref={business_id}`
2. **Generated email content**: Update the email generation prompt to
   use the Sitegeit booking URL instead of Calendly
3. **Settings**: Remove the Calendly link field. Replace with the
   scheduling configuration section from Task 3.
4. **Users table**: The `calendly_link` column can be kept for backward
   compatibility but is no longer used. Add a migration comment.
5. **Any hardcoded `calendly.com` URLs**: Replace with the booking
   page URL

Do this as the FINAL task after everything else works. Test the full
flow end to end before removing Calendly as a fallback.

---

## Implementation Order

Build in this sequence:

1. Google Calendar OAuth + API client (foundation)
2. Availability config table + settings UI
3. Slot calculation engine
4. Bookings table + API routes
5. Public booking page (book flow)
6. Confirmation emails
7. Zoom integration
8. Rescheduling flow
9. Cancellation flow
10. Operator booking management UI
11. Pipeline integration (business_id linking, status updates)
12. Replace Calendly references
13. Dashboard "Upcoming Bookings" card

Steps 1-6 give you a working booking system. Steps 7-13 are
enhancements that can ship incrementally.

---

## Testing Checkpoint

Before marking this complete, show me:

1. **Google Calendar connected** in Settings, showing account name
   and connection status.

2. **Availability configured** — show the weekly grid with custom
   hours for at least one day.

3. **Public booking page** — navigate to `/book`, select a date,
   see available slots that correctly exclude busy times from
   Google Calendar. Pick a slot, fill in the form, confirm.

4. **Google Calendar event created** — show the event on your
   Google Calendar with the correct time, attendee, and Zoom link.

5. **Confirmation email** — show the email received by the guest
   with booking details, Zoom link, and reschedule/cancel links.

6. **Rescheduling** — click the reschedule link, pick a new time,
   confirm. Show the Google Calendar event updated.

7. **Cancellation** — click the cancel link, confirm. Show the
   Google Calendar event deleted and booking status updated.

8. **Pipeline integration** — book via a landing page link
   (`/book?ref={business_id}`), verify the business status updates
   to `meeting_scheduled` and the activity log records the event.

9. **Landing page updated** — show an outreach landing page with
   the scheduling CTA pointing to `/book?ref=...` instead of
   Calendly.

10. **Operator bookings view** — show upcoming bookings list with
    correct data.

---

## Environment Variables (new)

```
# Google OAuth (Calendar)
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=

# Zoom OAuth
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
ZOOM_REDIRECT_URI=

# Transactional email (if using Resend)
RESEND_API_KEY=

# Booking page URL
NEXT_PUBLIC_BOOKING_URL=https://seitgeit.vercel.app/book
```

## CLAUDE.md Rules for This Build

```
### Current Build: Sitegeit Scheduling (Custom Booking Tool)

This is a feature build within the Sitegeit codebase, not a separate
project. It replaces the Calendly integration.

### Rules

1. Do NOT remove Calendly references until the replacement is fully
   functional and tested end to end. Calendly is the fallback until
   then. Replace it as the final step.
2. All time calculations happen in the operator's configured timezone.
   Display times to guests in their detected browser timezone with
   the operator's timezone noted. Never mix timezones silently.
3. The public booking page (/book) is unauthenticated. Anyone with
   the link can book. The reschedule/cancel pages use tokens, not
   auth. Do not require login for any guest-facing page.
4. Google Calendar tokens contain sensitive credentials. Store them
   encrypted in the users table. Never log token values. Handle
   token refresh automatically — a booking attempt must never fail
   because a token silently expired.
5. If Zoom is not connected, the system still works. Default to
   phone calls. Zoom is an enhancement, not a dependency.
6. The slot calculation engine is the most critical piece. It must
   correctly handle: timezone conversion, buffer times, minimum
   notice, busy period exclusion, and day-of-week rules. Write
   tests for this function covering edge cases (fully booked day,
   booking at boundary of available hours, timezone offset crossing
   midnight, minimum notice filtering).
7. The booking page must be fast. Fetch slots for the selected date
   only (not the whole month). Show a loading state while fetching.
   Cache nothing — availability changes in real time.
8. Booking confirmation and cancellation must be idempotent. If a
   guest clicks "Confirm" twice, only one booking should be created.
   If they click "Cancel" twice, the second click should show
   "Already cancelled."
```
