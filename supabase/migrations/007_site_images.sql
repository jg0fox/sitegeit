-- Add image URL columns to generated_sites
ALTER TABLE public.generated_sites
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS about_image_url text;

COMMENT ON COLUMN public.generated_sites.hero_image_url IS 'Public URL for the hero background image';
COMMENT ON COLUMN public.generated_sites.about_image_url IS 'Public URL for the about page image';
