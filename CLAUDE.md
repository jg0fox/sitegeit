## Current State: Phase 3.5 — Site Generation Quality Overhaul

We are NOT building new features. We are completing Phase 3 properly.

The pipeline works end-to-end (discovery → enrichment → generation → deploy → email).
The output quality is not good enough. Sites look generic, content follows
repetitive AI patterns, thin enrichment data produces empty/hedging content,
and service pages/about/contact/FAQ are generated but never rendered.

### Reference Document

Read `SITE_GENERATION_OVERHAUL.md` for the full plan. It has 4 layers
and 5 sprints. We are executing one sprint at a time.

### Current Sprint: Sprint 6 — Images & Social Proof

### Rules for This Phase

1. Fix the star rendering bug FIRST. Deploy and verify filled stars
   before touching anything else.
2. The review pipeline audit is diagnostic — trace the data, document
   where it breaks, THEN fix. Do not guess at the fix.
3. Image infrastructure must work with zero images. Every component
   that uses images must have a graceful null/fallback path that
   renders the current no-image layout.
4. Hero image overlays must maintain text readability. Test with both
   dark themes (bold-trade) and light themes (warm-craft). If text
   becomes unreadable over any image, the overlay opacity is wrong.
5. Do not source or download images — just build the infrastructure.
   Image sourcing is a manual step I'll do separately.
6. Do not add per-service-card images. Hero + about only for now.
7. Test star fill rendering at 5.0, 4.7, 4.4, 4.0, and 3.5 ratings.
   
# CLAUDE.md — Sitegeit Build Instructions

You are building Sitegeit, a desktop-primary SaaS pipeline (with responsive mobile support) that discovers local businesses without websites, generates conversion-optimized preview websites and landing pages, drafts outreach emails, and manages the full client lifecycle.

Read `TECH_SPEC.md` for the complete technical specification. Read all files in `knowledge/` before writing any code — they contain the content strategy, design system, and interface specifications that are core to this project.

---

## Project Setup

```bash
# Framework
npx create-next-app@latest sitegeit --typescript --tailwind --app --src-dir

# Core dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install bullmq ioredis
npm install @anthropic-ai/sdk
npm install @vercel/sdk

# UI
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-toggle @radix-ui/react-tooltip @radix-ui/react-select @radix-ui/react-switch @radix-ui/react-checkbox @radix-ui/react-popover
npm install lucide-react
npm install framer-motion
npm install sonner  # toast notifications

# Utilities
npm install date-fns zod
npm install sharp  # image processing for screenshots
```

### Font & Icons

Load Manrope from Google Fonts in `layout.tsx`:
```tsx
import { Manrope } from 'next/font/google'
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' })
```

