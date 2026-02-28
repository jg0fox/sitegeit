# Pipeline Audit — February 28, 2026

## Full Pipeline Trace (End-to-End)

### Stage 1: Discovery

**Trigger:** User submits search form on `/discover` page.

**What happens:**
1. Client POST to `/api/discover` with `{ region, category, radius_km, filters }`
2. API calls Google Places Nearby Search + Place Details for each result
3. For each result, `detectWebPresence()` is called synchronously (5s timeout each)
4. Results returned to client, cached in `sessionStorage` under key `sitegeit_discover_state`
5. Search parameters saved to `search_queries` table via POST to `/api/discover/saved-searches`

**Data written:** `search_queries` table only (results NOT persisted to any table)

**Data returned to client:** Array of `DiscoveryResult` objects held in React state + sessionStorage

**What next stage expects:** User selects results and clicks "Add to pipeline"

---

### Stage 2: Add to Pipeline

**Trigger:** User clicks "Add to pipeline" button with selected businesses.

**What happens:**
1. Client POST to `/api/discover/add-to-pipeline` with selected results + category
2. Route upserts user profile in `users` table (FK requirement)
3. For each result: checks for duplicate `google_place_id`, inserts into `businesses` table with `status = 'discovered'`
4. For each inserted business: inserts `activity_log` entry (`lead_discovered`)
5. For each inserted business: calls `publishToWorker('enrich', { businessId })` — **failure silently caught**

**Data written:**
- `users` (upsert)
- `businesses` (insert, status = `discovered`)
- `activity_log` (insert, event_type = `lead_discovered`)

**Data passed to next stage:** `{ businessId }` via QStash message

---

### Stage 3: Enrichment (`/api/workers/enrich`)

**Trigger:** QStash delivers message to worker endpoint.

**What happens:**
1. `verifySignatureAppRouter` verifies QStash signature
2. `enrichBusiness(businessId)` called:
   - Fetches business from `businesses` table
   - Sets `status = 'enriching'`
   - Builds prompt from business data (review_excerpts always empty — **TODO in code, never implemented**)
   - Calls Claude Sonnet 4.6 via `generateJSON()`
   - Updates business with enrichment fields + `status = 'enriched'` + `enriched_at`
   - Inserts `activity_log` entry (`enrichment_complete`)
3. Chains next: `publishToWorker('generate-site', { businessId })`

**Data written:**
- `businesses` (update: brand_voice, brand_colors, value_proposition, services, service_area, target_audience, review_sentiment, owner_name, status = `enriched`, enriched_at)
- `activity_log` (insert, event_type = `enrichment_complete`)

**Data passed to next stage:** `{ businessId }`

---

### Stage 4: Site Generation (`/api/workers/generate-site`)

**Trigger:** QStash delivers message.

**What happens:**
1. `generateSite(businessId)` called:
   - Fetches business from `businesses` table
   - Sets `status = 'generating'`
   - Selects theme via `getThemeForCategory(category_slug)` + layout via `getLayoutForCategory()`
   - Calls Claude with enriched profile + theme + layout
   - Generates URL slug from business name: `name.toLowerCase().replace(/[^a-z0-9]+/g, '-')`
   - **Inserts `generated_sites` record with `deploy_url = '{slug}.sitegeit.com'` and `deploy_status = 'pending'`**
   - Updates business `generated_at` timestamp — **does NOT update status**
   - Inserts `activity_log` entry (`site_generated`)
2. Chains next: `publishToWorker('deploy', { businessId, siteId })`

**Data written:**
- `businesses` (update: status = `generating`, generated_at)
- `generated_sites` (insert: all content fields, deploy_url = `{slug}.sitegeit.com`, deploy_status = `pending`)
- `activity_log` (insert, event_type = `site_generated`)

**Data passed to next stage:** `{ businessId, siteId }`

---

### Stage 5: Deploy (`/api/workers/deploy`)

**Trigger:** QStash delivers message.

**What happens:**
1. Fetches `generated_sites` record by siteId
2. **Updates `deploy_status` from `pending` to `live` — no actual deployment happens**
3. Chains next: `publishToWorker('generate-email', { businessId, siteId })`

**Data written:**
- `generated_sites` (update: deploy_status = `live`)

**Data passed to next stage:** `{ businessId, siteId }`

---

### Stage 6: Email Generation (`/api/workers/generate-email`)

**Trigger:** QStash delivers message.

**What happens:**
1. `generateLandingPage(businessId, siteId)` called:
   - Fetches business, generated_sites, and user record
   - Gets `calendly_link` from user (defaults to `https://calendly.com` if not set — **broken link**)
   - Calls Claude to generate landing page content
   - **Inserts `landing_pages` record with `deploy_url = 'go.sitegeit.com/{slug}'` and `deploy_status = 'live'`**
   - Inserts `activity_log` entry (`landing_page_generated`)
