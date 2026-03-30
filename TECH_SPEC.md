# Sitegeit — Technical Specification

## Project Overview

**Project name:** Sitegeit
**Type:** Full-stack SaaS pipeline for automated lead discovery, website generation, and outreach management
**Owner:** Jason Fox (Fason)
**Target user:** Solo operator (the owner) managing the full pipeline from mobile or desktop

Sitegeit is an AI-enabled business pipeline that discovers local businesses without websites, generates conversion-optimized preview websites and personalized landing pages, drafts outreach emails, and manages the full client lifecycle from prospect to paying subscriber — all from a desktop-primary web interface with responsive mobile support.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Next.js App)                      │
│  Desktop-primary responsive UI — PWA-capable                 │
│  Dashboard · Discovery · Pipeline · Email · CRM · Settings  │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST/tRPC
┌──────────────────────────┴──────────────────────────────────┐
│                    API LAYER (Next.js API Routes)            │
│  Auth · Pipeline orchestration · CRUD · Webhooks            │
└──────┬────────────┬──────────────┬──────────┬───────────────┘
       │            │              │          │
┌──────┴──┐  ┌──────┴──────┐  ┌───┴────┐  ┌─┴──────────────┐
│ Supabase│  │  Job Queue  │  │ Claude │  │ External APIs  │
│ Postgres│  │  (BullMQ +  │  │  API   │  │ Google Places  │
│ + Auth  │  │   Redis)    │  │        │  │ Instantly.ai   │
│ + Store │  │             │  │        │  │ Vercel API     │
└─────────┘  └─────────────┘  └────────┘  └────────────────┘
```

### Core Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 14+ (App Router, TypeScript) | Full-stack in one codebase, SSR for generated sites, API routes for backend |
| Database | Supabase (PostgreSQL + Auth + Storage) | Managed Postgres, built-in auth, file storage for screenshots/assets, realtime subscriptions |
| Job queue | BullMQ + Redis (Upstash) | Async pipeline processing — enrichment, generation, deployment run in background |
| AI | Anthropic Claude API (Sonnet for generation, Haiku for classification) | Content generation, business profiling, email drafting, tone extraction |
| Hosting (pipeline app) | Vercel | Next.js native, edge functions, easy deployment |
| Hosting (client sites) | Vercel (programmatic deploys via API) | Wildcard subdomain routing, near-zero per-site cost |
| Email outreach | Instantly.ai API | Domain warming, sending rotation, open/click tracking, follow-up sequences |
| Analytics | Plausible Analytics (self-hosted or cloud) | Privacy-friendly, lightweight, per-site tracking for client analytics tiers |
| Styling | Tailwind CSS + shadcn/ui + Radix primitives | Accessible components, design token system, responsive |
| Icons | Material Symbols (Outlined, 300 weight) | Consistent with mockup designs |
| Font | Manrope (Google Fonts) | Matches mockup typography |
| Notifications | Web push (service worker) + email fallback | Mobile notification when drafts are ready, prospects engage |
| Transactional email | Resend | Contact form submissions + booking notifications to clients |
| DNS | Cloudflare (wildcard subdomains) | Free wildcard DNS, edge caching for client sites |

---

## Data Model

### Core Entities

#### `users` (pipeline operators — just you initially)
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
email           text UNIQUE NOT NULL
full_name       text
avatar_url      text
email_signature text
prompt_overrides jsonb DEFAULT '{}'  -- per-user AI prompt overrides
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

#### `businesses` (prospects and clients)
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id             uuid REFERENCES users(id)
-- Basic info
name                text NOT NULL
category            text NOT NULL  -- e.g. "plumber", "bakery", "dentist"
category_slug       text           -- normalized for template matching
phone               text
email               text
address_street      text
address_city        text
address_state       text
address_zip         text
address_lat         decimal
address_lng         decimal
owner_name          text
-- Online presence
google_place_id     text UNIQUE
google_maps_url     text
google_rating       decimal
google_review_count integer
yelp_url            text
yelp_rating         decimal
yelp_review_count   integer
facebook_url        text
instagram_url       text
website_url         text           -- existing website if any (dead/bad)
website_status      text           -- 'none' | 'dead' | 'parked' | 'social_only' | 'outdated' | 'active'
-- Hours (JSON)
hours               jsonb          -- { "monday": { "open": "08:00", "close": "17:00" }, ... }
-- AI-derived
brand_voice         text           -- AI-extracted tone description
brand_colors        jsonb          -- { "primary": "#xxx", "secondary": "#xxx" }
value_proposition   text           -- AI-generated
services            jsonb          -- ["Water heater repair", "Drain cleaning", ...]
service_area        text           -- AI-derived service area description
target_audience     text           -- AI-derived
review_sentiment    text           -- AI summary of review themes
-- Photos
photos              jsonb          -- [{ "url": "...", "attribution": "...", "category": "exterior" }]
-- Pipeline state
status              text NOT NULL DEFAULT 'discovered'
  -- discovered → enriching → enriched → generating → review_ready →
  -- sent → opened → clicked → responded → meeting_scheduled →
  -- closed_won → active → churned | closed_lost | archived
-- Tier (once converted to client)
tier                text           -- 'starter' | 'growth' | 'pro' | 'premium'
monthly_rate        integer        -- cents
-- Timestamps
discovered_at       timestamptz DEFAULT now()
enriched_at         timestamptz
generated_at        timestamptz
sent_at             timestamptz
responded_at        timestamptz
converted_at        timestamptz
created_at          timestamptz DEFAULT now()
updated_at          timestamptz DEFAULT now()
```

