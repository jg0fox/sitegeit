# Sitegeit Site Generation Overhaul — Unified Plan

**Status:** Planning
**Author:** Fason + Claude
**Date:** March 3, 2026
**Scope:** Enrichment fallbacks, content model, rendering pipeline, component design, SEO

---

## The Problem in One Paragraph

Sitegeit's site generation pipeline has the right architecture but four compounding gaps. First, thin enrichment data (businesses with few reviews and no social presence) produces near-empty profiles that force the content generator to either fabricate or go generic. Second, there's no fallback system — thin data and rich data produce the same output shape. Third, the generation prompt already produces service pages, FAQ, about, and contact content, but the rendering layer only implements the homepage — that content sits unused in the database. Fourth, the components that do render are visually identical across all 8 themes — colors change but the spatial design, component structure, and visual personality don't. Fixing any one of these alone won't close the quality gap. They need to be addressed together.

---

## Architecture of the Fix

The overhaul has four layers, each building on the one before it:

```
Layer 1: Enrichment Confidence System
  → Scores data quality, triggers category defaults for gaps

Layer 2: Content Model & Generation Prompt Overhaul
  → New content schema, fallback-aware generation, tone spectrum integration

Layer 3: Rendering Pipeline
  → Service pages, about, contact, FAQ rendering + section ordering system

Layer 4: Component & Design Overhaul
  → Visual differentiation per theme, layout variants, design polish
```

Each layer can be developed and tested independently, but they ship together as a single release.

---

## Layer 1: Enrichment Confidence System

### Problem
The enrichment worker returns nulls and hedging language when data is thin ("Due to insufficient review and social media data, a precise communication personality cannot be determined"). The generation prompt receives this and has no rules for what to do with it.

### Solution
Add a **confidence scoring system** to the enrichment output, plus a **category defaults registry** that fills gaps with sensible industry-specific defaults.

### 1.1 Enrichment Confidence Score

Add a new field to the enrichment output: `data_confidence`, an object that scores each critical field.

```typescript
// Added to EnrichmentOutput
interface DataConfidence {
  overall: 'high' | 'medium' | 'low'  // high: 20+ reviews + social presence
                                        // medium: 5-19 reviews OR social presence
                                        // low: <5 reviews AND no social presence
  fields: {
    brand_voice: 'verified' | 'inferred' | 'default'
    services: 'verified' | 'inferred' | 'default'
    value_proposition: 'verified' | 'inferred' | 'default'
    testimonials: 'verified' | 'unavailable'
    owner_name: 'verified' | 'unavailable'
    hours: 'verified' | 'unavailable'
    certifications: 'verified' | 'unavailable'
  }
}
```

**Scoring rules:**
- `verified` = directly confirmed by review text, Google profile, or social media
- `inferred` = reasonably derived from category + location + limited signals
- `default` = populated from category defaults registry (no business-specific signal)
- `unavailable` = no data and no reasonable default

The enrichment prompt should be updated to output this confidence object. The key instruction: **"When data is insufficient, return the field as null AND set its confidence to 'unavailable'. Do not hedge or apologize in the field value itself. The confidence scoring system handles uncertainty — the content fields should contain only usable content or null."**

### 1.2 Category Defaults Registry

A static data file that provides sensible defaults per business category when enrichment returns nulls.