2. `generateEmail(businessId, landingPageId)` called:
   - Fetches business, landing_page, and user record
   - Calls Claude to generate primary email + 2 follow-ups
   - Inserts 3 `outreach_emails` records (review_status = `draft`, sequence_positions 1, 2, 3)
   - **Updates business `status = 'review_ready'`**
   - Inserts `activity_log` entry (`email_drafted`)
3. Inserts `notifications` record (type = `pipeline`, title = "Pipeline complete")

**Data written:**
- `landing_pages` (insert: deploy_url = `go.sitegeit.com/{slug}`, deploy_status = `live`)
- `outreach_emails` (3 inserts: review_status = `draft`)
- `businesses` (update: status = `review_ready`)
- `activity_log` (2 inserts: `landing_page_generated`, `email_drafted`)
- `notifications` (insert: pipeline complete notification)

---

### Stage 7: Email Review UI (`/email-review`)

**Current state:** Completely unimplemented. Shows hardcoded empty state: "No emails to review." Does NOT query `outreach_emails` table.

---

### Stage 8: Pipeline Queue UI (`/pipeline`)

**Current state:** Queries `businesses` table filtered by user_id and optional status tab. Shows cards for each business with StatusBadge, category, location, rating. Working correctly for listing.

---

### Stage 9: Dashboard Counts

**Current state:**
- `PipelineSummary`: Queries `businesses` table with 7 separate count queries (one per stage). Working.
- `QuickActions`: Counts `review_ready` and `responded` businesses. Badge for "Review drafts" links to `/email-review` (which is empty). Badge for "View responses" links to `/pipeline`.
- `RecentActivity`: Queries `activity_log` table, last 10 entries. Working.
- `MRRSnapshot`: Counts `active` businesses and sums `monthly_rate`. Working (shows $0 since no active clients yet).

---

## Root Cause Analysis

### Issue 1: Generated sites and landing pages don't exist at their URLs

**Root causes (3 separate problems):**

**1a. URLs reference non-existent domains.**
- `generated_sites.deploy_url` is set to `{slug}.sitegeit.com` (e.g., `power-pro-electricians-of-san-francisco.sitegeit.com`)
- `landing_pages.deploy_url` is set to `go.sitegeit.com/{slug}`
- These domains don't exist. The app is at `seitgeit.vercel.app`. There is no DNS for `*.sitegeit.com`.
- The middleware at `src/middleware.ts` does have rewrite logic for subdomain routing, but it only activates when `hostname.endsWith('.sitegeit.com')` — which never happens on `seitgeit.vercel.app`.
- **However:** The internal routes `/sites/[slug]` and `/sites/go/[slug]` DO exist and would render correctly at `seitgeit.vercel.app/sites/{slug}` — IF the database query worked.

**1b. Site rendering route fails due to duplicate records.**
- The `sites/[slug]/page.tsx` queries: `generated_sites WHERE deploy_url = '{slug}.sitegeit.com' AND deploy_status = 'live'` using `.single()`
- Due to QStash retries from earlier debugging sessions, the generate-site worker ran 3 times, creating 3 duplicate `generated_sites` records with the same `deploy_url`
- `.single()` fails when multiple rows match, returning null, so the page returns 404
- **This is a missing idempotency problem.** Workers must be idempotent — if the same business is processed twice, it should update the existing record, not create a duplicate.

**1c. No actual deployment step.**
- The `/api/workers/deploy` worker doesn't deploy anything. It just changes `deploy_status` from `pending` to `live`.
- Comment in code: "For MVP, 'deployment' means marking the site as live since all sites are rendered dynamically via subdomain routing"
- This is fine architecturally — the site content IS in the database and the render routes DO exist — but the "deploy_url" values should point to actually-accessible URLs.

**Summary:** Sites ARE generated and stored in the database with full content. The rendering routes exist. But:
- The URLs written to the DB reference a non-existent domain
- Duplicate records from retries cause `.single()` to fail
- The internal routes (`/sites/{slug}`) would work if duplicates were cleaned up and the query URL pattern matched

---

### Issue 2: Email drafts exist but review page is empty

**Root cause:** The email review page (`/email-review/page.tsx`) is not implemented. It's a static component that renders an `EmptyState` with no database queries whatsoever.

```tsx
// Current implementation — entire file:
export default function EmailReviewPage() {
  return (
    <EmptyState
      icon="rate_review"
      title="No emails to review"
      description="When the pipeline generates outreach emails, they'll appear here..."
    />
  )
}
```

