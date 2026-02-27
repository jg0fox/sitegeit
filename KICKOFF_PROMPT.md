# Kickoff Prompt — Sitegeit

Copy this prompt into Claude Code to start building.

---

## Prompt

You are building **Sitegeit**, a desktop-primary SaaS pipeline (with responsive mobile support) for automated lead discovery, website generation, and outreach management. Read all project documentation before writing any code.

### Required reading (in this order)
1. `CLAUDE.md` — Your build instructions, architecture rules, file structure, and design implementation guide
2. `TECH_SPEC.md` — Full technical specification including data model, pipeline stages, API integrations, and implementation phases
3. `knowledge/CONTENT_SEO_KB.md` — Content design and SEO knowledge base. This is core to all AI-generated content.
4. `knowledge/DESIGN_SYSTEM.md` — Design system architecture for client site theming
5. `knowledge/INTERFACES.md` — Interface outlines for all 8 key screens
6. `reference/ui-mockups.html` — Visual reference for the pipeline app UI. Match this aesthetic.

### Before you write any code

Create an implementation plan. Walk through the full tech spec and knowledge base, then produce a phased build plan that covers:
- What you're building in each phase
- The order of operations and dependencies
- What testing you'll write at each phase
- Any assumptions or open questions you want to flag

Present the plan to me for approval before you start building.

### Development and deployment approach

**We are building and testing on Vercel, not locally.** Set up the Vercel project and deploy from the start. Every phase should result in a working deployment I can pull up on my phone and poke at. Do not spin up local dev servers — push to Vercel and test there.

**Use the Supabase CLI for all database and auth setup.** I don't want to go back and forth between Claude Code and the Supabase dashboard. Handle everything through the CLI:
- `supabase init` to set up the project
- `supabase db migrations` for all schema changes — write migration files, don't use the dashboard SQL editor
- `supabase db push` to apply migrations
- `supabase gen types` to generate TypeScript types from the schema
- Auth configuration, RLS policies, storage buckets, realtime subscriptions — all defined in migration files or config, not manual dashboard clicks
- If something genuinely can't be done via CLI (like creating the initial Supabase project or grabbing API keys), call it out explicitly so I can do just that one step and come back

**Build everything in each phase before testing**, but **bake testing workflows into your process throughout.** That means:
- Write unit tests, integration tests, and validation checks as you build each feature — not as a separate pass at the end
- Each phase should include its own test suite that runs in CI before deploy
- If a component has logic, it has a test. If an API route handles data, it has a test.
- Use Playwright or similar for E2E tests on critical flows once the UI is in place
- I don't want to stop and test manually between every small change. Build the phase, make sure tests pass, deploy, then I'll review the live deployment.

### What to build first (Phase 1: Foundation)

Set up the project with:
1. Next.js 14+ with App Router, TypeScript, Tailwind CSS
2. Vercel project configured and deploying from the repo
3. Supabase integration (auth + database + realtime)
4. Full database schema from the tech spec (all tables, all columns, all relationships)
5. The app shell — desktop-primary layout:
   - Collapsible sidebar navigation with 5 sections (Dashboard, Discover, Pipeline, Clients, Settings)
   - Top header bar with page title and notification bell
   - Auth flow (Supabase magic link)
   - This should look like a proper SaaS dashboard (think Linear, Vercel, HubSpot) — not a mobile app stretched to fill a desktop screen
6. Dashboard page with placeholder data showing:
   - Pipeline summary cards (count per stage)
   - Recent activity feed
   - MRR snapshot
   - Quick action buttons
7. Basic notification bell with unread count
8. CI pipeline: linting, type checking, and test runner wired up to run before each Vercel deploy

Use Manrope font, Material Symbols icons (Outlined, 300 weight), and the French Blue color system (`#3E63DD` primary) from the mockups. Design for desktop first — the UI should feel like a polished SaaS dashboard with appropriate information density. Ensure it degrades gracefully to tablet and mobile with responsive breakpoints.

Follow the UX copy standards in `CLAUDE.md` for all interface text. Reference `reference/ui-mockups.html` for visual direction on card patterns, spacing, shadows, and layout.