```typescript
// src/lib/defaults/category-defaults.ts

interface CategoryDefaults {
  voice_archetype: string
  voice_characteristics: string[]
  typical_services: { name: string; description: string; icon: string }[]
  typical_hours: Record<string, string>
  trust_signals: string[]
  cta_language: { primary: string; secondary: string }
  faq_templates: { question: string; answer_template: string }[]
  pricing_language: string | null
  hero_templates: { headline_template: string; subheadline_template: string }[]
}

// Example for auto_repair:
const auto_repair: CategoryDefaults = {
  voice_archetype: 'Bold Professional',
  voice_characteristics: [
    'Direct and practical',
    'Emphasizes reliability and honesty',
    'Uses trade terminology comfortably',
  ],
  typical_services: [
    { name: 'Brake Service', description: 'Inspection, pad and rotor replacement, brake fluid flush, and caliper repair.', icon: 'brake_alert' },
    { name: 'Engine Diagnostics', description: 'Computer scanning, fault code analysis, and performance testing to pinpoint the problem.', icon: 'troubleshoot' },
    { name: 'Oil Change', description: 'Conventional and synthetic oil changes with filter replacement and fluid top-off.', icon: 'oil_barrel' },
    { name: 'Tire Service', description: 'Rotation, balancing, alignment, and flat repair to extend tire life.', icon: 'tire_repair' },
    { name: 'AC & Heating', description: 'Diagnosis and repair of compressors, condensers, and climate control systems.', icon: 'ac_unit' },
    { name: 'General Repair', description: 'Belts, hoses, batteries, starters, alternators, and other common repairs.', icon: 'build' },
  ],
  typical_hours: {
    monday: '8:00 AM – 5:30 PM',
    tuesday: '8:00 AM – 5:30 PM',
    wednesday: '8:00 AM – 5:30 PM',
    thursday: '8:00 AM – 5:30 PM',
    friday: '8:00 AM – 5:30 PM',
    saturday: '9:00 AM – 2:00 PM',
    sunday: 'Closed',
  },
  trust_signals: [
    'Licensed & Insured',
    'All Makes & Models',
    'Honest Estimates',
  ],
  cta_language: {
    primary: 'Call for an Estimate',
    secondary: 'See Our Services',
  },
  faq_templates: [
    { question: 'How much does {service} cost in {city}?', answer_template: 'The cost of {service} varies depending on your vehicle and the scope of work. Call us for a free estimate — we\'ll give you an honest price before we start.' },
    { question: 'Do you work on {make/model}?', answer_template: 'We service all makes and models, domestic and import. If it has an engine, we can help.' },
    { question: 'How long does {service} take?', answer_template: 'Most {service} jobs are completed same-day. We\'ll give you a time estimate when you drop off.' },
  ],
  pricing_language: 'Call for a free estimate. We provide upfront pricing before starting any work.',
  hero_templates: [
    { headline_template: 'Honest Auto Repair in {city}', subheadline_template: '{city} drivers trust {business_name} for straight answers and work that lasts.' },
    { headline_template: 'Your Check Engine Light Deserves a Straight Answer', subheadline_template: 'Fast diagnostics, fair prices, and repairs done right the first time in {city}.' },
    { headline_template: 'Auto Repair You Can Count On in {city}', subheadline_template: 'From brakes to engines, {business_name} keeps {city} on the road.' },
  ],
}
```

**This registry needs to be built for every category in `CATEGORY_THEME_MAP`.** That's approximately 30 categories. Each one needs: typical services (6), FAQ templates (5-8), hero headline variants (3), trust signals (3-4), default hours, and CTA language.

### 1.3 Fallback Merge Logic

A utility function that merges enrichment output with category defaults, respecting the confidence scores.

```typescript
// src/lib/defaults/merge.ts

function mergeWithDefaults(
  enrichment: EnrichmentOutput,
  confidence: DataConfidence,
  defaults: CategoryDefaults,
  businessData: { name: string; city: string; state: string; phone: string }
): MergedProfile {
  return {
    // Use enrichment data when verified/inferred, fall back to defaults
    brand_voice: confidence.fields.brand_voice !== 'default'
      ? enrichment.brand_voice
      : `${defaults.voice_archetype}. ${defaults.voice_characteristics.join('. ')}.`,

    services: confidence.fields.services !== 'default'
      ? enrichment.services
      : defaults.typical_services.map(s => s.name),

    service_details: confidence.fields.services !== 'default'
      ? null  // generation prompt will create descriptions from enrichment
      : defaults.typical_services,  // pre-built descriptions available

    hours: confidence.fields.hours === 'verified'
      ? enrichment.hours
      : defaults.typical_hours,

    // Always include these from defaults (supplementary, not replacement)
    trust_signals: defaults.trust_signals,
    faq_templates: defaults.faq_templates,
    hero_options: defaults.hero_templates,
    cta_language: defaults.cta_language,

    // Confidence metadata passes through to generation
    _confidence: confidence,
    _source: {
      services: confidence.fields.services,
      voice: confidence.fields.brand_voice,
      testimonials: confidence.fields.testimonials,
    },
  }
}
```

### 1.4 Updated Enrichment Prompt

The enrichment prompt (`enrichment.ts`) needs two changes:

1. **Add confidence scoring to the output schema.** Append the `data_confidence` object to the JSON structure the prompt requests.

2. **Remove the hedging instruction.** Replace the current approach where Claude writes apologetic `brand_voice` paragraphs. New instruction: "If you cannot determine a field from the available data, set the value to null. Do not write explanatory text in content fields. The confidence score communicates uncertainty — the field values should be either usable content or null."

### 1.5 Content Source Markers

Every piece of content on the rendered site should carry an internal data attribute indicating its source. This is invisible to end users but visible to you (the operator) in the review step.

```html
<!-- Verified from reviews -->
<h3 data-source="verified">Drain Cleaning</h3>

<!-- Inferred from category defaults -->
<h3 data-source="default">Brake Service</h3>
```

This doesn't need to be customer-facing. It helps you quickly scan a generated site and know which content is from real data vs. category defaults.

---

## Layer 2: Content Model & Generation Overhaul

### Problem
The generation prompt schema (`SiteContentOutput`) is well-structured but the actual prompt gives Claude too little guidance on *how* to write, and the content model doesn't account for variable data quality or the tone spectrum tool.

