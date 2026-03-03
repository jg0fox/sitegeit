-- Add columns for storing Google Places reviews and AI-extracted review excerpts
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS google_reviews jsonb,
  ADD COLUMN IF NOT EXISTS top_review_excerpts jsonb;

COMMENT ON COLUMN public.businesses.google_reviews IS 'Raw review data from Google Places API (up to 5 reviews)';
COMMENT ON COLUMN public.businesses.top_review_excerpts IS 'AI-extracted compelling review quotes from enrichment';