#### `generated_sites`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
business_id         uuid REFERENCES businesses(id) ON DELETE CASCADE
-- Theme configuration
theme_id            text NOT NULL   -- e.g. "bold-trade", "soft-care"
layout_variant      text NOT NULL   -- e.g. "authority", "community"
theme_config        jsonb NOT NULL  -- full design token override JSON
-- Content
homepage_content    jsonb NOT NULL  -- structured content blocks
service_pages       jsonb           -- array of service page content
about_content       jsonb
contact_content     jsonb
faq_content         jsonb
seo_meta            jsonb           -- { title, description, og_image, schema_markup }
-- Deployment
vercel_project_id   text
vercel_deploy_id    text
deploy_url          text            -- e.g. "joes-plumbing.sitegeit.com"
custom_domain       text
deploy_status       text            -- 'pending' | 'building' | 'live' | 'failed'
-- Versioning
version             integer DEFAULT 1
previous_version_id uuid REFERENCES generated_sites(id)
created_at          timestamptz DEFAULT now()
updated_at          timestamptz DEFAULT now()
```

#### `landing_pages`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
business_id         uuid REFERENCES businesses(id) ON DELETE CASCADE
site_id             uuid REFERENCES generated_sites(id)
-- Content
headline            text NOT NULL
strategy_summary    text NOT NULL   -- plain-language pitch
site_preview_data   jsonb           -- screenshots, snippets from generated site
booking_url         text            -- link to booking page
-- Deployment
deploy_url          text            -- e.g. "go.sitegeit.com/joes-plumbing"
deploy_status       text
created_at          timestamptz DEFAULT now()
updated_at          timestamptz DEFAULT now()
```