### 2.1 Generation Prompt Rewrite

The current `SITE_GENERATION_SYSTEM_PROMPT` is 8 lines. It should be 3-4x longer and far more specific. Here's what needs to change:

**Current system prompt (too brief):**
```
You are an expert content designer creating a conversion-optimized website...
Content quality: Every sentence must be purposeful, concise, conversational, and clear.
Reading level: 7th-8th grade...
```

**New system prompt structure:**

```typescript
export const SITE_GENERATION_SYSTEM_PROMPT = `You are an expert content designer...

## Writing Quality Rules

1. VARY SENTENCE STRUCTURE. Service descriptions must not follow
   the same pattern. Vary between:
   - Leading with the problem: "Leaking faucet keeping you up? We fix it."
   - Leading with the process: "We inspect, diagnose, and repair — usually same-day."
   - Leading with the outcome: "A brake system you can trust in any weather."
   - Leading with specificity: "Pads, rotors, calipers, and lines — we cover the full system."
   Mix these across the 6 service cards. NEVER use the same structure twice in a row.

2. VARY DESCRIPTION LENGTH. Not every service needs the same amount
   of explanation. If the enrichment data flags a service as the business's
   specialty (most-mentioned in reviews), give it 3-4 sentences. Standard
   services get 1-2 sentences. This variation signals authenticity.

3. WRITE LIKE THE BUSINESS, NOT LIKE A MARKETER. Match the voice archetype:
   - Bold Professional: Short sentences. Active verbs. "We fix it. You drive it."
   - Warm Neighbor: Conversational, uses "we" and "you." "Come on in — we'd love to help."
   - Trustworthy Expert: Measured, credentialed. "With 25 years of experience..."
   - Calm Authority: Understated, quality-focused. "Precision and care in every detail."
   The voice archetype should change HOW you write, not just WHAT words you choose.
   Sentence length, paragraph density, and formality level should all shift.

4. HERO HEADLINES must address the customer's situation, not describe the business.
   Bad: "Quality Auto Repair Services" (describes the business)
   Good: "Your Check Engine Light Deserves a Straight Answer" (addresses the customer)
   The headline should make someone think "yes, that's exactly my problem."

5. USE DATA CONFIDENCE MARKERS. When the enrichment profile includes a
   _confidence object:
   - verified fields: Write with full specificity and authority
   - inferred fields: Write with category-appropriate defaults, don't overclaim
   - default fields: Use the provided category defaults as-is
   - unavailable fields: OMIT the section entirely. Do not fabricate.
   For testimonials specifically:
   - If testimonials confidence is 'verified': Use the provided review excerpts verbatim
   - If testimonials confidence is 'unavailable': Omit the testimonials section and
     use only the rating badge (star count + review count from Google) without quotes

6. LOCATION IS CONTENT. Mention the city/neighborhood naturally in:
   - The H1 (required)
   - At least 2 service descriptions
   - The about section
   - The meta title and description
   Do NOT keyword-stuff. "Serving Denver's Sunnyside neighborhood" is natural.
   "Denver auto repair Denver CO auto repair shop Denver" is not.

## Tone Spectrum Integration

The enrichment profile includes a voice_archetype and voice_characteristics array.
Map these to the following spectrum dimensions when writing:

- Formality: casual ←→ formal (trades=casual, legal=formal)
- Confidence: humble ←→ authoritative (new business=humble, established=authoritative)  
- Warmth: clinical ←→ warm (medical=clinical, bakery=warm)
- Pace: measured ←→ energetic (spa=measured, gym=energetic)
- Specificity: general ←→ technical (consumer=general, B2B=technical)

Each dimension should be set based on the voice archetype and then expressed
consistently throughout all generated content. A "Bold Professional" auto shop
should score: casual, authoritative, moderate warmth, energetic pace, technical
specificity. Every heading, description, and CTA should feel like it was written
by the same person.
`
```

### 2.2 Extended Content Schema

The `SiteContentOutput` type needs additions to support new sections and the confidence system.

```typescript
// Additions to SiteContentOutput

interface SiteContentOutput {
  // EXISTING (keep all current fields)
  homepage: { ... }
  service_pages: { ... }
  about_page: { ... }
  contact_page: { ... }
  faq_page: { ... }
  seo: { ... }
  global: { ... }

  // NEW FIELDS
  trust_bar: {
    items: { icon: string; text: string; source: 'verified' | 'inferred' | 'default' }[]
  } | null  // null when no trust signals available

  content_metadata: {
    data_confidence: 'high' | 'medium' | 'low'
    sections_included: string[]   // which sections had enough data to generate
    sections_omitted: string[]    // which sections were skipped due to thin data
    default_fields: string[]      // which fields used category defaults
  }
}
```

### 2.3 Service Page Content Model

