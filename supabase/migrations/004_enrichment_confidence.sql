-- Add enrichment_confidence column for data quality scoring
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS enrichment_confidence jsonb;

COMMENT ON COLUMN public.businesses.enrichment_confidence IS 'Data confidence scores from enrichment (overall + per-field). Used by generate-site to decide enrichment vs category defaults.';