#### `outreach_emails`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
business_id         uuid REFERENCES businesses(id) ON DELETE CASCADE
landing_page_id     uuid REFERENCES landing_pages(id)
-- Email content
subject             text NOT NULL
body                text NOT NULL   -- plain text / light HTML
-- Review state
review_status       text DEFAULT 'draft'  -- 'draft' | 'approved' | 'sent' | 'skipped'
reviewed_at         timestamptz
edited_body         text            -- if operator modified before sending
-- Delivery tracking (synced from Instantly)
instantly_id        text
sent_at             timestamptz
opened_at           timestamptz
open_count          integer DEFAULT 0
clicked_at          timestamptz
click_count         integer DEFAULT 0
replied_at          timestamptz
bounced             boolean DEFAULT false
-- Follow-up
sequence_position   integer DEFAULT 1  -- 1 = initial, 2 = first follow-up, etc.
parent_email_id     uuid REFERENCES outreach_emails(id)
created_at          timestamptz DEFAULT now()
updated_at          timestamptz DEFAULT now()
```

#### `activity_log`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
business_id         uuid REFERENCES businesses(id)
user_id             uuid REFERENCES users(id)
event_type          text NOT NULL
  -- 'lead_discovered' | 'enrichment_complete' | 'site_generated' |
  -- 'landing_page_generated' | 'email_drafted' | 'email_approved' |
  -- 'email_sent' | 'email_opened' | 'email_clicked' | 'email_replied' |
  -- 'email_bounced' | 'meeting_scheduled' | 'status_changed' |
  -- 'note_added' | 'tier_changed' | 'site_updated'
event_data          jsonb           -- flexible payload per event type
created_at          timestamptz DEFAULT now()
```

#### `notes`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
business_id         uuid REFERENCES businesses(id) ON DELETE CASCADE
user_id             uuid REFERENCES users(id)
content             text NOT NULL
created_at          timestamptz DEFAULT now()
```

#### `search_queries` (saved discovery searches)
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id             uuid REFERENCES users(id)
region              text NOT NULL
category            text NOT NULL
radius_km           integer
filters             jsonb           -- { min_rating, min_reviews, website_status_filter }
result_count        integer
last_run_at         timestamptz
created_at          timestamptz DEFAULT now()
```

#### `sending_domains`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id             uuid REFERENCES users(id)
domain              text NOT NULL
email_address       text NOT NULL
warmup_status       text DEFAULT 'warming'  -- 'warming' | 'ready' | 'flagged' | 'paused'
warmup_started_at   timestamptz
health_score        integer         -- 0-100, synced from Instantly
spf_configured      boolean DEFAULT false
dkim_configured     boolean DEFAULT false
dmarc_configured    boolean DEFAULT false
daily_send_limit    integer DEFAULT 20
emails_sent_today   integer DEFAULT 0
created_at          timestamptz DEFAULT now()
updated_at          timestamptz DEFAULT now()
```

#### `client_scheduling_config` (per-business booking pages)
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
business_id         uuid REFERENCES businesses(id) ON DELETE CASCADE UNIQUE
contact_email       text NOT NULL
timezone            text DEFAULT 'America/Phoenix'
meeting_duration    integer DEFAULT 15
meeting_types       text[] DEFAULT ARRAY['phone']
availability        jsonb           -- same schema as scheduling_config.available_hours
booking_slug        text UNIQUE     -- e.g. "joes-plumbing"
booking_page_title  text
booking_page_subtitle text
is_active           boolean DEFAULT true
created_at          timestamptz DEFAULT now()
```

