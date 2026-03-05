-- Add results storage and opt-in save flag to search_queries
ALTER TABLE public.search_queries ADD COLUMN IF NOT EXISTS results jsonb;
ALTER TABLE public.search_queries ADD COLUMN IF NOT EXISTS saved boolean DEFAULT false;