The existing `service_pages` schema is close but needs enrichment for the new rendering layer:

```typescript
interface ServicePage {
  slug: string
  h1: string                              // "{Service} in {City}, {State}"
  meta_title: string                      // For <title> tag
  meta_description: string                // 150-160 chars
  hero_description: string                // 2-3 sentences, problem-first
  whats_included: {
    heading: string                       // "What's Included" / "What We Cover"
    items: {
      icon: string
      title: string
      description: string
    }[]
  }
  why_choose: {
    heading: string
    points: {
      icon: string
      title: string
      description: string
    }[]
  }
  pricing_note: string | null             // null if no pricing data
  related_services: string[]              // slugs of related service pages
  cta: {
    heading: string
    body: string
    primary: { label: string; type: string }
  }
  source_confidence: 'verified' | 'inferred' | 'default'
}
```

### 2.4 Conditional Section Rendering

The generation prompt should include explicit rules for when to include vs. omit sections:

```
SECTION INCLUSION RULES:

Always include (regardless of data quality):
- Header (business name + phone from Google Places — always available)
- Hero (use category default headlines if needed)
- Services grid (use category defaults if enrichment services are thin)
- CTA section (phone number is always available)
- Footer (address + phone always available from Google Places)

Include only when data confidence is medium or high:
- Trust bar (needs at least 2 verified or inferred trust signals)
- About section (needs owner name OR specific business narrative from reviews)
- Testimonials with quotes (needs verified review excerpts)

Include only when data confidence is high:
- Full testimonials section (quotes + attribution)
- FAQ section (needs enough data to write accurate answers)

Always include but adapt:
- Social proof (always show rating badge if Google rating exists;
  only show individual quotes if testimonials are verified)

When a section is omitted, add its name to content_metadata.sections_omitted.
```

---

## Layer 3: Rendering Pipeline

### Problem
The generation prompt produces service pages, about, contact, and FAQ content. The `generate-site.ts` worker saves all of it to Supabase. But the only rendering route is `/sites/[slug]/page.tsx` which renders the homepage. Everything else is dead data.

### 3.1 New Routes

```
/sites/[slug]/                    → Homepage (exists, needs overhaul)
/sites/[slug]/[service-slug]      → Service page (new)
/sites/[slug]/about               → About page (new)
/sites/[slug]/contact             → Contact page (new)
/sites/[slug]/faq                 → FAQ page (new)
```

All routes should share the same layout (which already loads theme CSS vars and fonts). Each route queries the `generated_sites` table for the relevant content slice.

### 3.2 Section Ordering System

The homepage currently renders sections in a hardcoded order. Replace this with a data-driven section array.

```typescript
// In homepage_content, add:
interface HomepageContent {
  section_order: string[]  // e.g. ['hero', 'trust_bar', 'services', 'testimonials', 'about', 'cta']
  // ... existing fields
}
```

The page renderer maps over `section_order` and renders each component:

```tsx
// sites/[slug]/page.tsx
const SECTION_MAP: Record<string, React.ComponentType<any>> = {
  hero: SiteHero,
  trust_bar: SiteTrustBar,
  services: SiteServices,
  testimonials: SiteTestimonials,
  about: SiteAbout,
  cta: SiteCTA,
}

export default function SitePage({ content }) {
  return (
    <main>
      {content.section_order
        .filter(section => SECTION_MAP[section])
        .map(section => {
          const Component = SECTION_MAP[section]
          return <Component key={section} {...content[section]} />
        })}
    </main>
  )
}
```

This allows layout variants to reorder sections without changing components, and allows thin-data sites to omit sections cleanly.

### 3.3 Layout Variant Implementation

The `layout_variant` field already exists and is assigned by `CATEGORY_LAYOUT_MAP`. Currently it has no effect. Each variant should define a different `section_order` and potentially different component variants.

```typescript
const LAYOUT_SECTION_ORDERS: Record<string, string[]> = {
  'service-first': ['hero', 'services', 'trust_bar', 'testimonials', 'about', 'cta'],
  'authority':     ['hero', 'trust_bar', 'about', 'services', 'testimonials', 'cta'],
  'community':     ['hero', 'about', 'services', 'testimonials', 'cta'],
  'portfolio':     ['hero', 'services', 'testimonials', 'about', 'cta'],
}
```

- **service-first** (trades): Services immediately after hero. Customer is looking for a specific service.
- **authority** (professional services): Trust signals and about before services. Customer needs to trust you before caring what you offer.
- **community** (food/social): About section early — these businesses sell personality.
- **portfolio** (creative/visual): Services as a gallery, testimonials prominent.

### 3.4 Service Page Components

New components needed:

```
SiteServiceHero.tsx      — Service name, description, breadcrumb, CTA
SiteServiceDetails.tsx   — "What's Included" icon grid
SiteServiceWhy.tsx       — "Why Choose Us" card row
SiteServicePricing.tsx   — Pricing callout (conditional)
SiteServiceRelated.tsx   — Related services links
```