#### `contact_submissions` (client site contact form entries)
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
business_id         uuid REFERENCES businesses(id) ON DELETE CASCADE
guest_name          text
guest_email         text
guest_phone         text
message             text
form_data           jsonb           -- all form fields as key-value
created_at          timestamptz DEFAULT now()
```

---

## Pipeline Stages — Detailed Flow

### Stage 0: Lead Discovery

**Trigger:** User enters region + category in Discovery UI
**Process:**
1. Query Google Places API (Nearby Search) with category and location
2. Paginate through results (up to 60 per query; grid subdivision for large areas)
3. For each result, check `website` field:
   - Empty → status: `none`
   - Facebook/Instagram URL → status: `social_only`
   - URL present → fetch with HEAD request:
     - 404/timeout → status: `dead`
     - GoDaddy/parking page patterns → status: `parked`
     - Responsive, recent, has content → status: `active` (skip)
     - Loads but looks outdated (no HTTPS, not mobile responsive) → status: `outdated`
4. Deduplicate by `google_place_id`
5. Return filtered results to UI as browsable cards
6. User selects leads → creates `businesses` records with status `discovered`

**API costs:** ~$32/1000 Place Search + ~$17/1000 Place Details. Scanning 200 businesses ≈ $2-3.

### Stage 1: Data Enrichment

**Trigger:** Business record created with status `discovered` → BullMQ job queued
**Process:**
1. Pull full Place Details (photos, reviews, hours, formatted address)
2. If Yelp URL present, scrape public profile for additional reviews and photos
3. If Facebook/Instagram present, scrape public page for branding signals
4. Send all collected data to Claude (Sonnet) with enrichment prompt:
   - Extract brand voice and tone from review language and social presence
   - Derive brand colors from photos (or suggest based on category)
   - Generate value proposition
   - List services from reviews and profile data
   - Identify target audience
   - Summarize review sentiment themes
   - Determine service area from review mentions and address
5. Update `businesses` record with enriched fields
6. Set status → `enriched`

**Claude prompt template:** See `knowledge/ENRICHMENT_PROMPTS.md`

### Stage 2: Website Generation

**Trigger:** Status changes to `enriched` → BullMQ job queued
**Process:**
1. Select theme based on `category_slug` mapping (see Design System Architecture)
2. Select layout variant (rotate through options or pick based on business signals)
3. Generate theme config JSON with brand color overrides
4. Send enriched business profile + theme config + content knowledge base to Claude (Sonnet):
   - Generate homepage content blocks (hero, services, about snippet, testimonials, CTA)
   - Generate service page content for each service
   - Generate about page content
   - Generate contact page content with structured hours
   - Generate FAQ content from common industry questions
   - Generate all SEO meta (title, description, OG tags, LocalBusiness schema markup)
5. All content passes through quality validation checklist (see Knowledge Base Part 7)
6. Store content in `generated_sites` record
7. Deploy to Vercel via API:
   - POST to Vercel deployment API with site data
   - Configure subdomain routing: `{slug}.sitegeit.com`
8. Capture screenshot of deployed site for landing page preview
9. Set status → `generating` → once deployed → `generated`

### Stage 3: Landing Page Generation

**Trigger:** Site deployed successfully
**Process:**
1. Generate landing page content via Claude:
   - Personalized headline
   - Plain-language strategy summary (why this site is built the way it is)
   - Pull preview snippets and screenshot from generated site
   - Include Calendly/scheduling link
   - Include service tier overview
2. Deploy landing page to `go.sitegeit.com/{slug}`
3. Store in `landing_pages` record

### Stage 4: Email Generation

**Trigger:** Landing page deployed
**Process:**
1. Generate personalized outreach email via Claude:
   - Short, conversational, leads with value
   - Includes landing page URL
   - Personalized with business name, owner name if available, specific detail from their profile
   - CAN-SPAM compliant (sender info, unsubscribe mechanism)
2. Store in `outreach_emails` with `review_status: 'draft'`
3. Fire notification to user (push + email)
4. Set business status → `review_ready`

### Stage 5: Review & Send

**Trigger:** User opens notification or checks Pipeline Queue
**Process:**
1. User reviews email in Email Review UI
2. Options: Approve & Send | Edit → Approve | Skip
3. On approve:
   - Push email to Instantly.ai via API
   - Instantly handles: domain rotation, send timing, deliverability
   - Set `review_status: 'approved'`, then `'sent'` on confirmation
   - Set business status → `sent`
4. Instantly webhooks fire back to our API on: open, click, reply, bounce
5. Activity log records all engagement events
6. Business status auto-updates: `sent` → `opened` → `clicked` → `responded`

### Stage 6: CRM & Client Lifecycle

**Post-conversion flow:**
1. When prospect books meeting → status: `meeting_scheduled`
2. After call, user marks: `closed_won` (becomes client) or `closed_lost`
3. On `closed_won`:
   - Set tier and monthly rate
   - Activate billing (Stripe integration, future phase)
   - Move to Client Management UI
   - If custom domain requested, configure DNS
4. Ongoing client management:
   - Automated analytics reports (Growth+ tiers)
   - AI-generated content updates (Pro+ tiers)
   - Growth experiments (Premium tier)

---

## Service Tier Feature Matrix

| Feature | Starter $25 | Growth $50 | Pro $75 | Premium $100 |
|---|:---:|:---:|:---:|:---:|
| Conversion-optimized website | ✓ | ✓ | ✓ | ✓ |
| SEO optimization + LocalBusiness schema | ✓ | ✓ | ✓ | ✓ |
| Mobile responsive + SSL | ✓ | ✓ | ✓ | ✓ |
| Contact form (email via Resend) | ✓ | ✓ | ✓ | ✓ |
| Initial brand assessment | ✓ | ✓ | ✓ | ✓ |
| Monthly uptime monitoring | ✓ | ✓ | ✓ | ✓ |
| Appointment scheduling (multi-tenant /book/[slug]) | | ✓ | ✓ | ✓ |
| Custom domain setup | | ✓ | ✓ | ✓ |
| Analytics dashboard | | ✓ | ✓ | ✓ |
| Monthly analytics email | | ✓ | ✓ | ✓ |
| CTA + lead tracking | | ✓ | ✓ | ✓ |
| GBP optimization recs | | ✓ | ✓ | ✓ |
| AI customer portal (FAQ bot) | | | ✓ | ✓ |
| Weekly performance reports | | | ✓ | ✓ |
| Monthly AI blog post | | | ✓ | ✓ |
| Review monitoring + responses | | | ✓ | ✓ |
| Lead inbox | | | ✓ | ✓ |
| Quarterly growth experiments | | | | ✓ |
| Managed GBP (posts, reviews) | | | | ✓ |
| AI social media content | | | | ✓ |
| Competitor monitoring | | | | ✓ |
| Quarterly brand health check | | | | ✓ |
| Multi-page site expansion | | | | ✓ |
| Quarterly strategy call | | | | ✓ |

---

## Key Interfaces

### 1. Dashboard (Home)
- Pipeline summary: count of leads per stage (discovered → active)
- Recent activity feed with deep links
- Quick actions: New Search, Review Drafts, View Responses
- MRR snapshot: active clients, revenue, churn rate

### 2. Lead Discovery
- Search form: region (city/zip/radius) + business category
- Filters: website status, minimum rating, minimum reviews, has phone, verified
- Results as scrollable cards: name, category, rating, review count, web status
- Multi-select → "Add to Pipeline" sticky bottom button
- Saved searches with re-run capability

### 3. Pipeline Queue
- Tab/filter bar: Enriching | Generating | Ready for Review | Sent | Responded
- List of prospect cards with: name, category, stage, time in stage, engagement signals
- Engagement badges: "Email opened 3x", "Clicked landing page", "High intent"
- Tap card → Prospect Detail

### 4. Prospect Detail (CRM Record)
- Business profile header: name, category, rating, contact info, social links
- Generated site preview thumbnail + "View site" button
- Landing page preview + link
- Email draft with inline edit + Approve/Send button
- Pipeline stage visualization (horizontal stepper)
- Activity timeline (chronological log of all events)
- Notes section (free text)
- Status controls (manual stage override, archive)

### 5. Email Review
- Focused review mode: prospect context in left panel, full email in right panel (split view on desktop)
- Subject line (editable)
- Email body (editable inline)
- Preview of landing page link (clickable to verify)
- Actions: Approve & Send (primary), Edit, Skip
- Batch mode: table/list view with inline approve/skip actions, progress counter
- Keyboard shortcuts: A = approve, S = skip, E = edit, ↑↓ arrow keys to navigate

### 6. Client Management
- Active client roster: name, tier, monthly rate, status, next billing
- Search + filter by tier, status, date
- Expandable rows: analytics summary, billing history, site management
- Metrics bar: total clients, MRR, avg deal size, retention rate

### 7. Settings & Configuration
- Email accounts: sending domains, warmup status, health scores
- Templates: email templates, site templates, landing page templates
- Integrations: Instantly connection, analytics config
- System prompts: per-user AI prompt overrides for enrichment, site generation, email, landing page
- Notification preferences
- Profile: business info, avatar, email signature

### 8. Notifications Center
- Chronological activity feed
- Categories: emails (opens, replies), pipeline (sites ready, enrichment complete), system (bounces, errors)
- Deep links to relevant screens
- Mark read/unread, filter by type

---

## Design System

The pipeline UI and all generated client sites share a design token system documented in `knowledge/DESIGN_SYSTEM.md`. Key points:

**Pipeline UI:** French Blue primary (`#3E63DD`), Manrope font, dark/light mode, card-based layouts with consistent shadows and spacing. Desktop-primary with sidebar navigation; responsive down to mobile. Touch targets ≥ 44px on smaller viewports.

