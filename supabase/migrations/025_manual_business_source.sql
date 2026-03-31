-- Track how a business entered the pipeline
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'discovery'
  CHECK (source IN ('discovery', 'manual'));