These follow the same pattern as existing components: CSS vars for theming, props from structured JSON.

### 3.5 Navigation Component

Currently the header only has business name + phone. With service pages, it needs navigation.

```typescript
interface SiteNavProps {
  businessName: string
  phone: string | null
  phoneTel: string | null
  services: { name: string; slug: string }[]
  currentPage: string  // 'home' | service slug | 'about' | 'contact' | 'faq'
}
```

On desktop: horizontal nav links (Home, Services dropdown, About, Contact).
On mobile: hamburger menu.

### 3.6 Internal Linking

Every service card on the homepage should link to its dedicated service page:

```tsx
// In SiteServices.tsx, wrap each card:
<a href={`/sites/${siteSlug}/${service.slug}`} className="service-card">
  ...
</a>
```

Each service page should link to related services and back to the homepage. This creates the internal linking structure that Google needs.

---

## Layer 4: Component & Design Overhaul

### Problem
All 8 themes render identical HTML/component structures with different CSS variables. The visual differentiation is color-deep, not design-deep.

### 4.1 Theme-Aware Component Variants

Each theme should be able to control component presentation. Add a `componentVariants` field to `ThemeConfig`:

```typescript
interface ThemeConfig {
  // ... existing fields

  componentVariants: {
    card: 'flat' | 'bordered' | 'accent-top' | 'accent-left'
    hero: 'centered' | 'left-aligned' | 'split'
    heroBackground: 'solid' | 'gradient' | 'pattern'
    sectionDivider: 'none' | 'angled' | 'curved' | 'line'
    iconStyle: 'bare' | 'circle-bg' | 'square-bg'
    testimonialStyle: 'card' | 'pull-quote' | 'minimal'
  }
}
```

Theme assignments:

| Theme | Card | Hero | Hero BG | Divider | Icons | Testimonials |
|---|---|---|---|---|---|---|
| bold-trade | accent-top (orange) | centered | gradient | angled | square-bg | card |
| clean-professional | accent-top (gold) | centered | solid (navy) | line | circle-bg | pull-quote |
| fresh-active | accent-left (green) | centered | gradient | angled | square-bg | card |
| modern-minimal | flat | centered | solid (white) | none | bare | minimal |
| natural-earth | bordered | centered | gradient | curved | circle-bg | card |
| soft-care | accent-top (coral) | centered | gradient | curved | circle-bg | pull-quote |
| urban-edge | accent-left (yellow) | left-aligned | pattern | angled | square-bg | card |
| warm-craft | bordered | centered | gradient | curved | circle-bg | pull-quote |

### 4.2 Card Component Variants

```tsx
// Updated SiteServices card rendering
function ServiceCard({ service, variant, accentColor }) {
  const variantStyles = {
    'flat': {},
    'bordered': { border: '1px solid var(--color-border)' },
    'accent-top': { borderTop: `3px solid ${accentColor || 'var(--color-accent)'}` },
    'accent-left': { borderLeft: `4px solid ${accentColor || 'var(--color-accent)'}` },
  }

  const iconStyles = {
    'bare': {},
    'circle-bg': {
      backgroundColor: 'var(--color-primary-light)',
      borderRadius: '50%',
      padding: '12px',
      display: 'inline-flex',
    },
    'square-bg': {
      backgroundColor: 'var(--color-primary-light)',
      borderRadius: 'var(--radius-sm)',
      padding: '10px',
      display: 'inline-flex',
    },
  }

  return (
    <div style={{ ...baseStyles, ...variantStyles[variant] }}>
      <span style={iconStyles[iconVariant]}>{service.icon}</span>
      <h3>{service.name}</h3>
      <p>{service.description}</p>
    </div>
  )
}
```

### 4.3 Hero Visual Treatments

The hero needs per-theme visual presence. The `heroBackground` variant controls this:

```css
/* solid — clean-professional, modern-minimal */
.site-hero--solid {
  background-color: var(--color-primary);
  color: white;
}

/* gradient — bold-trade, fresh-active, soft-care, warm-craft, natural-earth */
.site-hero--gradient {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  color: white;
}

/* pattern — urban-edge */
.site-hero--pattern {
  background-color: var(--color-primary);
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 20px,
    rgba(255,255,255,0.03) 20px,
    rgba(255,255,255,0.03) 40px
  );
  color: white;
}
```

For light-background themes (modern-minimal), the hero stays light but gets more dramatic typography sizing and whitespace instead.

### 4.4 Section Background Rhythm

Define a section coloring strategy per theme. Every theme should alternate between at least 2 background colors to create visual rhythm:

