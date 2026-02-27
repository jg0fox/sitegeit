# Reference Files

## UI Mockups (`ui-mockups.html`)

HTML mockup file showing the complete Sitegeit pipeline interface. Contains 7 screens:

1. **Business Lead Discovery Search** — Search for businesses by region and category, filter results, view cards
2. **Pipeline Queue Management** — Stage-based tabs, prospect cards with engagement signals
3. **Detailed Prospect CRM Record** — Full business profile, generated site preview, email draft, activity timeline
4. **Email Outreach Batch Review** — Review/edit/approve outreach emails before sending
5. **Active Client Roster & Analytics** — Client management with tier badges, expandable analytics
6. **SaaS Settings and Integrations** — Email domain management, templates, integrations, notification preferences
7. **System Notifications Activity Feed** — Chronological event feed with deep links

### Design System from Mockups

| Token | Value |
|---|---|
| Primary blue | `#3E63DD` / `#3b82f6` / `#0ea5e9` (blue spectrum) |
| Font | Manrope (Google Fonts) |
| Icons | Material Symbols Outlined, weight 300 |
| Card radius | 12px |
| Card shadow | `0 1px 3px rgba(0,0,0,0.08)` |
| Card padding | 20px |
| Spacing unit | 8px base |
| Border color | `#e2e8f0` |

### How to Use

The agent should reference these mockups for:
- Visual direction (spacing, shadows, card patterns, color usage)
- Component patterns (how cards, badges, buttons, tabs look)
- Layout structure (header, sidebar navigation, content area, split panes)
- Information hierarchy (what's prominent, what's secondary)

The mockups are a **visual guide**, not a pixel-perfect spec. The agent should match the aesthetic and patterns while using proper React/Tailwind/shadcn implementation.

## Adding the Mockup File

Copy the HTML mockup file provided separately into this directory as `ui-mockups.html`.
