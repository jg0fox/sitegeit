-- Add booking mode column: off, demo, configured
ALTER TABLE public.client_scheduling_config
  ADD COLUMN IF NOT EXISTS mode text DEFAULT 'configured'
  CHECK (mode IN ('off', 'demo', 'configured'));

-- Make contact_email nullable for demo mode
ALTER TABLE public.client_scheduling_config
  ALTER COLUMN contact_email DROP NOT NULL;

-- Backfill mode for existing rows
UPDATE public.client_scheduling_config
SET mode = CASE WHEN is_active = true THEN 'configured' ELSE 'off' END
WHERE mode IS NULL OR mode = 'configured';