```typescript
interface ThemeConfig {
  // ... existing
  sectionBackgrounds: {
    hero: string       // e.g. 'var(--color-primary)' for dark themes
    default: string    // e.g. 'var(--color-background)'
    alternate: string  // e.g. 'var(--color-surface)'
    emphasis: string   // e.g. 'var(--color-primary)' for CTA sections
  }
}
```

The section renderer applies backgrounds based on position: hero gets `hero`, odd content sections get `default`, even content sections get `alternate`, CTA gets `emphasis`.

### 4.5 Spacing Overhaul

Update CSS variables across all themes:

```
Current → New
--space-section: 4-5rem → 6rem (96px) default, 8rem (128px) for hero/CTA
card padding: 1.25-1.5rem → 2rem (32px)
grid gap: 1.5rem → 2rem (32px)
hero padding: 64-128px → 96-160px
```

### 4.6 Typography Scale Increase

```
Current → New
Hero h1: 2.5-3.5rem → 3rem-4.5rem (clamp)
Section h2: 1.75rem → 2-2.5rem
Card h3: 1.125rem → 1.25-1.375rem
Body text: 0.875rem → 1rem minimum
Hero subline: 1.125rem → 1.25rem
```

### 4.7 Accent Color Usage Map

Define exactly where the accent color appears in every theme:

1. Card accent border (top or left)
2. Star ratings
3. Decorative horizontal rules (about section, between sections)
4. Icon containers (background tint in circle-bg/square-bg variants)
5. Testimonial quotation mark decorative element
6. One CTA button variant (e.g., bottom CTA uses accent instead of primary)
7. Hover state for footer links

### 4.8 Trust Bar Component (New)

A new component that renders between hero and services (or hero and about, depending on layout variant):

```tsx
interface SiteTrustBarProps {
  items: { icon: string; text: string }[]
}

// Renders as a horizontal strip of 3-4 small proof points
// Example: "25+ Years Experience" | "Licensed & Insured" | "4.8★ on Google"
```

Styled per theme: dark themes get a slightly lighter surface strip, light themes get a slightly darker surface strip. Always horizontal on desktop, wraps to 2x2 grid on mobile.

---

## How This Fits the Original TECH_SPEC Phases

The original TECH_SPEC defines 7 implementation phases:

| Phase | Name | Status |
|---|---|---|
| 1 | Foundation | ✅ Complete |
| 2 | Lead Discovery | ✅ Complete |
| 3 | Enrichment + Generation Engine | ⏳ Current — pipeline works, quality insufficient |
| 4 | Pipeline Management UI | ⏳ Partially built (pipeline list, email review, notifications exist) |
| 5 | Email Integration (Instantly.ai) | ❌ Not started |
| 6 | Client Management | ❌ Placeholder |
| 7 | Polish & Scale | ❌ Not started |

**This overhaul is not a new initiative — it's completing Phase 3 properly.** Phase 3 in the TECH_SPEC includes: enrichment pipeline, website content generation, design token system, theme selection, site deployment, landing page generation, and email drafting. All of those were built as a first pass, but the generation quality, rendering coverage, and design differentiation aren't where they need to be for the sites to sell.

The overhaul should be treated as **Phase 3.5** — a quality and completeness pass on Phase 3 before advancing to Phase 5 (email integration). Phase 4 items are already partially in place and will benefit from the improved generation output without needing significant rework.

### Phase 3.5 Delivery Plan

The work is broken into 5 sprints. Each sprint produces a testable, deployable increment. Later sprints depend on earlier ones but the system remains functional throughout.

---

#### Sprint 1: Enrichment Confidence + Category Defaults (Layer 1)
**Estimated effort:** 3-4 sessions with Claude Code
**Prerequisite:** None — this is foundational

1. Update `EnrichmentOutput` type with `DataConfidence` interface
2. Update enrichment prompt to produce confidence scores and stop hedging
3. Build category defaults registry for all ~30 categories
4. Build `mergeWithDefaults()` utility
5. Update `generate-site.ts` to pass merged profile to generation prompt
6. Test with 1 Mile Auto Repair (thin data) and Power Pro Electricians

**Success criteria:** 1 Mile Auto Repair generates a site with category-default services, default hours, and a trust bar — instead of "Auto repair (general — specific services not confirmed by available data)."

**What this unblocks:** Sprint 2 needs confidence metadata to implement conditional section rendering.

---

#### Sprint 2: Generation Prompt + Content Schema (Layer 2)
**Estimated effort:** 2-3 sessions
**Prerequisite:** Sprint 1 (needs confidence metadata in enrichment output)

1. Rewrite `SITE_GENERATION_SYSTEM_PROMPT` with expanded writing rules
2. Add tone spectrum dimensions to the prompt (5-dimension starter, with hooks for full 24-spectrum tool later)
3. Update `SiteContentOutput` with new fields (trust_bar, content_metadata, section_order, extended service pages)
4. Add section inclusion/omission rules based on data confidence
5. Update generation prompt JSON schema
6. Test generation quality across 3+ categories (trade, professional, food/service)