Meanwhile, the `outreach_emails` table has 3 real draft records (confirmed in database). The dashboard's `QuickActions` component correctly counts businesses with `status = 'review_ready'` (which shows the badge), but the review page it links to doesn't query anything.

---

### Issue 3: Discovery search results don't persist

**Root cause:** Search results are only stored in:
1. React state (lost on component unmount)
2. `sessionStorage` (lost on browser close, limited to same-tab navigation)

The actual Google Places results are never written to any database table. The `search_queries` table only stores the search parameters and `result_count`, not the result data itself. Businesses are only written to the `businesses` table when the user explicitly clicks "Add to Pipeline."

This means:
- Navigating to another tab within the same browser session and back: results ARE restored from sessionStorage (working)
- Closing the browser or opening in a new tab: results are gone
- Each re-run of a search costs another Google Places API call

---

### Issue 4: General data flow integrity

**4a. No Realtime subscriptions.**
Not a single component uses Supabase Realtime. All data is fetched once on server render. When a pipeline stage completes, the UI does NOT update — the user must manually refresh. This contradicts the CLAUDE.md spec which says "Use Supabase Realtime subscriptions to push status updates to the frontend."

**4b. Notifications are entirely mock data.**
Both `NotificationBell.tsx` and `notifications/page.tsx` use hardcoded `MOCK_NOTIFICATIONS` arrays. The worker pipeline DOES write real notification records to the `notifications` table, but no UI component reads from it.

**4c. Sidebar pipeline badge is hardcoded to `3`.**
`Sidebar.tsx` line 104 renders a literal `3` instead of fetching the actual count.

**4d. Status lifecycle has a gap.**
- `generateSite()` sets status to `generating` but never advances it
- The `generateEmail()` function (called 2 stages later) is what sets `review_ready`
- If the deploy or generate-email stages fail, business is stuck in `generating` forever with no recovery mechanism

**4e. Worker idempotency is broken.**
- No duplicate detection on `generated_sites`, `landing_pages`, or `outreach_emails` inserts
- QStash retries (or manual re-triggers) create duplicate records
- Test business has 3 `generated_sites` records, likely 3 `landing_pages`, and potentially 9 `outreach_emails` (3 sets of 3)
- The `.single()` queries in rendering routes fail with multiple matches

**4f. Activity log is working correctly.**
All stages write to `activity_log` with appropriate event types. The `RecentActivity` component reads and displays them. This is the one part that's working end-to-end.

**4g. Status transitions are mostly correct (when they fire).**
Traced the actual status transitions:
- `discovered` → `enriching` → `enriched` → `generating` → (gap) → `review_ready`
- The gap between `generating` and `review_ready` spans 3 workers (generate-site, deploy, generate-email)
- No status for "generated" or "deploying" — jumps from `generating` straight to `review_ready`

---

## Fix Plan

### Priority 1: Fix site/landing page accessibility (Issue 1)

**Fix 1a: Change deploy_url to use actual accessible paths.**

In `src/lib/ai/generate-site.ts`, change:
```typescript
// Before:
deploy_url: `${slug}.sitegeit.com`
// After:
deploy_url: `${slug}`  // Just store the slug
```

In `src/lib/ai/generate-landing.ts`, change:
```typescript
// Before:
deploy_url: `go.sitegeit.com/${slug}`
// After:
deploy_url: `${slug}`  // Just store the slug
```

Update the rendering routes to query by slug directly:
- `sites/[slug]/page.tsx`: query `deploy_url = slug` (drop the `.sitegeit.com` suffix)
- `sites/go/[slug]/page.tsx`: query `deploy_url = slug` (drop the `go.sitegeit.com/` prefix)

**Decision needed:** Should we keep the middleware subdomain routing for future use, or remove it and only support path-based routing for now? I recommend keeping the middleware but making it dormant until a custom domain is configured.

**Fix 1b: Add idempotency to all workers.**

Each worker should check for existing records before inserting:
- `generate-site`: Before inserting, check if `generated_sites` already exists for this `business_id`. If so, update it instead of inserting a new one.
- `generate-landing`: Same for `landing_pages`.
- `generate-email`: Same for `outreach_emails`. Check by `business_id` + `sequence_position`.
- `deploy`: Already idempotent (just updates status).

Also add a unique constraint: `generated_sites(business_id)` UNIQUE (only one active site per business).

**Fix 1c: Clean up duplicate records from test runs.**

Delete the extra `generated_sites`, `landing_pages`, and `outreach_emails` records in the database.

---

### Priority 2: Implement email review page (Issue 2)