**Client sites:** 8 base themes mapped to business archetypes (Bold Trade, Soft Care, Warm Craft, etc.) with customizable color, typography, and spacing tokens. See Design System Architecture for full specification.

---

## API Integrations

### Google Places API
- **Nearby Search:** Find businesses by location + category
- **Place Details:** Full business data (photos, reviews, hours, website)
- **Pricing:** ~$32/1K searches, ~$17/1K detail lookups
- **Rate limits:** Respect QPS limits, implement retry with backoff

### Anthropic Claude API
- **Sonnet:** Content generation (website copy, emails, landing pages, reports)
- **Haiku:** Classification (business category, web presence status, review sentiment)
- **Usage:** Prompt templates in `knowledge/` directory

### Vercel API
- **Deployment API:** Programmatic deploy of generated sites
- **Domain API:** Subdomain configuration
- **Wildcard DNS:** `*.sitegeit.com` pointed to Vercel

### Instantly.ai API
- **Campaign management:** Create campaigns, add leads
- **Email sending:** Queue emails through warmed domains
- **Webhooks:** Open, click, reply, bounce events
- **Account management:** Domain health, warmup status

### Plausible Analytics API
- **Site provisioning:** Create analytics site per client
- **Stats API:** Pull visitor data, top pages, sources for reports
- **Embed:** Dashboard embed for client-facing analytics (Growth+ tiers)