**Success criteria:** Generated content varies in sentence structure, length, and voice across themes. Thin-data sites omit testimonial quotes but keep rating badges. Service descriptions don't follow the same 2-sentence pattern.

**What this unblocks:** Sprint 3 needs the new content schema fields (section_order, extended service pages, trust_bar) to render.

---

#### Sprint 3: Rendering Pipeline (Layer 3)
**Estimated effort:** 4-5 sessions
**Prerequisite:** Sprint 2 (needs extended content schema and section_order)

1. Add service page routes (`/sites/[slug]/[service-slug]`) and components (SiteServiceHero, SiteServiceDetails, SiteServiceWhy, SiteServicePricing, SiteServiceRelated)
2. Add about, contact, FAQ routes and components
3. Implement section ordering system (data-driven from `section_order` array)
4. Implement layout variants — `service-first`, `authority`, `community`, `portfolio` now produce different section orders
5. Add SiteNav component with service dropdown, mobile hamburger
6. Add internal linking (service cards → service pages, service pages → related services)
7. Add SiteBreadcrumb component for sub-pages

**Success criteria:** Every generated site has a homepage + 4-6 service pages + about + contact + FAQ, all navigable and internally linked. Layout variants produce visibly different page structures.

**What this unblocks:** Sprint 4 can apply visual polish to components that now exist and vary.

**Phase 4 impact:** The Pipeline Management UI and Prospect Detail page already show links to generated sites. With service pages now rendering, those links become more valuable. The "View site" action in the pipeline now leads to a multi-page site instead of a single homepage. No Phase 4 rework needed.

---

#### Sprint 4: Component & Design Overhaul (Layer 4)
**Estimated effort:** 3-4 sessions
**Prerequisite:** Sprint 3 (needs all components and variants in place to style)

1. Add `componentVariants` to ThemeConfig (card style, hero background, icon treatment, section divider, testimonial style)
2. Implement card variants (accent-top, accent-left, flat, bordered)
3. Implement hero background variants (solid, gradient, pattern)
4. Implement icon style variants (bare, circle-bg, square-bg)
5. Implement SiteTrustBar component
6. Update spacing and typography scales across all themes
7. Implement accent color usage across all 7 touchpoints
8. Add section background rhythm (alternating backgrounds per theme)

**Success criteria:** bold-trade and modern-minimal look like they were designed by different people, not just recolored. Each theme has a distinct visual personality beyond color.

**Phase 7 impact:** This sprint absorbs work that would otherwise happen in Phase 7 (Polish & Scale). The original Phase 7 scope included "performance optimization, error handling, loading/empty states, onboarding." The design polish work in Sprint 4 is being pulled forward because site quality directly affects whether the outreach (Phase 5) converts. Phase 7 can then focus on operational polish rather than visual quality.

---

#### Sprint 5: SEO & Meta (Cross-cutting)
**Estimated effort:** 1-2 sessions
**Prerequisite:** Sprint 3 (needs all page routes to exist for proper meta tags and schema)

1. Add JSON-LD LocalBusiness schema rendering in layout.tsx
2. Add Open Graph meta tags (og:title, og:description, og:image, og:url)
3. Verify heading hierarchy on all page types (homepage, service, about, contact, FAQ)
4. Add canonical URLs per page
5. Add `data-source` attributes for operator review (verified/inferred/default markers)

**Success criteria:** Pages pass Google Rich Results Test. Schema markup is valid. Meta titles follow the `{Service} in {City} | {Business Name}` pattern.

**Phase 5 impact:** When email integration (Phase 5) is built, the landing pages and generated sites that prospects click through to will already have proper SEO and social meta. This means shared links show rich previews in email clients and messaging apps, which directly improves click-through rates.

---

### Relationship to Phases 4–7

| Original Phase | Impact of 3.5 | Rework Needed? |
|---|---|---|
| **Phase 4: Pipeline Management UI** | Sites linked from pipeline are now multi-page with real content. Email drafts generated from richer data. Prospect detail page shows more material. | Minimal — existing UI benefits automatically. May want to add service page count to the pipeline card metadata. |
| **Phase 5: Email Integration** | Outreach emails link to better landing pages and richer generated sites. Landing pages embed previews of multi-page sites. Click-through experience is dramatically improved. | None — the email content is already generated, just links to better destinations. |
| **Phase 6: Client Management** | Clients who convert get a more complete site (multiple pages, proper SEO, schema markup). Tier differentiation (which pages are included at which tier) becomes possible because service pages exist as distinct content. | Minor — may want to add tier-gating logic for which service pages render at Starter vs. Growth vs. Pro. |
| **Phase 7: Polish & Scale** | Design polish is already done (Sprint 4). Phase 7 can focus purely on: performance optimization, error handling/retry logic, loading states, onboarding flow, and documentation. | Reduced scope — the visual quality work is handled. |

