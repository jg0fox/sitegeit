# Interface Outlines — Sitegeit

Eight key interfaces for the pipeline app, organized by the workflow you'd move through on your phone.

---

## 1. Dashboard (Home)

The landing screen. At a glance status and quick actions.

**Pipeline summary:** Count of leads per stage displayed as a horizontal card strip (scrollable on mobile). Each card: stage name, count, color indicator. Stages: Discovered, Enriching, Generating, Ready for Review, Sent, Responded, Meeting Scheduled.

**Recent activity feed:** Scrollable list of latest events. "Site generated for Joe's Plumbing", "Maria at Sunrise Bakery opened your email (3rd time)", "New reply from Oakland Auto Repair". Each item tappable → deep links to relevant screen.

**Quick action buttons:** Row of 2–3 prominent buttons: "New search", "Review drafts" (with badge count), "View responses" (with badge count).

**MRR snapshot:** Card at bottom or top showing: Active clients count, Monthly revenue, Average deal size, Churn rate (this month).

---

## 2. Lead Discovery

**Search form:**
- Region input: city name, zip code, or "use current location" with radius slider
- Business category: searchable dropdown or category grid (common types: Plumber, Electrician, HVAC, Roofer, Bakery, Restaurant, Dentist, Lawyer, Salon, Auto Repair, Landscaper, Cleaning, etc.)
- Filters (collapsible): minimum rating, minimum reviews, website status filter (no website / social only / outdated site), has phone number, verified business, ads active
- Search button

**Results view:**
- Scrollable card list. Each card shows:
  - Business name (bold)
  - Category badge
  - Star rating + review count
  - Address (truncated)
  - Phone number
  - Web presence status badge: "No website" (red), "Social only" (orange), "Outdated site" (yellow), "Active" (green, dimmed — low priority)
  - Checkbox for multi-select
- Tap card to expand: full address, hours, photos (thumbnail strip), links to Google Maps/Yelp, preview of online presence
- Sticky bottom bar: "Add X to pipeline" button with count badge
- Pull-to-refresh for updated results

**Saved searches:** Accessible from a "Saved" tab. List of previous searches with region, category, result count, last run date. Tap to re-run.

---

## 3. Pipeline Queue

The workhorse screen — all prospects moving through the pipeline.

**Stage tabs:** Horizontal scrollable tab bar at top. Tabs: All | Enriching | Generating | Ready for Review | Sent | Responded. Each tab shows count badge. "Ready for Review" tab is highlighted/emphasized.

**Prospect cards:** Vertically scrollable list. Each card shows:
- Business name + category
- Current stage badge (colored)
- Time in current stage ("2h ago", "3 days")
- Key engagement signals (for Sent/Responded stages):
  - "Email opened" with open count
  - "Clicked landing page" with click count
  - "Replied" indicator
  - "High intent" badge (if 3+ opens or landing page visits)
- Quick actions: "Review email" button (for Ready for Review stage), "View details" link

**Sorting:** Most recent activity first by default. Toggle: by stage, by date added, by engagement level.

**Batch actions:** Long-press to enter select mode. Actions: "Approve all emails", "Archive selected", "Move to stage".

---

## 4. Prospect Detail (CRM Record)

Deep dive on a single business/prospect.

**Header section:** Business name (large), category badge, status badge, star rating + review count. Contact row: tappable phone, tappable email (if available), Google Maps link, Yelp link.

**Generated site preview:** Screenshot thumbnail of the generated site. "View site" button opens in browser. Site URL displayed (copyable). Deploy status indicator.

**Landing page preview:** Thumbnail + "View landing page" button. Landing page URL (copyable).

**Email draft section:** Subject line + body preview. "Edit and send" button. If already sent: delivery status, open/click tracking. If multiple emails in sequence: show all with sequence position labels.

**Pipeline stage visualization:** Horizontal stepper showing all stages. Current stage highlighted. Tappable to manually advance or revert.

**Activity timeline:** Chronological feed of all events for this prospect: discovered, enriched, site generated, email drafted, email sent, opened (with timestamps), clicked, replied, notes added, status changes. Each entry shows timestamp and event detail.

**Notes section:** Free-text input + list of previous notes with timestamps. "Add note" button.

**Actions:** Archive, Mark as closed/won, Mark as closed/lost, Delete. Tier selection (if converting to client): Starter, Growth, Pro, Premium with monthly rate auto-populated.

---

## 5. Email Review

Focused interface for reviewing and approving outreach emails.

**Single review mode:**
- Split view on desktop: prospect context panel on the left, full email on the right
- Subject line: displayed in email-style header, clickable to edit
- Email body: rendered as it would appear in recipient inbox. Click to edit inline.
- Landing page link: clickable to preview in new tab
- Action bar (right-aligned or bottom): "Approve & send" (primary, large), "Edit" (secondary), "Skip" (tertiary)

