-- ============================================================
-- SCHEDULING: Google Calendar tokens, availability config, bookings
-- ============================================================

-- Add OAuth token columns to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS google_calendar_token jsonb,
  ADD COLUMN IF NOT EXISTS zoom_token jsonb;

-- ============================================================
-- SCHEDULING CONFIG (operator availability settings)
-- ============================================================
CREATE TABLE public.scheduling_config (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES public.users(id) UNIQUE,
  -- Availability windows
  available_days    jsonb NOT NULL DEFAULT '["monday","tuesday","wednesday","thursday","friday"]',
  available_hours   jsonb NOT NULL DEFAULT '{"start":"09:00","end":"17:00"}',
  -- Per-day overrides (optional)
  day_overrides     jsonb DEFAULT '{}',
  -- Meeting settings
  meeting_duration  integer NOT NULL DEFAULT 15,
  buffer_time       integer NOT NULL DEFAULT 15,
  min_notice        integer NOT NULL DEFAULT 120,
  max_advance_days  integer NOT NULL DEFAULT 14,
  -- Timezone
  timezone          text NOT NULL DEFAULT 'America/Phoenix',
  -- Meeting defaults
  default_meeting_type text NOT NULL DEFAULT 'zoom',
  default_location  text,
  -- Branding
  booking_page_title     text DEFAULT 'Book a Call',
  booking_page_subtitle  text DEFAULT 'Pick a time that works for you.',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE public.bookings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES public.users(id),
  business_id     uuid REFERENCES public.businesses(id),
  -- Booking details
  start_time      timestamptz NOT NULL,
  end_time        timestamptz NOT NULL,
  meeting_type    text NOT NULL,
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
  cancelled_at    timestamptz,
  cancel_reason   text,
  rescheduled_from timestamptz,
  -- Tokens for guest actions (no login required)
  reschedule_token text UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  cancel_token     text UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- RLS policies for scheduling_config
ALTER TABLE public.scheduling_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scheduling config"
  ON public.scheduling_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduling config"
  ON public.scheduling_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduling config"
  ON public.scheduling_config FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow unauthenticated inserts for public booking page
CREATE POLICY "Anyone can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

-- Service role can do anything (for API routes using admin client)
CREATE POLICY "Service role full access scheduling_config"
  ON public.scheduling_config FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access bookings"
  ON public.bookings FOR ALL
  USING (auth.role() = 'service_role');

-- Index for token lookups (reschedule/cancel flows)
CREATE INDEX idx_bookings_reschedule_token ON public.bookings(reschedule_token);
CREATE INDEX idx_bookings_cancel_token ON public.bookings(cancel_token);
CREATE INDEX idx_bookings_user_status ON public.bookings(user_id, status);
CREATE INDEX idx_bookings_start_time ON public.bookings(start_time);
