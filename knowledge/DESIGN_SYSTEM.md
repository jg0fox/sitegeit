# Design System Architecture — Sitegeit

This document defines the design token system, theming architecture, and component library for generated client websites. The goal: 100 sites that all feel polished and professional, but none look like the same template.

---

## Architecture Overview

Three layers of customization:

1. **Base theme** (8 options, mapped to business archetypes)
2. **Brand color override** (auto-derived from business presence or category defaults)
3. **Typography and token fine-tuning** (AI selects based on brand signals)

```
Base Theme (Bold Trade) → Brand Colors (business blue) → Token Tuning (rounded corners, generous spacing)
= Unique visual identity per site
```

---

## Base Themes

### 1. Bold Trade
**For:** Contractors, plumbers, electricians, roofers, HVAC, handymen
**Aesthetic:** Strong, reliable, no-nonsense. High contrast, angular, utilitarian.
**Characteristics:** Bold weight headings, dark backgrounds with bright accent, sharp corners (0–4px radius), tight spacing, uppercase labels, strong horizontal rules.

### 2. Soft Care
**For:** Healthcare, dental, veterinary, childcare, therapy, wellness
**Aesthetic:** Clean, calming, trustworthy. Plenty of white space, soft colors, gentle curves.
**Characteristics:** Light backgrounds, rounded corners (12–16px), airy spacing, serif or soft sans headings, muted accent colors, subtle shadows.

### 3. Warm Craft
**For:** Bakeries, cafes, florists, boutiques, artisan businesses
**Aesthetic:** Handmade, inviting, warm. Organic textures, warm color palette, approachable.
**Characteristics:** Warm neutrals (cream, linen, terracotta), display/script accent font, medium radius (8–12px), generous padding, subtle texture backgrounds.

### 4. Urban Edge
**For:** Barbers, tattoo shops, streetwear, music venues, food trucks
**Aesthetic:** Modern, bold, high-energy. Dark mode, strong typography, minimal decoration.
**Characteristics:** Dark backgrounds, high-contrast text, condensed bold headings, minimal radius (0–2px), tight spacing, monochrome with single accent color.

### 5. Clean Professional
**For:** Lawyers, accountants, financial advisors, consultants, real estate agents
**Aesthetic:** Polished, authoritative, conservative. Traditional with modern touches.
**Characteristics:** Navy/charcoal palette, serif headings, neutral sans body, medium radius (6–8px), generous margins, subtle borders, restrained accent use.

### 6. Fresh Active
**For:** Gyms, fitness trainers, yoga studios, sports facilities, dance studios
**Aesthetic:** Energetic, dynamic, motivating. Bright colors, strong imagery, active feel.
**Characteristics:** Vibrant accent colors, bold sans headings, large hero sections, minimal radius, strong CTAs, high-contrast buttons, dynamic spacing.

### 7. Natural Earth
**For:** Landscapers, gardeners, farms, nurseries, outdoor services, eco businesses
**Aesthetic:** Organic, grounded, sustainable. Earth tones, natural textures, honest.
**Characteristics:** Green/brown/stone palette, rounded elements (8–12px), generous spacing, natural/organic sans typography, subtle grain textures.

### 8. Modern Minimal
**For:** Photographers, designers, architects, tech services, marketing agencies
**Aesthetic:** Sparse, intentional, design-forward. Typography-driven, lots of whitespace.
**Characteristics:** Black/white/one accent, large type scale ratio, extreme whitespace, thin borders, minimal shadows, 4–8px radius, system or geometric sans.

---

## Design Token System

All tokens are implemented as CSS custom properties. The same Tailwind classes produce different results per theme.

### Token Categories

