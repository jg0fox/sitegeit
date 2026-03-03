-- Add trust_bar and content_metadata columns to generated_sites
ALTER TABLE public.generated_sites ADD COLUMN IF NOT EXISTS trust_bar jsonb;
ALTER TABLE public.generated_sites ADD COLUMN IF NOT EXISTS content_metadata jsonb;

COMMENT ON COLUMN public.generated_sites.trust_bar IS 'Trust bar items with source confidence markers (verified/inferred/default)';
COMMENT ON COLUMN public.generated_sites.content_metadata IS 'Generation metadata: data confidence, sections included/omitted, default fields used';