**Batch review mode:**
- Table/list view showing all pending emails. Each row: business name, subject line preview, status, approve/skip action buttons inline.
- Click a row to expand into single review mode (or open in side panel)
- Progress indicator: "3 of 12 reviewed"
- Keyboard shortcuts: A = approve, S = skip, E = edit, ↑↓ arrow keys to navigate between emails
- On mobile: rows stack as cards, actions become buttons below each card

**Queue visibility:** Counter showing "X emails ready for review". Filter by: all pending, today's drafts, follow-ups.

---

## 6. Client Management

Active client roster — businesses that have converted to paying customers.

**Metrics bar (sticky top):**
- Total active clients
- Monthly recurring revenue
- Average deal size
- Retention rate (%)

**Client list:**
- Searchable, filterable table/card list
- Each row: client name, tier badge (Starter/Growth/Pro/Premium), monthly rate, status (Active/Paused/Churned), site URL, last billing date
- Filter by: tier, status, date converted
- Sort by: name, tier, revenue, date

**Expanded client detail (tap to expand or navigate):**
- Same as Prospect Detail, plus:
- **Tier & billing:** Current plan, billing history, upgrade/downgrade buttons, next billing date
- **Site management:** Live site link, deploy status, custom domain status, "Update site" button, version history
- **Analytics summary (Growth+ tiers):** Visitors this month, top pages, contact form submissions, phone call clicks. Mini chart showing trend.
- **Reports (Pro+ tiers):** List of generated weekly/monthly reports. Tap to view.
- **Content updates (Pro+ tiers):** Blog posts generated, social content generated. Status: published/draft.
- **Growth experiments (Premium tier):** Active A/B tests, variant performance, recommendations.

---

## 7. Settings & Configuration

**Email accounts section:**
- List of connected sending domains
- Per domain: email address, warmup status (Warming / Ready / Flagged), health score (0–100), daily send limit, emails sent today
- DNS status indicators: SPF ✓/✗, DKIM ✓/✗, DMARC ✓/✗
- "Add domain" button
- Warmup progress visualization

**Templates section:**
- Email templates: browse and edit outreach email templates (initial, follow-up 1, follow-up 2)
- Landing page templates: preview and configure
- Site templates: browse available themes with preview thumbnails
- Email signatures: edit default signature

**Integrations section:**
- Instantly.ai: connection status, API key management
- Calendly/Cal.com: linked scheduling URL
- Google Places: API key status, usage this month
- Plausible Analytics: connection status
- Future: HubSpot, Slack, Zapier (toggle switches)

**Notification preferences:**
- Toggle notifications per event type: email drafted, email opened, email clicked, email replied, email bounced, site generated, system errors
- Delivery method per type: push notification, email, or both
- Daily digest: toggle + delivery time

**Profile section:**
- Business name (your Sitegeit business)
- Your name, email, phone
- Calendly link (used in landing pages)
- Avatar upload (for future landing page video)
- Physical address (for CAN-SPAM compliance in outreach emails)
- Default email signature

---

## 8. Notifications Center

Accessible from bell icon in header (every screen).

**Feed view:** Chronological list of all system events, newest first.

**Event types with icons:**
- Email opened (eye icon) — "{Business name} opened your email"
- Email clicked (cursor icon) — "{Business name} clicked your landing page"
- Email replied (reply icon) — "New reply from {Business name}" ← HIGH PRIORITY, visual emphasis
- Email bounced (warning icon) — "Email to {Business name} bounced — invalid address"
- Site generated (check icon) — "Website ready for {Business name}"
- Email drafted (edit icon) — "Email draft ready for {Business name} — review now"
- Campaign launched (rocket icon) — "Batch of X emails sent"
- System alert (alert icon) — "Instantly.ai domain health dropped below 80"
- Lead imported (plus icon) — "X new leads added from search"

**Grouping:** By time — Today, Yesterday, This Week, Earlier.

**Actions per notification:**
- Click → deep link to relevant screen
- Dismiss button or right-click → mark read
- "Mark all read" button

**Filters:** All | Emails | Pipeline | System

**Unread badge:** Shows on bell icon across all screens. Count updates in real time via Supabase Realtime.

---

## Navigation Structure

### Desktop (Primary — Sidebar Navigation)
Left rail sidebar with 5 sections:
```
┌──────────┐
│ Dashboard │
│ Discover  │
│ Pipeline  │
│ Clients   │
│ Settings  │
└──────────┘
```
Pipeline item shows badge count for "Ready for Review" items. Notification bell in the top header bar. Sidebar collapses to icon-only on narrower desktop viewports. Content area uses full available width — split views (list + detail side by side) for Pipeline Queue and Client Management.

### Primary Daily Flow
```
Dashboard → Notifications (check what's ready) → Email Review (approve/send) → Pipeline Queue (check status)
```
Lead Discovery and Client Management are less frequent but equally important.

### Mobile / Tablet (Responsive fallback)
Sidebar collapses to hamburger menu. Layouts reflow to single column. Touch targets ≥ 44px. Navigation and key actions remain accessible from a compact top bar.