```css
:root {
  /* === COLOR TOKENS === */
  /* Primary */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-light: #eff6ff;
  --color-primary-dark: #1e40af;

  /* Secondary */
  --color-secondary: #64748b;
  --color-secondary-hover: #475569;
  --color-secondary-light: #f1f5f9;

  /* Accent */
  --color-accent: #f59e0b;
  --color-accent-hover: #d97706;
  --color-accent-light: #fffbeb;

  /* Neutral */
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-surface-raised: #ffffff;
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #94a3b8;
  --color-text-inverse: #ffffff;
  --color-border: #e2e8f0;
  --color-border-strong: #cbd5e1;
  --color-divider: #f1f5f9;

  /* Semantic */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* === TYPOGRAPHY TOKENS === */
  --font-heading: 'Manrope', system-ui, sans-serif;
  --font-body: 'Manrope', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Scale (modular, ratio varies by theme) */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */

  /* Weight */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;

  /* Leading */
  --leading-tight: 1.15;
  --leading-snug: 1.3;
  --leading-normal: 1.5;
  --leading-relaxed: 1.65;

  /* Letter spacing */
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;

  /* === SPACING TOKENS === */
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
  --space-3xl: 4rem;     /* 64px */
  --space-4xl: 6rem;     /* 96px */
  --space-section: 5rem; /* 80px — between major page sections */

  /* === SHAPE TOKENS === */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  --radius-button: var(--radius-md);
  --radius-card: var(--radius-lg);
  --radius-input: var(--radius-md);

  /* === SHADOW TOKENS === */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04);
  --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04);

  /* === MOTION TOKENS === */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --easing-default: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-in: cubic-bezier(0.4, 0, 1, 1);
  --easing-out: cubic-bezier(0, 0, 0.2, 1);
}
```

---

## Theme Override Examples

### Bold Trade (Plumber)
```css
[data-theme="bold-trade"] {
  --color-primary: #1e40af;
  --color-primary-hover: #1e3a8a;
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-text-primary: #f8fafc;
  --color-text-secondary: #cbd5e1;
  --color-border: #334155;
  --font-heading: 'Work Sans', system-ui, sans-serif;
  --font-weight-heading: 800;
  --tracking-heading: -0.03em;
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 6px;
  --radius-card: 4px;
  --radius-button: 4px;
  --space-section: 4rem;
}
```

### Soft Care (Dentist)
```css
[data-theme="soft-care"] {
  --color-primary: #0ea5e9;
  --color-primary-hover: #0284c7;
  --color-primary-light: #f0f9ff;
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-text-primary: #1e293b;
  --color-accent: #99f6e4;
  --font-heading: 'Outfit', system-ui, sans-serif;
  --font-weight-heading: 600;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-card: 16px;
  --radius-button: 12px;
  --space-section: 6rem;
  --shadow-md: 0 4px 12px rgba(0,0,0,0.04);
}
```

### Warm Craft (Bakery)
```css
[data-theme="warm-craft"] {
  --color-primary: #c2410c;
  --color-primary-hover: #9a3412;
  --color-background: #fffbeb;
  --color-surface: #fef3c7;
  --color-text-primary: #451a03;
  --color-text-secondary: #78350f;
  --color-border: #fcd34d;
  --font-heading: 'Fraunces', Georgia, serif;
  --font-body: 'Source Sans 3', system-ui, sans-serif;
  --font-weight-heading: 700;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-card: 14px;
  --space-section: 5rem;
}
```

---

## Font Pairing Library

Pre-approved pairings organized by personality:

### Authoritative (Serif + Sans)
| Heading | Body | Mood |
|---|---|---|
| Playfair Display | Source Sans 3 | Classic, trustworthy |
| Lora | Inter | Warm, scholarly |
| Merriweather | Open Sans | Readable, established |
| Fraunces | Manrope | Modern editorial |

### Modern (Sans + Sans)
| Heading | Body | Mood |
|---|---|---|
| Manrope | Manrope | Clean, contemporary |
| Outfit | Source Sans 3 | Friendly, approachable |
| Work Sans | DM Sans | Professional, technical |
| Plus Jakarta Sans | Inter | Sharp, current |

### Bold (Condensed + Sans)
| Heading | Body | Mood |
|---|---|---|
| Oswald | Source Sans 3 | Industrial, strong |
| Barlow Condensed | Barlow | Urban, efficient |
| Bebas Neue | Manrope | High-impact, direct |
| Anton | DM Sans | Maximum bold |