Load Material Symbols (Outlined, 300 weight) via CDN link in `layout.tsx`:
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0" rel="stylesheet" />
```

---

## Architecture Rules

### Desktop-Primary, Mobile-Friendly
- Design for 1440px / 1024px desktop viewports first, then ensure it works well on tablet and mobile
- Sidebar navigation (left rail) — not bottom tabs. Collapsible on smaller screens.
- This is a power-user tool, not a consumer app. Optimize for information density and efficiency at desktop widths.
- Use split-pane layouts where it makes sense (e.g., Pipeline Queue list + Prospect Detail side by side)
- Tables, data grids, and multi-column layouts should feel natural — don't constrain everything to single-column card stacks
- On mobile/tablet: sidebar collapses to hamburger menu, layouts reflow to single column, touch targets ≥ 44px
- The app should look and feel like a proper desktop SaaS dashboard (think Linear, Vercel dashboard, or HubSpot) that also happens to work on your phone

### Async Pipeline
- All pipeline processing (enrichment, generation, deployment) runs in BullMQ background jobs
- Never block the UI waiting for AI generation
- Use Supabase Realtime subscriptions to push status updates to the frontend
- Optimistic UI updates where possible

### Data Flow
```
User action → API route → Queue job → Worker processes → DB update → Realtime push → UI update
```

### File Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Shell with sidebar nav
│   │   ├── page.tsx                # Dashboard home
│   │   ├── discover/
│   │   │   └── page.tsx            # Lead Discovery
│   │   ├── pipeline/
│   │   │   ├── page.tsx            # Pipeline Queue
│   │   │   └── [id]/page.tsx       # Prospect Detail
│   │   ├── email-review/
│   │   │   └── page.tsx            # Email Review (batch + single)
│   │   ├── clients/
│   │   │   ├── page.tsx            # Client Roster
│   │   │   └── [id]/page.tsx       # Client Detail
│   │   ├── notifications/
│   │   │   └── page.tsx            # Notification Center
│   │   └── settings/
│   │       └── page.tsx            # Settings & Config
│   └── api/
│       ├── discover/route.ts       # Google Places search
│       ├── pipeline/
│       │   ├── enrich/route.ts     # Trigger enrichment
│       │   ├── generate/route.ts   # Trigger site generation
│       │   └── deploy/route.ts     # Trigger Vercel deploy
│       ├── email/
│       │   ├── approve/route.ts    # Approve and queue for sending
│       │   └── webhook/route.ts    # Instantly.ai webhook receiver
│       ├── businesses/
│       │   └── [id]/route.ts       # CRUD
│       └── notifications/
│           └── route.ts
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── AppShell.tsx
│   │   └── PageHeader.tsx
│   ├── discover/
│   │   ├── SearchForm.tsx
│   │   ├── ResultCard.tsx
│   │   └── ResultsList.tsx
│   ├── pipeline/
│   │   ├── StageFilter.tsx
│   │   ├── ProspectCard.tsx
│   │   ├── ProspectDetail.tsx
│   │   └── StageTimeline.tsx
│   ├── email/
│   │   ├── EmailPreview.tsx
│   │   ├── EmailEditor.tsx
│   │   └── BatchReview.tsx
│   ├── clients/
│   │   ├── ClientCard.tsx
│   │   ├── ClientDetail.tsx
│   │   ├── AnalyticsSummary.tsx
│   │   └── TierBadge.tsx
│   └── shared/
│       ├── StatusBadge.tsx
│       ├── EngagementSignal.tsx
│       ├── ActivityTimeline.tsx
│       └── EmptyState.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   ├── server.ts               # Server client
│   │   └── middleware.ts            # Auth middleware
│   ├── ai/
│   │   ├── client.ts               # Anthropic client init
│   │   ├── enrich.ts               # Enrichment prompt + handler
│   │   ├── generate-site.ts        # Site content generation
│   │   ├── generate-landing.ts     # Landing page generation
│   │   ├── generate-email.ts       # Email draft generation
│   │   └── prompts/                # Prompt templates as string literals
│   ├── queue/
│   │   ├── connection.ts           # Redis connection
│   │   ├── queues.ts               # Queue definitions
│   │   └── workers/
│   │       ├── enrichment.ts
│   │       ├── site-generation.ts
│   │       ├── deployment.ts
│   │       └── email-generation.ts
│   ├── services/
│   │   ├── google-places.ts        # Places API wrapper
│   │   ├── instantly.ts            # Instantly.ai API wrapper
│   │   ├── vercel-deploy.ts        # Vercel deployment API
│   │   └── plausible.ts            # Analytics API
│   ├── themes/                     # Design token configs per theme
│   │   ├── index.ts
│   │   ├── bold-trade.ts
│   │   ├── soft-care.ts
│   │   ├── warm-craft.ts
│   │   └── ... (8 themes total)
│   └── utils/
│       ├── cn.ts                   # className utility
│       ├── constants.ts
│       └── types.ts                # Shared TypeScript types
├── workers/                        # BullMQ worker entry points (run separately)
│   └── index.ts
└── supabase/
    └── migrations/                 # Database migration files
```

---

## Design Implementation

### Pipeline App UI

Refer to `reference/ui-mockups.html` for visual direction. Key design tokens:

```css
:root {
  /* Primary */
  --color-primary: #3E63DD;
  --color-primary-hover: #3358D4;
  --color-primary-light: #EDF2FE;

  /* Grays */
  --color-gray-50: #f8fafc;
  --color-gray-100: #f1f5f9;
  --color-gray-200: #e2e8f0;
  --color-gray-300: #cbd5e1;
  --color-gray-400: #94a3b8;
  --color-gray-500: #64748b;
  --color-gray-600: #475569;
  --color-gray-700: #334155;
  --color-gray-800: #1e293b;
  --color-gray-900: #0f172a;

  /* Semantic */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Typography */
  --font-family: var(--font-manrope), system-ui, sans-serif;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04);

  /* Spacing */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}
```

### Card Pattern
Every entity (prospect, client, email, notification) renders as a card. Cards have:
- White background, `--shadow-sm`, `--radius-lg`
- 16px padding on mobile, 20px on desktop
- Hover state: `--shadow-md` transition
- Status badge in top-right or as colored left border

### Sidebar Navigation
Left rail with 5 sections: Dashboard, Discover, Pipeline, Clients, Settings. Material Symbols icons with labels. Active state uses `--color-primary` with filled icon variant. Badge count on Pipeline item for "Ready for Review" items. Notification bell in the top header bar. Sidebar collapses to icon-only on narrow desktop viewports and to a hamburger menu on mobile.

