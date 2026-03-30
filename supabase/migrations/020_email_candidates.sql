-- Email candidates: stores all discovered email addresses per business
-- for human-in-the-loop selection before outreach

create table public.email_candidates (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  email text not null,
  source text not null,        -- 'website_scrape' | 'web_search' | 'mx_pattern' | 'hunter' | 'manual'
  confidence text not null,    -- 'high' | 'medium' | 'low'
  source_url text,             -- page URL where email was found
  source_context text,         -- snippet of surrounding text
  is_selected boolean default false,
  created_at timestamptz default now(),
  unique(business_id, email)
);

create index idx_email_candidates_business on public.email_candidates(business_id);

-- RLS: access through business ownership (same pattern as outreach_emails)
alter table public.email_candidates enable row level security;

create policy "Users can view own email candidates"
  on public.email_candidates for select
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = email_candidates.business_id
      and businesses.user_id = auth.uid()
    )
  );

create policy "Users can insert own email candidates"
  on public.email_candidates for insert
  with check (
    exists (
      select 1 from public.businesses
      where businesses.id = email_candidates.business_id
      and businesses.user_id = auth.uid()
    )
  );

create policy "Users can update own email candidates"
  on public.email_candidates for update
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = email_candidates.business_id
      and businesses.user_id = auth.uid()
    )
  );

create policy "Users can delete own email candidates"
  on public.email_candidates for delete
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = email_candidates.business_id
      and businesses.user_id = auth.uid()
    )
  );

-- Add skip_email_search flag to businesses
alter table public.businesses add column if not exists skip_email_search boolean default false;