### Distinctive (Display + Sans)
| Heading | Body | Mood |
|---|---|---|
| Fraunces | Source Sans 3 | Artisanal, craft |
| Sora | Inter | Geometric, modern |
| Bricolage Grotesque | DM Sans | Playful, unique |
| Cabinet Grotesk | Manrope | Premium, refined |

---

## Category-to-Theme Defaults

When the AI can't extract strong brand signals, fall back to these:

| Business Category | Default Theme | Default Palette | Default Font Pair |
|---|---|---|---|
| Plumber | Bold Trade | Navy blue + safety orange | Oswald + Source Sans 3 |
| Electrician | Bold Trade | Dark blue + electric yellow | Work Sans + DM Sans |
| HVAC | Bold Trade | Steel blue + red | Barlow Condensed + Barlow |
| Roofer | Bold Trade | Slate + amber | Oswald + Source Sans 3 |
| General contractor | Bold Trade | Charcoal + orange | Work Sans + Source Sans 3 |
| Bakery | Warm Craft | Cream + terracotta | Fraunces + Source Sans 3 |
| Restaurant | Warm Craft | Warm white + burgundy | Playfair Display + Source Sans 3 |
| Cafe | Warm Craft | Linen + coffee brown | Lora + Manrope |
| Dentist | Soft Care | Sky blue + mint | Outfit + Source Sans 3 |
| Doctor | Soft Care | Blue + white | Merriweather + Open Sans |
| Veterinarian | Soft Care | Teal + warm gray | Outfit + Inter |
| Therapist | Soft Care | Sage green + cream | Lora + Source Sans 3 |
| Lawyer | Clean Professional | Navy + gold | Playfair Display + Source Sans 3 |
| Accountant | Clean Professional | Charcoal + blue | Merriweather + Inter |
| Real estate | Clean Professional | Navy + white | Plus Jakarta Sans + Inter |
| Barber | Urban Edge | Black + white + one accent | Bebas Neue + Manrope |
| Tattoo shop | Urban Edge | Black + red | Anton + DM Sans |
| Auto repair | Bold Trade | Dark gray + red | Barlow Condensed + Barlow |
| Hair salon | Modern Minimal | Black + blush | Sora + Inter |
| Spa | Soft Care | Sage + white | Outfit + Source Sans 3 |
| Gym | Fresh Active | Black + neon green | Oswald + DM Sans |
| Yoga studio | Soft Care | Lavender + cream | Outfit + Source Sans 3 |
| Florist | Warm Craft | Blush + forest green | Fraunces + Manrope |
| Landscaper | Natural Earth | Forest green + earth brown | Work Sans + Source Sans 3 |
| Photographer | Modern Minimal | Black + white | Sora + Inter |
| Cleaning service | Soft Care | Light blue + white | Manrope + Manrope |

---

## Homepage Layout Variants

Four structural layouts, independent of theme:

### 1. Authority Layout
Full-width hero with large headline, rating badge, and CTA. Below: services grid (3 col), testimonial carousel, about section, contact CTA. Best for: professional services, healthcare, legal.

### 2. Community Layout
Split hero (text + image), local map embed prominent, reviews featured early, services as icon cards, about section with team/owner photo, neighborhood references. Best for: bakeries, restaurants, barbers, local retail.

### 3. Service-First Layout
Hero with search/filter (if multi-service), service cards as primary content below hero, each expandable with details, pricing indicators, and individual CTAs. Testimonials woven between service sections. Best for: contractors, auto repair, HVAC, cleaning.

### 4. Portfolio Layout
Large image hero or image grid, minimal text, work examples prominent, brief about section, strong single CTA. Best for: photographers, designers, tattoo shops, landscapers (before/after).

---

## Component Library

All components built with shadcn/ui + Radix primitives + Tailwind, themed via CSS custom properties.