### Stripe API (Phase 2)
- **Subscriptions:** Monthly billing per tier
- **Webhooks:** Payment success, failure, cancellation

---

## Deployment & Infrastructure

### Environments
- **Development:** Local Next.js dev server + local Supabase (Docker) + local Redis
- **Staging:** Vercel preview deployment + Supabase staging project
- **Production:** Vercel production + Supabase production + Upstash Redis

### Environment Variables
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Google
GOOGLE_PLACES_API_KEY=

# Vercel (for programmatic deploys)
VERCEL_TOKEN=
VERCEL_TEAM_ID=

# Instantly
INSTANTLY_API_KEY=

# Plausible
PLAUSIBLE_API_KEY=

# Redis (Upstash)
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# Resend (transactional email for contact forms)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SITE_DOMAIN=sitegeit.com
```

### CI/CD
- Push to `main` → Vercel auto-deploys production
- Push to feature branches → Vercel preview deploys
- Database migrations via Supabase CLI (`supabase db push`)

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Project scaffolding (Next.js + Tailwind + shadcn/ui + Supabase)
- Database schema creation and migrations
- Auth flow (Supabase Auth, magic link)
- Desktop-primary layout shell with sidebar navigation (collapses on mobile)
- Dashboard skeleton with placeholder data

### Phase 2: Lead Discovery (Week 2-3)
- Google Places API integration
- Discovery search UI (region + category input, results cards)
- Web presence detection (HEAD request checking, status classification)
- Multi-select and "Add to Pipeline" flow
- Saved searches

### Phase 3: Enrichment + Generation Engine (Week 3-5)
- BullMQ job queue setup with Redis
- Enrichment pipeline (Places Details + social scraping + Claude profiling)
- Website content generation (Claude + content knowledge base)
- Design token system and theme selection
- Vercel deployment automation
- Landing page generation
- Email drafting

### Phase 4: Pipeline Management UI (Week 5-6)
- Pipeline Queue with stage tabs and filtering
- Prospect Detail / CRM record view
- Email Review with inline editing
- Batch email review (keyboard-driven list view)
- Activity timeline
- Notification system (push + email)

### Phase 5: Email Integration (Week 6-7)
- Instantly.ai API integration
- Sending domain management UI
- Email delivery tracking (webhook receiver)
- Follow-up sequence automation
- Engagement signal display in Pipeline Queue

### Phase 6: Client Management & Custom Domains (Week 7-8)
- Client roster UI
- Tier management
- Analytics integration (Plausible per-site provisioning)
- Automated report generation
- Client detail views with analytics
- Custom domain support for converted clients:
  - Add "Custom domain" field to client detail page (writes to `generated_sites.custom_domain`)
  - Vercel API integration in deploy worker: add domain alias, provision SSL
  - Update middleware to match incoming hostnames against `custom_domain` column in DB
  - Optional redirect from `{slug}.sitegeit.com` → custom domain
  - DNS setup guide shown in UI (CNAME instructions for the client)

### Phase 7: Polish & Scale (Week 8-10)
- Performance optimization (caching, lazy loading, optimistic UI)
- Error handling and retry logic throughout pipeline
- Comprehensive loading and empty states
- Onboarding flow for first-time setup
- Domain warming guidance and checklist
- Documentation

### Phase 8: Quick Fixes & Email Polish
- Pricing badge clipping fix, discover icon artifact
- Sample phone numbers for non-client preview sites
- Bookings styling (individual cards), email UX clarification
- Calendly references removed, replaced with booking_url throughout

### Phase 9: Content Management & System Prompts
- Section-based site editor at /clients/[id]/edit-site
- Image upload with Sharp processing (resize, compress, Supabase Storage)
- AI text rewrite via Claude Haiku (preset options + custom instructions)
- System prompt editor at /settings/prompts (per-user overrides stored in users.prompt_overrides)

### Phase 10: Multi-Tenant Booking Service
- Per-business scheduling config (client_scheduling_config table)
- Multi-tenant booking pages at /book/[slug]
- Client booking setup card in client detail page
- ICS calendar file generation for booking confirmations

### Phase 11: Client Site Services
- Contact form transactional email via Resend (/api/sites/contact)
- Contact submissions stored in contact_submissions table
- Checkout placeholder page at /sites/go/[slug]/checkout

### Future Phases
- Stripe billing integration (checkout placeholder exists)
- AI customer portal (chat widget for client sites)
- AI-generated blog posts and social content
- Growth experiment engine (A/B testing landing pages)
- Competitor monitoring
- AI avatar video greeting on landing pages
- Multi-location support
- Google Calendar OAuth for client bookings
- Client self-service booking management portal
- Stock photo search + AI image suggestions in content editor

---

## Compliance Notes

### CAN-SPAM
- All outreach emails include: real sender info, physical address, working unsubscribe link, honest subject line
- Opt-outs honored within 10 business days
- No misleading header information

### California-Specific
- Comply with CCPA: respect opt-out of data sale requests
- Real sender identity on all calls and emails
- Do not use AI-generated voice calls (FCC 2024 ruling)
- Private right of action risk: ensure every email is compliant to avoid $1,000/email exposure

### TCPA (if phone follow-up)
- Manual human-dialed calls only
- Call between 8am-9pm recipient local time
- Scrub against National DNC Registry monthly
- Maintain internal DNC list — honor removal requests immediately

---

## File Structure

```
sitegeit/
├── TECH_SPEC.md              ← You are here
├── CLAUDE.md                 ← Build instructions for Claude Code agent
├── KICKOFF_PROMPT.md         ← Prompt to start the build
├── knowledge/
│   ├── CONTENT_SEO_KB.md     ← Content design + SEO knowledge base
│   ├── DESIGN_SYSTEM.md      ← Design system architecture
│   ├── INTERFACES.md         ← Interface outlines
│   └── ENRICHMENT_PROMPTS.md ← Prompt templates for AI pipeline stages
└── reference/
    └── ui-mockups.html       ← HTML mockup reference files
```
