-- Sitegeit: Full initial schema
-- All tables, columns, and relationships from TECH_SPEC.md

-- ============================================================
-- USERS (pipeline operators)
-- ============================================================
create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  avatar_url text,
  calendly_link text,
  email_signature text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- BUSINESSES (prospects and clients)
-- ============================================================
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),

  -- Basic info
  name text not null,
  category text not null,
  category_slug text,
  phone text,
  email text,
  address_street text,
  address_city text,
  address_state text,
  address_zip text,
  address_lat decimal,
  address_lng decimal,
  owner_name text,

  -- Online presence
  google_place_id text unique,
  google_maps_url text,
  google_rating decimal,
  google_review_count integer,
  yelp_url text,
  yelp_rating decimal,
  yelp_review_count integer,
  facebook_url text,
  instagram_url text,
  website_url text,
  website_status text check (website_status in ('none', 'dead', 'parked', 'social_only', 'outdated', 'active')),

  -- Hours (JSON)
  hours jsonb,

  -- AI-derived
  brand_voice text,
  brand_colors jsonb,
  value_proposition text,
  services jsonb,
  service_area text,
  target_audience text,
  review_sentiment text,

  -- Photos
  photos jsonb,

  -- Pipeline state
  status text not null default 'discovered' check (status in (
    'discovered', 'enriching', 'enriched', 'generating', 'review_ready',
    'sent', 'opened', 'clicked', 'responded', 'meeting_scheduled',
    'closed_won', 'active', 'churned', 'closed_lost', 'archived'
  )),

  -- Tier (once converted to client)
  tier text check (tier in ('starter', 'growth', 'pro', 'premium')),
  monthly_rate integer,

  -- Timestamps
  discovered_at timestamptz default now(),
  enriched_at timestamptz,
  generated_at timestamptz,
  sent_at timestamptz,
  responded_at timestamptz,
  converted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_businesses_user_id on public.businesses(user_id);
create index idx_businesses_status on public.businesses(status);
create index idx_businesses_category_slug on public.businesses(category_slug);

-- ============================================================
-- GENERATED SITES
-- ============================================================
create table public.generated_sites (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,

  -- Theme configuration
  theme_id text not null,
  layout_variant text not null,
  theme_config jsonb not null,

  -- Content
  homepage_content jsonb not null,
  service_pages jsonb,
  about_content jsonb,
  contact_content jsonb,
  faq_content jsonb,
  seo_meta jsonb,

  -- Deployment
  vercel_project_id text,
  vercel_deploy_id text,
  deploy_url text,
  custom_domain text,
  deploy_status text check (deploy_status in ('pending', 'building', 'live', 'failed')),

  -- Versioning
  version integer default 1,
  previous_version_id uuid references public.generated_sites(id),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_generated_sites_business_id on public.generated_sites(business_id);

-- ============================================================
-- LANDING PAGES
-- ============================================================
create table public.landing_pages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  site_id uuid references public.generated_sites(id),

  -- Content
  headline text not null,
  strategy_summary text not null,
  site_preview_data jsonb,
  calendly_link text,

  -- Deployment
  deploy_url text,
  deploy_status text check (deploy_status in ('pending', 'building', 'live', 'failed')),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_landing_pages_business_id on public.landing_pages(business_id);

-- ============================================================
-- OUTREACH EMAILS
-- ============================================================
create table public.outreach_emails (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  landing_page_id uuid references public.landing_pages(id),

  -- Email content
  subject text not null,
  body text not null,

  -- Review state
  review_status text default 'draft' check (review_status in ('draft', 'approved', 'sent', 'skipped')),
  reviewed_at timestamptz,
  edited_body text,

  -- Delivery tracking (synced from Instantly)
  instantly_id text,
  sent_at timestamptz,
  opened_at timestamptz,
  open_count integer default 0,
  clicked_at timestamptz,
  click_count integer default 0,
  replied_at timestamptz,
  bounced boolean default false,

  -- Follow-up
  sequence_position integer default 1,
  parent_email_id uuid references public.outreach_emails(id),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_outreach_emails_business_id on public.outreach_emails(business_id);
create index idx_outreach_emails_review_status on public.outreach_emails(review_status);

-- ============================================================
-- ACTIVITY LOG
-- ============================================================
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id),
  user_id uuid references public.users(id),
  event_type text not null check (event_type in (
    'lead_discovered', 'enrichment_complete', 'site_generated',
    'landing_page_generated', 'email_drafted', 'email_approved',
    'email_sent', 'email_opened', 'email_clicked', 'email_replied',
    'email_bounced', 'meeting_scheduled', 'status_changed',
    'note_added', 'tier_changed', 'site_updated'
  )),
  event_data jsonb,
  created_at timestamptz default now()
);

create index idx_activity_log_business_id on public.activity_log(business_id);
create index idx_activity_log_user_id on public.activity_log(user_id);
create index idx_activity_log_created_at on public.activity_log(created_at desc);

-- ============================================================
-- NOTES
-- ============================================================
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  user_id uuid references public.users(id),
  content text not null,
  created_at timestamptz default now()
);

create index idx_notes_business_id on public.notes(business_id);

-- ============================================================
-- SEARCH QUERIES (saved discovery searches)
-- ============================================================
create table public.search_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  region text not null,
  category text not null,
  radius_km integer,
  filters jsonb,
  result_count integer,
  last_run_at timestamptz,
  created_at timestamptz default now()
);

create index idx_search_queries_user_id on public.search_queries(user_id);

-- ============================================================
-- SENDING DOMAINS
-- ============================================================
create table public.sending_domains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  domain text not null,
  email_address text not null,
  warmup_status text default 'warming' check (warmup_status in ('warming', 'ready', 'flagged', 'paused')),
  warmup_started_at timestamptz,
  health_score integer,
  spf_configured boolean default false,
  dkim_configured boolean default false,
  dmarc_configured boolean default false,
  daily_send_limit integer default 20,
  emails_sent_today integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_sending_domains_user_id on public.sending_domains(user_id);

-- ============================================================
-- NOTIFICATIONS (for in-app notification center)
-- ============================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  type text not null,
  title text not null,
  body text,
  business_id uuid references public.businesses(id),
  href text,
  read boolean default false,
  created_at timestamptz default now()
);

create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_read on public.notifications(user_id, read);
create index idx_notifications_created_at on public.notifications(created_at desc);