### Layout Components
- `SiteHeader` — Logo, nav links, phone CTA, mobile hamburger menu
- `SiteFooter` — Business info, hours, nav links, compliance text
- `Container` — Max-width wrapper with responsive padding
- `Section` — Semantic `<section>` with consistent vertical spacing
- `Grid` — Responsive CSS Grid wrapper (1 col mobile, 2–3 col desktop)

### Hero Variants
- `HeroFullWidth` — Full bleed background (photo or color), overlay text, CTA
- `HeroSplit` — 50/50 text + image
- `HeroMinimal` — Text-only, large typography, centered
- `HeroCentered` — Centered text over subtle pattern/gradient

### Content Components
- `ServiceCard` — Icon/image, service name, brief description, CTA link
- `ServiceDetail` — Full service page layout with sections
- `TestimonialCard` — Star rating, quote, reviewer name, source (Google/Yelp)
- `TestimonialCarousel` — Scrollable testimonial strip
- `FAQAccordion` — Expandable Q&A with schema markup
- `TeamMember` — Photo, name, role, brief bio
- `AboutSection` — Business story with photo
- `StatsRow` — "200+ reviews", "15 years experience", "4.9 rating" — horizontal badges

### Trust & Social Proof
- `RatingBadge` — Star display with count (Google-style)
- `ReviewExcerpt` — Single review highlight
- `TrustBadge` — "Licensed & Insured", "BBB Accredited", etc.
- `SocialProofBar` — Horizontal strip of trust indicators

### CTA Components
- `CTAButton` — Primary action button (themed)
- `CTASection` — Full-width CTA block with headline + button
- `PhoneButton` — Prominent tappable phone number
- `StickyMobileCTA` — Fixed bottom bar with phone + primary action (mobile only)

### Contact & Forms
- `ContactForm` — Name, phone, email, message, preferred contact method
- `ContactInfo` — Address, phone, email, hours displayed
- `MapEmbed` — Google Maps embed with marker
- `HoursDisplay` — Formatted business hours, current day highlighted
- `SchedulingEmbed` — Cal.com/Calendly widget (Growth+ tiers)

### Media
- `ImageGallery` — Responsive grid of business photos
- `BeforeAfter` — Slider comparison (for contractors, landscapers)
- `LogoDisplay` — Business logo, properly sized and centered

### Navigation
- `MobileNav` — Hamburger → slide-out menu
- `DesktopNav` — Horizontal link bar
- `BreadcrumbNav` — For service detail pages
- `SkipNav` — Accessibility: skip to main content link

### Utility
- `Badge` — Category, status, or label badge
- `Divider` — Themed section separator
- `Skeleton` — Loading placeholder
- `BackToTop` — Scroll to top button (appears after scrolling)

---

## Theme Configuration File Format

Each generated site produces a theme config JSON stored in the database:

```json
{
  "themeId": "bold-trade",
  "layoutVariant": "service-first",
  "colors": {
    "primary": "#1e40af",
    "primaryHover": "#1e3a8a",
    "primaryLight": "#eff6ff",
    "accent": "#f97316",
    "background": "#0f172a",
    "surface": "#1e293b",
    "textPrimary": "#f8fafc",
    "textSecondary": "#cbd5e1",
    "border": "#334155"
  },
  "typography": {
    "headingFont": "Oswald",
    "bodyFont": "Source Sans 3",
    "headingWeight": 700,
    "headingTracking": "-0.02em",
    "bodySize": "16px",
    "scaleRatio": 1.25
  },
  "shape": {
    "radiusSm": "2px",
    "radiusMd": "4px",
    "radiusLg": "6px",
    "radiusButton": "4px",
    "radiusCard": "6px"
  },
  "spacing": {
    "sectionGap": "4rem",
    "cardPadding": "1.25rem",
    "containerMaxWidth": "1200px"
  },
  "motion": {
    "durationNormal": "200ms",
    "reducedMotion": true
  }
}
```

This JSON drives the entire visual rendering. The AI agent generates this config during site generation (Stage 2 in the pipeline) based on the business's enriched profile and brand signals.
