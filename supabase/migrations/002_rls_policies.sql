-- Row Level Security policies
-- All tables are locked down: users can only access their own data

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
alter table public.users enable row level security;
alter table public.businesses enable row level security;
alter table public.generated_sites enable row level security;
alter table public.landing_pages enable row level security;
alter table public.outreach_emails enable row level security;
alter table public.activity_log enable row level security;
alter table public.notes enable row level security;
alter table public.search_queries enable row level security;
alter table public.sending_domains enable row level security;
alter table public.notifications enable row level security;

-- ============================================================
-- USERS: can read/update their own profile
-- ============================================================
create policy "Users can view own profile"
  on public.users for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.users for update
  using (id = auth.uid());

-- ============================================================
-- BUSINESSES: scoped to user_id
-- ============================================================
create policy "Users can view own businesses"
  on public.businesses for select
  using (user_id = auth.uid());

create policy "Users can insert own businesses"
  on public.businesses for insert
  with check (user_id = auth.uid());

create policy "Users can update own businesses"
  on public.businesses for update
  using (user_id = auth.uid());

create policy "Users can delete own businesses"
  on public.businesses for delete
  using (user_id = auth.uid());

-- ============================================================
-- GENERATED SITES: access through business ownership
-- ============================================================
create policy "Users can view own generated sites"
  on public.generated_sites for select
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = generated_sites.business_id
      and businesses.user_id = auth.uid()
    )
  );

create policy "Users can insert own generated sites"
  on public.generated_sites for insert
  with check (
    exists (
      select 1 from public.businesses
      where businesses.id = generated_sites.business_id
      and businesses.user_id = auth.uid()
    )
  );

create policy "Users can update own generated sites"
  on public.generated_sites for update
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = generated_sites.business_id
      and businesses.user_id = auth.uid()
    )
  );

-- ============================================================
-- LANDING PAGES: access through business ownership
-- ============================================================
create policy "Users can view own landing pages"
  on public.landing_pages for select
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = landing_pages.business_id
      and businesses.user_id = auth.uid()
    )
  );

create policy "Users can insert own landing pages"
  on public.landing_pages for insert
  with check (
    exists (
      select 1 from public.businesses
      where businesses.id = landing_pages.business_id
      and businesses.user_id = auth.uid()
    )
  );

create policy "Users can update own landing pages"
  on public.landing_pages for update
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = landing_pages.business_id
      and businesses.user_id = auth.uid()
    )
  );

-- ============================================================
-- OUTREACH EMAILS: access through business ownership
-- ============================================================
create policy "Users can view own outreach emails"
  on public.outreach_emails for select
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = outreach_emails.business_id
      and businesses.user_id = auth.uid()
    )
  );

create policy "Users can insert own outreach emails"
  on public.outreach_emails for insert
  with check (
    exists (
      select 1 from public.businesses
      where businesses.id = outreach_emails.business_id
      and businesses.user_id = auth.uid()
    )
  );

create policy "Users can update own outreach emails"
  on public.outreach_emails for update
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = outreach_emails.business_id
      and businesses.user_id = auth.uid()
    )
  );

-- ============================================================
-- ACTIVITY LOG: read-only, scoped to user's businesses
-- ============================================================
create policy "Users can view own activity log"
  on public.activity_log for select
  using (user_id = auth.uid());

create policy "Users can insert activity log"
  on public.activity_log for insert
  with check (user_id = auth.uid());

-- ============================================================
-- NOTES: scoped to user_id
-- ============================================================
create policy "Users can view own notes"
  on public.notes for select
  using (user_id = auth.uid());

create policy "Users can insert own notes"
  on public.notes for insert
  with check (user_id = auth.uid());

create policy "Users can delete own notes"
  on public.notes for delete
  using (user_id = auth.uid());

-- ============================================================
-- SEARCH QUERIES: scoped to user_id
-- ============================================================
create policy "Users can view own search queries"
  on public.search_queries for select
  using (user_id = auth.uid());

create policy "Users can insert own search queries"
  on public.search_queries for insert
  with check (user_id = auth.uid());

create policy "Users can update own search queries"
  on public.search_queries for update
  using (user_id = auth.uid());

create policy "Users can delete own search queries"
  on public.search_queries for delete
  using (user_id = auth.uid());

-- ============================================================
-- SENDING DOMAINS: scoped to user_id
-- ============================================================
create policy "Users can view own sending domains"
  on public.sending_domains for select
  using (user_id = auth.uid());

create policy "Users can insert own sending domains"
  on public.sending_domains for insert
  with check (user_id = auth.uid());

create policy "Users can update own sending domains"
  on public.sending_domains for update
  using (user_id = auth.uid());

create policy "Users can delete own sending domains"
  on public.sending_domains for delete
  using (user_id = auth.uid());

-- ============================================================
-- NOTIFICATIONS: scoped to user_id
-- ============================================================
create policy "Users can view own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can update own notifications"
  on public.notifications for update
  using (user_id = auth.uid());

create policy "Users can insert own notifications"
  on public.notifications for insert
  with check (user_id = auth.uid());