The `/email-review` page needs to:
1. Query `outreach_emails` table joined with `businesses` where `review_status = 'draft'`
2. Display each email with subject, body, business name
3. Allow editing the subject and body
4. Allow approving (setting `review_status = 'approved'`) or rejecting
5. Show the email sequence (primary + follow-ups) grouped by business

This is a full feature implementation — it should:
- Query: `outreach_emails JOIN businesses ON outreach_emails.business_id = businesses.id WHERE businesses.user_id = ? AND outreach_emails.review_status = 'draft' ORDER BY businesses.name, outreach_emails.sequence_position`
- Group by business, show as expandable cards
- Include "Approve" and "Edit" actions per email

---

### Priority 3: Fix discovery persistence (Issue 3)

**Option A (recommended): Store search results in `businesses` table immediately.**
When the discovery API returns results, insert each one into `businesses` with a new status like `search_result` (or keep using sessionStorage but upgrade to something more durable). When user clicks "Add to Pipeline", change status from `search_result` to `discovered` and queue enrichment.

**Decision needed:** Do you want search results stored in the database immediately (more durable, costs DB writes) or cached in localStorage with longer persistence (simpler, no DB changes)?

**Option B: Use localStorage instead of sessionStorage.**
Replace `sessionStorage` with `localStorage` + a TTL mechanism. Results persist across browser closes. Add cache invalidation (e.g., 24-hour expiry).

---

### Priority 4: Wire up notifications (Issue 4b)

Replace mock data in `NotificationBell.tsx` and `notifications/page.tsx` with real Supabase queries:
- Query: `notifications WHERE user_id = ? ORDER BY created_at DESC`
- Mark as read: `UPDATE notifications SET read = true WHERE id = ?`
- Mark all read: `UPDATE notifications SET read = true WHERE user_id = ? AND read = false`

---

### Priority 5: Fix sidebar badge (Issue 4c)

Options:
- Make Sidebar a server component that queries the count
- Pass count as a prop from the dashboard layout
- Use a client-side fetch on mount

---

### Priority 6: Fix status lifecycle gap (Issue 4d)

Add intermediate status updates:
- After `generated_sites` insert succeeds: set business status to `generated` (new status, add to allowed values)
- Or simpler: just leave the gap and ensure the `review_ready` update in `generate-email` worker fires reliably

**Decision needed:** Should we add a `generated` status to the pipeline, or is the jump from `generating` → `review_ready` acceptable? The user doesn't currently see or interact with the intermediate state.

---

### Priority 7: Add Realtime subscriptions (Issue 4a)

This is a larger effort. Minimum viable approach:
- Add Realtime subscription on the Pipeline page for the `businesses` table (listen for status changes)
- Add Realtime subscription on the NotificationBell for the `notifications` table (listen for new notifications)
- Dashboard can stay server-rendered (refresh on navigation is acceptable for now)

---

### Tests to Add

1. **Worker idempotency test:** Run the same businessId through generate-site twice; verify only 1 `generated_sites` record exists
2. **URL rendering test:** Verify `seitgeit.vercel.app/sites/{slug}` returns 200 for a business with a generated site
3. **Email review query test:** Verify the email review page's query returns the same records that the dashboard counts
4. **Status transition test:** Trace a business from `discovered` through `review_ready` and verify each status change
5. **Notification delivery test:** Verify pipeline completion writes to `notifications` table AND the UI reads it

---

## Database State (Current Test Business)

Business: Power Pro Electricians Of San Francisco (`898bcd0b-6ef7-493d-853f-06ae8426f098`)

| Table | Records | Issue |
|-------|---------|-------|
| `businesses` | 1, status = `review_ready` | Manually fixed; was stuck at `generating` due to retry race condition |
| `generated_sites` | **3 duplicates** | All with same deploy_url, all `deploy_status = 'live'` |
| `landing_pages` | 1 | deploy_url = `go.sitegeit.com/power-pro-electricians-of-san-francisco` |
| `outreach_emails` | 3 (positions 1, 2, 3) | All `review_status = 'draft'`, correct subjects |
| `activity_log` | 7 entries | 3x `enrichment_complete` (from retries), plus correct chain |
| `notifications` | 1 | "Pipeline complete" — correct, but UI uses mock data |

---

## Implementation Order

1. **Clean up duplicate records** (quick DB fix)
2. **Fix deploy_url format** + update rendering route queries (foundational)
3. **Add worker idempotency** (prevents future duplicates)
4. **Implement email review page** (user-facing, high impact)
5. **Wire notifications to real data** (user-facing)
6. **Fix sidebar badge** (cosmetic but misleading)
7. **Improve discovery persistence** (UX improvement)
8. **Add Realtime subscriptions** (polish)