### Empty States
Every list view needs an empty state. Follow UX writing skill patterns:
- Illustration or icon
- Short headline explaining why it's empty
- CTA to populate ("Start your first search", "No emails to review — check back soon")

---

## Content Generation Rules

**Read `knowledge/CONTENT_SEO_KB.md` before implementing any content generation.** It is the authoritative reference for all AI-generated content on client websites.

Key rules the AI must follow when generating client site content:

1. **Reading level:** 7th–8th grade for consumer-facing businesses, 9th–10th for professional services
2. **Sentence length:** 8–14 words average, never exceed 25 words
3. **Voice derivation:** Extract tone from the business's reviews and social presence. Map to the closest archetype (Trustworthy Expert, Warm Neighbor, Bold Professional, Friendly Guide, Calm Authority, Energetic Enthusiast)
4. **SEO:** Every page gets: semantic HTML, meta title/description, OG tags, LocalBusiness schema markup (subtyped per category), location-specific H1s, service-specific pages
5. **Accessibility:** WCAG 2.2 Level AA minimum. 4.5:1 contrast ratios, 44px touch targets, proper heading hierarchy, form labels, alt text, skip navigation, focus indicators
6. **Inclusive language:** Gender-neutral defaults, person-first disability language, no stereotypes, no assumptions about family structure or socioeconomic status
7. **No dark patterns:** No fake urgency, no bait-and-switch, no hidden costs, no manipulative countdown timers
8. **No hallucination:** Never invent services, reviews, credentials, or statistics. Only use data from the enriched business profile. If data is missing, omit the section rather than fabricate.

---

## Generated Client Sites

Client websites are a separate Next.js application (or dynamic routes within the main app) that renders content from the database based on subdomain.

### Dynamic Subdomain Routing (Option A — Recommended)
One Next.js app handles all client sites via middleware:
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const subdomain = hostname.split('.')[0]

  // If it's a client subdomain, rewrite to the client site renderer
  if (subdomain !== 'app' && subdomain !== 'go' && subdomain !== 'www') {
    return NextResponse.rewrite(new URL(`/sites/${subdomain}${request.nextUrl.pathname}`, request.url))
  }
}
```

### Theme Rendering
Each client site loads its `theme_config` JSON from the database and applies it as CSS custom properties at the root level. The same React components render differently based on the active theme. See `knowledge/DESIGN_SYSTEM.md` for the full theme specification.

---

## Notification System

### Push Notifications (Web Push API)
- Register service worker on first app load
- Request push permission during onboarding
- Send push on: email draft ready, prospect engagement (open/click/reply), site generation complete, errors

### Email Fallback
- For events where push isn't available, send summary email
- Daily digest option in settings: "Send me a summary of today's activity at 6pm"

### In-App
- Bell icon in header with unread count badge
- Notification center with filters: All, Emails, Pipeline, System
- Each notification deep-links to relevant screen

---

## Error Handling

- **API failures:** Retry with exponential backoff (3 attempts). On final failure, set status to `error` with error message in activity log. Show error state in UI with retry button.
- **AI generation failures:** If Claude returns malformed content, retry once with adjusted prompt. On second failure, flag for manual review.
- **Deployment failures:** Retry Vercel deploy once. On failure, store content locally and show "Deploy failed — retry" in UI.
- **Email delivery failures:** Instantly handles retries. On permanent bounce, update business record and move to appropriate status.
- **Rate limits:** Respect all API rate limits. Google Places: implement request queuing. Claude: batch where possible. Instantly: respect daily send limits per domain.

---

## Testing Strategy

- **Unit tests:** Business logic, data transformations, prompt construction
- **Integration tests:** API routes, database operations, queue processing
- **E2E tests:** Critical flows — discovery → pipeline → email review → send
- **Visual regression:** Key UI screens on mobile and desktop viewports
- **Content quality:** Automated checks against the quality checklist in the knowledge base

---

## UX Copy Standards

All interface copy in the pipeline app follows these rules (from the UX writing skill):

- **Buttons:** Active imperative verbs, sentence case. "Add to pipeline", "Approve and send", "Start search" — never "Submit" or "OK"
- **Error messages:** `[What failed]. [Why]. [What to do].` — never blame the user
- **Empty states:** Explanation + CTA. "No prospects yet. Search for businesses to get started."
- **Success messages:** Past tense, specific. "Email sent to Joe's Plumbing", "3 leads added to pipeline"
- **Loading states:** Present tense with context. "Enriching business data...", "Generating website..."
- **Notifications:** Verb-first title + contextual body. "Site ready — Joe's Plumbing website is live. Review the email draft."
- **Labels:** Clear noun phrases. "Business name", "Service area", "Review count"
- **Tone:** Professional but warm. Direct, not corporate. Helpful, not patronizing.
