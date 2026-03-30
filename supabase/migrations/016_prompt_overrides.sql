-- Add prompt_overrides jsonb column to users table
-- Stores per-user custom overrides for AI system prompts
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS prompt_overrides jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.users.prompt_overrides IS 'Per-user overrides for AI prompts: { enrichment?: string, site_generation?: string, email?: string, landing_page?: string }';
