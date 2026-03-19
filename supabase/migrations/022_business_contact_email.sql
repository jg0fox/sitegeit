-- Add contact_email to businesses table as the single source of truth
-- for client-facing email (booking notifications, contact form messages).
-- Separate from `email` (outreach target) and `email_candidates` (discovery).
ALTER TABLE businesses ADD COLUMN contact_email TEXT;
