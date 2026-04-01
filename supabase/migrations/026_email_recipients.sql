-- Support multiple recipient addresses per outreach email
ALTER TABLE public.outreach_emails ADD COLUMN IF NOT EXISTS to_emails text[];

-- Track which template variant was used for A/B testing
ALTER TABLE public.outreach_emails ADD COLUMN IF NOT EXISTS template_variant text;
