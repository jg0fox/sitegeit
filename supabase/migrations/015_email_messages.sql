-- Email messages table: stores all email correspondence (outbound + inbound)
-- Provides unified thread view across bookings, pipeline, and client pages.

CREATE TABLE IF NOT EXISTS public.email_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  thread_id text,
  instantly_id text,
  direction text NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  from_email text NOT NULL,
  to_email text NOT NULL,
  subject text,
  body_html text,
  body_text text,
  sent_at timestamptz DEFAULT now(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  outreach_email_id uuid REFERENCES public.outreach_emails(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_messages_business ON public.email_messages(business_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_email_messages_booking ON public.email_messages(booking_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_email_messages_thread ON public.email_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_user ON public.email_messages(user_id);

ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own messages" ON public.email_messages
  FOR ALL USING (user_id = auth.uid());

-- Add thread_id and from_email to outreach_emails
ALTER TABLE public.outreach_emails ADD COLUMN IF NOT EXISTS thread_id text;
ALTER TABLE public.outreach_emails ADD COLUMN IF NOT EXISTS from_email text;