### What Phase 3.5 Does NOT Cover

These items remain in their original phases:

- **Instantly.ai email sending** → Phase 5
- **Engagement tracking webhooks** (open, click, reply) → Phase 5
- **Follow-up sequence automation** → Phase 5
- **Stripe billing** → Phase 6 / Future
- **Custom domain setup** → Phase 6 / Future
- **Plausible analytics per-site** → Phase 6
- **Client portal / FAQ bot** → Future
- **Blog post generation** → Future
- **A/B testing landing pages** → Future

---

## Files Modified / Created

### Modified
- `src/lib/ai/prompts/enrichment.ts` — confidence scoring, no-hedging rules
- `src/lib/ai/prompts/site-generation.ts` — expanded system prompt, new schema fields
- `src/lib/ai/generate-site.ts` — passes merged profile with defaults
- `src/lib/themes/index.ts` — componentVariants, sectionBackgrounds added to ThemeConfig
- `src/lib/themes/bold-trade.ts` (and all 7 other theme files) — new variant fields
- `src/components/sites/SiteServices.tsx` — card variants, internal links
- `src/components/sites/SiteHero.tsx` — background variants, spacing
- `src/components/sites/SiteTestimonials.tsx` — testimonial style variants
- `src/components/sites/SiteHeader.tsx` — navigation, mobile menu
- `src/components/sites/SiteAbout.tsx` — spacing, decorative elements
- `src/components/sites/SiteCTA.tsx` — accent color variant, spacing
- `src/components/sites/SiteFooter.tsx` — accent hover states
- `src/app/sites/[slug]/page.tsx` — section ordering system
- `src/app/sites/[slug]/layout.tsx` — schema.org, OG tags

### Created
- `src/lib/defaults/category-defaults.ts` — defaults registry
- `src/lib/defaults/merge.ts` — merge utility
- `src/lib/defaults/categories/` — one file per category (auto-repair.ts, dentist.ts, etc.)
- `src/components/sites/SiteTrustBar.tsx` — new component
- `src/components/sites/SiteNav.tsx` — navigation component
- `src/components/sites/SiteServiceHero.tsx` — service page hero
- `src/components/sites/SiteServiceDetails.tsx` — what's included grid
- `src/components/sites/SiteServiceWhy.tsx` — why choose us cards
- `src/components/sites/SiteServicePricing.tsx` — pricing callout
- `src/components/sites/SiteServiceRelated.tsx` — related services
- `src/components/sites/SiteBreadcrumb.tsx` — breadcrumb nav
- `src/components/sites/SiteFAQ.tsx` — FAQ accordion
- `src/app/sites/[slug]/[service-slug]/page.tsx` — service page route
- `src/app/sites/[slug]/about/page.tsx` — about page route
- `src/app/sites/[slug]/contact/page.tsx` — contact page route
- `src/app/sites/[slug]/faq/page.tsx` — FAQ page route

---

## Open Questions

1. **Database schema changes:** Does `generated_sites` need new columns for `trust_bar`, `content_metadata`, and the extended service page data? Or can these nest inside the existing `homepage_content` jsonb column? Recommendation: add `trust_bar` and `content_metadata` as top-level jsonb columns. Service pages already have a `service_pages` column.

2. **Tone spectrum tool integration:** The plan includes a basic tone spectrum mapping in the generation prompt (formality, confidence, warmth, pace, specificity). Fason has a more comprehensive tone spectrum tool with 24 spectrums. How much of that tool's functionality should be integrated into the generation prompt vs. kept as a separate system? This needs a deeper conversation.

3. **Google Places review text:** Does the Google Places API (Legacy) return actual review text, or just rating/count? If it returns review text, the enrichment step should extract the best 3-5 quotes for use as verified testimonials. If not, the testimonials section needs to rely solely on rating badges when data confidence is low.

4. **Regeneration:** When a site is regenerated (e.g., after enrichment data improves), should it overwrite the existing content or create a new version? Current behavior is upsert (overwrite). Consider adding versioning.

5. **Category defaults maintenance:** 30 category default files is a lot to write and maintain. Consider: generating the initial defaults with Claude (seeded with industry knowledge), then manually reviewing and refining. The defaults don't need to be perfect — they need to be better than null.

---

## Reminders

- **Tone spectrum tool:** Integrate full functionality into the generation pipeline. The basic 5-dimension mapping in this plan is a starting point; the full 24-spectrum tool should eventually drive voice generation.
- **Enrichment fallback guardrails:** The confidence scoring system and category defaults registry in Layer 1 are this guardrail. Test with the 1 Mile Auto Repair sample to validate.
