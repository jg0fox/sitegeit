-- Per-business scheduling configuration for multi-tenant booking
CREATE TABLE IF NOT EXISTS public.client_scheduling_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE UNIQUE,
  contact_email text NOT NULL,
  timezone text DEFAULT 'America/Phoenix',
  meeting_duration integer DEFAULT 15,
  meeting_types text[] DEFAULT ARRAY['phone'],
  availability jsonb,
  booking_slug text UNIQUE,
  booking_page_title text,
  booking_page_subtitle text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_scheduling_business ON public.client_scheduling_config(business_id);
CREATE INDEX IF NOT EXISTS idx_client_scheduling_slug ON public.client_scheduling_config(booking_slug);

ALTER TABLE public.client_scheduling_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own client scheduling" ON public.client_scheduling_config
  FOR ALL USING (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );
