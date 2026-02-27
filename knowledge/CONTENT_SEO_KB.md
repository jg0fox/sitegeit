# Content & SEO Knowledge Base — Sitegeit

This document is the authoritative reference for all AI-generated content on client websites. The Claude Code agent and all content generation prompts must adhere to these standards.

---

## Part 1: Content Design Foundations

### The Four Quality Standards

Every piece of generated content must be:

1. **Purposeful** — Helps the business owner's customer achieve a goal (find a service, understand pricing, make contact, build trust)
2. **Concise** — Uses the fewest words possible without losing meaning. Every word earns its place.
3. **Conversational** — Sounds like a real person talking, not a marketing brochure or AI-generated filler
4. **Clear** — Unambiguous, accurate, and easy to understand on first read

### Readability Benchmarks

| Metric | Target |
|---|---|
| Reading level (consumer businesses) | 7th–8th grade Flesch-Kincaid |
| Reading level (professional services) | 9th–10th grade |
| Sentence length (average) | 8–14 words |
| Sentence length (max) | 25 words |
| Line length | 40–60 characters |
| Paragraph length | 2–4 sentences max |

**Comprehension rates by sentence length:**
- 8 words or fewer: 100% comprehension
- 14 words or fewer: 90% comprehension
- 25+ words: significant comprehension drop

### Voice Derivation by Business Archetype

The AI extracts voice signals from the business's reviews, social posts, and online presence, then maps to the closest archetype:

| Archetype | Characteristics | Typical Categories | Voice Markers |
|---|---|---|---|
| Trustworthy Expert | Authoritative, knowledgeable, reassuring | Lawyers, accountants, financial advisors, medical | "Our team has X years of experience", technical credibility, credentials |
| Warm Neighbor | Friendly, approachable, community-rooted | Bakeries, cafes, florists, pet services | First names, local references, personal stories, family language |
| Bold Professional | Confident, direct, results-driven | Contractors, roofers, plumbers, auto repair | Action verbs, no-nonsense tone, "we get the job done", reliability |
| Friendly Guide | Helpful, educational, patient | Tutors, trainers, wellness, childcare | "We'll walk you through", step-by-step, encouraging |
| Calm Authority | Measured, sophisticated, premium | Dentists, spas, architects, interior design | Refined vocabulary, understated confidence, quality-focused |
| Energetic Enthusiast | Excited, dynamic, passion-forward | Fitness, music, events, food trucks | Exclamation points (sparingly), vivid descriptions, enthusiasm |

**Derivation process:**
1. Analyze 10–20 most recent Google reviews for recurring adjectives, tone, and themes
2. Check Facebook/Instagram for communication style (formal vs casual, emoji usage, post length)
3. Identify the owner's communication pattern if visible (responses to reviews, social posts)
4. Map to closest archetype
5. Generate 3–5 voice characteristics specific to this business (e.g., "Direct and practical, uses trade terminology comfortably, emphasizes reliability over price")

---

## Part 2: Growth Content Design

### Fogg Behavior Model (B = MAP)

Every page on a generated site must satisfy all three:

- **M (Motivation):** Why should the visitor care? Lead with their problem, not the business's features. "Your pipes burst at 2am" not "We offer 24/7 plumbing services."
- **A (Ability):** How easy is it to take the next step? One clear CTA per section. Phone number is tappable. Form has minimal fields. No friction.
- **P (Prompt):** Is there a clear trigger to act? Visible CTA buttons, sticky mobile header with phone number, contact form above the fold.

### Perceived Value Framework

Content must increase perceived value through:

1. **Social proof:** Star ratings, review count, review excerpts (real ones only — never fabricated)
2. **Specificity:** "Serving Oakland since 2012" beats "Serving the Bay Area". Specific service lists beat generic descriptions.
3. **Credibility signals:** License numbers, certifications, insurance, BBB rating — only if verified from enrichment data
4. **Risk reduction:** "Free estimates", "No hidden fees", "Satisfaction guaranteed" — only if the business actually offers these (check reviews and profile)

### Information Foraging

Users scan, they don't read. Structure content for:

- **F-pattern scanning:** Important info in the first two words of headings and paragraphs
- **Inverted pyramid:** Most important information first, details second, background last
- **Chunking:** Break services into individual cards/sections, not a wall of text
- **Visual hierarchy:** H1 → H2 → body → caption. Never skip heading levels.

### CTA Design Principles

- Use low-commitment language. "Check availability" outperforms "Book now" for service businesses. "Get a free estimate" outperforms "Contact us."
- One primary CTA per viewport. Don't compete with yourself.
- CTAs must describe the outcome, not the action. "Get your free quote" not "Submit form."
- Phone numbers are CTAs. Make them prominent, tappable on mobile, with a `tel:` link.
- Sticky mobile CTA bar: phone number + primary action button, visible at all times during scroll.

### Emotional Writing Framework

- Lead with the customer's problem or desire, not the business's credentials
- Use sensory and specific language: "fresh-baked sourdough every morning at 6am" not "quality baked goods"
- Testimonial excerpts should be the most emotionally resonant review sentences
- Avoid superlatives without evidence: "best plumber in Oakland" is a claim that needs backing. "4.9 stars from 200+ customers" is a fact.

---

## Part 3: SEO Strategy

### Technical SEO (Every Generated Site)

These are non-negotiable. Every site must have:

- Semantic HTML5 structure (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`)
- Proper heading hierarchy (one H1 per page, sequential H2/H3/H4, never skip levels)
- Auto-generated `<title>` tag: `{Primary Service} in {City}, {State} | {Business Name}`
- Auto-generated `<meta name="description">`: 150–160 characters, includes location and primary service
- Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
- `<link rel="canonical">` on every page
- Auto-generated `sitemap.xml`
- `robots.txt` allowing full crawl
- Mobile-first responsive design (Google indexes mobile-first)
- Fast Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Images: WebP format, `alt` text generated from context, lazy loading below fold, explicit `width`/`height`
- HTTPS (enforced by Vercel)
- Clean URL structure: `/services/drain-cleaning` not `/page?id=3`

### Schema.org Structured Data

Every site gets LocalBusiness schema (JSON-LD in `<head>`). Map to the most specific subtype:

| Business Category | Schema Subtype |
|---|---|
| Plumber | `Plumber` |
| Electrician | `Electrician` |
| HVAC | `HVACBusiness` |
| Locksmith | `Locksmith` |
| Roofer | `RoofingContractor` |
| General contractor | `GeneralContractor` |
| Bakery | `Bakery` |
| Restaurant | `Restaurant` |
| Cafe | `CafeOrCoffeeShop` |
| Bar | `BarOrPub` |
| Dentist | `Dentist` |
| Doctor | `Physician` |
| Veterinarian | `VeterinaryCare` |
| Lawyer | `Attorney` |
| Accountant | `AccountingService` |
| Auto repair | `AutoRepair` |
| Hair salon | `HairSalon` |
| Barber | `BarberShop` |
| Spa | `DaySpa` |
| Gym/Fitness | `HealthClub` |
| Florist | `Florist` |
| Pet groomer | `PetStore` (or `LocalBusiness` with `additionalType`) |
| Photographer | `LocalBusiness` with `additionalType: Photographer` |
| Tutor | `LocalBusiness` with `additionalType: EducationalOrganization` |
| Landscaper | `LocalBusiness` with `additionalType: LandscapingBusiness` |
| Cleaning service | `LocalBusiness` with `additionalType: CleaningService` |

Required schema properties:
```json
{
  "@context": "https://schema.org",
  "@type": "{SubType}",
  "name": "{Business Name}",
  "description": "{Meta description}",
  "url": "{Site URL}",
  "telephone": "{Phone}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{Street}",
    "addressLocality": "{City}",
    "addressRegion": "{State}",
    "postalCode": "{ZIP}",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{Lat}",
    "longitude": "{Lng}"
  },
  "openingHoursSpecification": [ ... ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{Google rating}",
    "reviewCount": "{Review count}"
  },
  "image": "{Primary photo URL}",
  "priceRange": "{If derivable from reviews}"
}
```

### Local SEO Content Patterns

**Homepage H1:** `{Primary Service} in {City}, {State}` — e.g., "Emergency Plumbing in Oakland, CA"

**Service pages:** One page per major service. H1: `{Service Name} in {City}` — e.g., "Drain Cleaning in Oakland, CA". Content includes: what the service involves, common problems it solves, why this business does it well (from review themes), CTA.

**Location signals:** Mention the city/neighborhood name 2–3 times naturally per page. Reference nearby landmarks or neighborhoods from the business's review mentions. "Serving Temescal, Rockridge, and downtown Oakland."

**FAQ section:** Generate from common search queries for that business type + location. Use `FAQPage` schema markup. Questions should match how real people search: "How much does a plumber cost in Oakland?" not "What are your rates?"

### Keyword Strategy (Three Tiers)

| Tier | Intent | Example | Where it goes |
|---|---|---|---|
| High intent | Ready to buy/book | "emergency plumber oakland", "plumber near me" | Homepage H1, meta title, hero text |
| Mid intent | Researching | "how much does drain cleaning cost", "signs of a slab leak" | Service pages, FAQ section |
| Low intent | Awareness | "plumbing maintenance tips", "when to replace water heater" | Blog posts (Pro+ tier content updates) |

---

## Part 4: Accessibility Standards (WCAG 2.2 Level AA)

These are non-negotiable requirements for every generated site.

### Color & Contrast
- Text on background: minimum 4.5:1 contrast ratio (normal text), 3:1 (large text ≥ 18pt or bold ≥ 14pt)
- Interactive elements: 3:1 against adjacent colors
- Never use color alone to convey meaning (pair with icons, text, or patterns)
- Test all theme color combinations against these ratios

### Typography & Readability
- Base font size: 16px minimum (never smaller for body text)
- Line height: 1.5× font size for body text
- Paragraph spacing: at least 1.5× line height
- Maximum line length: 80 characters

### Interactive Elements
- Touch targets: minimum 44px × 44px with 8px spacing between targets
- Focus indicators: visible on all interactive elements (2px solid outline, high contrast)
- Skip navigation link: first focusable element, links to `<main>`
- Keyboard navigable: all functionality accessible via keyboard alone
- No keyboard traps

### Forms
- Every input has a visible `<label>` element (not just placeholder text)
- Required fields marked with "(required)" text, not just asterisk
- Error messages: associated with field via `aria-describedby`, specific and actionable
- Form submission: confirm success with visible message, don't just refresh

### Images
- All meaningful images: descriptive `alt` text generated from business context
- Decorative images: `alt=""`
- Image alt text should describe what's shown, not just "photo of business"
- Good: `alt="Exterior of Joe's Plumbing shop on Main Street, Oakland"`
- Bad: `alt="business photo"` or `alt="image1"`

### Structure
- One `<h1>` per page
- Heading levels sequential (H1 → H2 → H3, never skip)
- Landmark elements: `<header>`, `<nav>`, `<main>`, `<footer>`
- Lists use `<ul>`/`<ol>`, not styled `<div>`s
- Tables (if any) have `<th>` headers with `scope` attribute
- Language attribute: `<html lang="en">`

### Motion & Animation
- Respect `prefers-reduced-motion` media query
- No auto-playing video or audio
- Animations that convey information must have static alternatives

---

## Part 5: Inclusive Content Design

### Gender & Identity
- Use gender-neutral language by default: "they/them" for unknown individuals
- "Business owner" not "businessman", "team" not "guys", "partner" not "husband/wife"
- Don't assume family structure in copy ("your family" is fine, "your wife and kids" is not)

### Disability & Ability
- Person-first language: "person with a disability" not "disabled person" (unless individual preference is known)
- Don't use disability as metaphor: avoid "blind spot", "falling on deaf ears", "crippling"
- Don't describe accessibility features as "special" — they're standard

### Race & Ethnicity
- Don't make assumptions about clientele demographics
- Stock photos (if used): represent diverse people naturally, not as tokens
- Avoid culturally specific idioms that may not translate

### Socioeconomic Sensitivity
- Don't assume income level. "Affordable" is fine; "cheap" or "budget" can feel condescending
- Pricing transparency: if the business has clear pricing, show it. Don't hide costs.
- "Free estimate" and "No obligation" reduce anxiety across all income levels

### Age
- Don't assume tech literacy (or lack of it) based on business type
- Avoid "young and dynamic" or "serving seniors" unless the business explicitly targets an age group
- Phone number prominent for businesses whose customers may prefer calling over forms

---

## Part 6: UX Writing Patterns for Client Sites

### Homepage

| Section | Pattern | Example |
|---|---|---|
| Hero headline | `{Customer problem or desire}` | "Your pipes don't wait for business hours. Neither do we." |
| Hero subheadline | `{What the business does} + {Location}` | "24/7 emergency plumbing for Oakland and the East Bay" |
| Hero CTA | Low-commitment action | "Get a free estimate" / "Call now: (510) 555-0123" |
| Services overview | Card grid, 3–6 items | Service name + 1-sentence description + "Learn more" link |
| Social proof | Rating + count + featured excerpt | "4.9 stars from 247 reviews — 'They saved us from a flooded kitchen at midnight'" |
| About snippet | 2–3 sentences, personality-forward | "Joe's Plumbing has been keeping Oakland homes running since 2008. Joe and his team of licensed plumbers handle everything from leaky faucets to full re-pipes." |
| CTA section | Repeat primary CTA with urgency-free framing | "Ready to get started? Give us a call or request a free estimate online." |

### Service Pages

| Section | Content |
|---|---|
| H1 | `{Service name} in {City}, {State}` |
| Opening paragraph | What the service is and why the customer might need it (problem-first) |
| What's involved | 3–5 bullet points describing the process (plain language, no jargon) |
| Why this business | 2–3 points derived from review themes (reliability, speed, quality, etc.) |
| Pricing indicator | If available: "Starting from $X" or "Free estimates". If not: omit entirely. Never fabricate. |
| CTA | Phone + form, same as homepage |

### Contact Page

| Element | Content |
|---|---|
| H1 | "Get in touch" or "Contact {Business Name}" |
| Phone | Large, tappable, with `tel:` link |
| Form fields | Name (required), Phone, Email, Message, Preferred contact method. Minimal. |
| Hours | Formatted clearly from enrichment data. Current day highlighted. |
| Address | Full address with embedded map (Google Maps static or embed) |
| Response expectation | "We typically respond within 1 business day" (if derivable from review response patterns) |

### Microcopy Patterns

| Element | Good | Bad |
|---|---|---|
| Form submit button | "Send your message" | "Submit" |
| Required field | "Your name (required)" | "Name *" |
| Form success | "Message sent — we'll get back to you within 1 business day" | "Form submitted successfully" |
| Form error | "Please enter your phone number so we can reach you" | "Error: invalid input" |
| Loading state | "Sending your message..." | "Please wait" |
| Phone CTA | "Call (510) 555-0123" | "Click to call" |
| Email CTA | "Email joe@joesplumbing.com" | "Send email" |

---

## Part 7: Quality Checklist

Run this validation before any site goes live:

### Content Quality
- [ ] No placeholder or lorem ipsum text anywhere
- [ ] No fabricated reviews, credentials, or statistics
- [ ] No services listed that aren't confirmed by enrichment data
- [ ] All phone numbers and addresses verified from source data
- [ ] Reading level within target range for business type
- [ ] Voice/tone consistent with derived archetype throughout
- [ ] No spelling or grammar errors
- [ ] All CTAs have clear, specific labels (no "Submit" or "Click here")

### SEO
- [ ] Unique `<title>` tag on every page (under 60 characters)
- [ ] Unique `<meta description>` on every page (150–160 characters)
- [ ] One H1 per page, includes location and primary service
- [ ] Heading hierarchy is sequential (no skipped levels)
- [ ] LocalBusiness schema markup present and valid (test with Google Rich Results Test)
- [ ] `sitemap.xml` generated and accessible
- [ ] `robots.txt` present
- [ ] Canonical URLs set
- [ ] All images have descriptive `alt` text
- [ ] Open Graph tags present

### Accessibility
- [ ] All text meets 4.5:1 contrast ratio (3:1 for large text)
- [ ] All interactive elements have focus indicators
- [ ] Skip navigation link present
- [ ] All form inputs have visible labels
- [ ] All images have appropriate `alt` text
- [ ] Keyboard navigation works throughout
- [ ] Page has proper landmark elements
- [ ] `<html lang="en">` set

### Technical
- [ ] Site loads in under 3 seconds on mobile (3G)
- [ ] No console errors
- [ ] All links work (no 404s)
- [ ] Phone numbers are tappable (`tel:` links)
- [ ] Email addresses are tappable (`mailto:` links)
- [ ] Contact form submits correctly
- [ ] Mobile responsive at 375px, 768px, 1024px, 1440px
- [ ] HTTPS enforced

### Brand
- [ ] Business name spelled correctly throughout
- [ ] Correct phone number on every page
- [ ] Correct address on every page
- [ ] Hours match source data
- [ ] Photos are attributed correctly (Google Maps attribution if required)
- [ ] Color scheme aligns with brand signals (or category defaults)

---

## Part 8: Agent Behavioral Rules

### Always
- Derive all content from verified enrichment data
- Use the business's actual name, address, phone, and hours
- Include location in H1 tags and meta titles
- Generate unique content per business (no copy-paste between sites)
- Include schema.org LocalBusiness markup
- Test accessibility before marking site as ready
- Flag missing data rather than fabricating it

### Never
- Invent services the business doesn't offer
- Fabricate reviews or testimonials
- Create fake "limited time offers" or urgency language not based on reality
- Use superlatives ("best", "top", "#1") without verified backing (rating/review data)
- Include stock photos representing specific people without disclosure
- Keyword-stuff (repeating location or service names unnaturally)
- Use dark patterns (hidden fees, forced actions, misleading CTAs)
- Generate content below WCAG 2.2 AA accessibility standards
- Skip the quality checklist
- Deploy a site with placeholder content
