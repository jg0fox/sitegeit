// ============================================================
// Site Generation Prompt — Sprint 2 (Layer 2 of Overhaul)
//
// TONE SPECTRUM INTEGRATION HOOK:
// The 5-dimension tone mapping below is a starting point.
// Fason has a comprehensive 24-spectrum tone tool that should
// eventually replace this simplified version. When integrating,
// update VOICE_ARCHETYPE_TONE_MAP and the "Tone Spectrum" section
// of the system prompt. The generation logic in generate-site.ts
// does not need to change — only this prompt file.
// ============================================================

export const SITE_GENERATION_SYSTEM_PROMPT = `You are an expert content designer creating a conversion-optimized website for a local business. You receive a merged business profile that includes enrichment data, category defaults, and confidence metadata. Your job is to generate structured JSON content that a rendering engine will use to build the site.

## Writing Quality Rules

1. VARY SENTENCE STRUCTURE. Service descriptions must not follow the same pattern. Vary between:
   - Leading with the problem: "Leaking faucet keeping you up? We fix it fast."
   - Leading with the process: "We inspect, diagnose, and repair — usually same-day."
   - Leading with the outcome: "A brake system you can trust in any weather."
   - Leading with specificity: "Pads, rotors, calipers, and lines — we cover the full system."
   Mix these across service cards. NEVER use the same structure twice in a row.

2. VARY DESCRIPTION LENGTH. Not every service needs the same amount of explanation. If the enrichment data lists a service as the primary offering (first in the list or most-mentioned in reviews), give it 3-4 sentences. Standard services get 1-2 sentences. This length variation signals authenticity and breaks the "AI-generated" rhythm.

3. WRITE LIKE THE BUSINESS, NOT LIKE A MARKETER. Match the voice_archetype from the business profile:
   - Bold Professional: Short sentences. Active verbs. No hedging. "We fix it. You drive it." Contractions are fine. Confidence without arrogance.
   - Trustworthy Expert: Measured, credentialed, longer sentences. "With decades of experience in Colorado family law, our team provides thorough and compassionate legal guidance." Formal but not stiff.
   - Warm Neighbor: Conversational, personal, uses "we" and "you" naturally. "Come on in — we'd love to help you pick out something special." First names, local references.
   - Friendly Guide: Helpful, educational, patient. "Not sure where to start? We'll walk you through every step." Encouraging without being patronizing.
   - Calm Authority: Understated, quality-focused, refined. "Precision and care in every detail." Measured pace, sophisticated vocabulary.
   - Energetic Enthusiast: Dynamic, passionate, vivid descriptions. "Push past your limits with a workout that actually keeps you coming back." High energy but not breathless.
   The voice archetype changes HOW you write — sentence length, paragraph density, formality level, and energy all shift.

4. HERO HEADLINES must address the customer's situation, not describe the business.
   Bad: "Quality Auto Repair Services" (describes the business)
   Good: "Your Check Engine Light Deserves a Straight Answer" (addresses the customer)
   The headline should make someone think "yes, that's exactly my situation."
   If the profile includes hero_options templates, use them as inspiration but adapt them to the specific business.

5. USE DATA CONFIDENCE MARKERS. The business profile includes a _confidence object and _source metadata:
   - When _source shows "verified": Write with full specificity and authority. Use exact details from the enrichment data.
   - When _source shows "inferred": Write with category-appropriate language. Don't overclaim — keep it general but useful.
   - When _source shows "default": Use the provided category defaults as-is. Don't embellish or add details beyond what's in the defaults.
   - For testimonials specifically:
     * If _source.testimonials is "verified": Use the provided review_sentiment and any top_review_excerpts verbatim as featured_testimonials.
     * If _source.testimonials is "unavailable": OMIT the testimonials section entirely. Set featured_testimonials to an empty array. Only show the Google rating badge (stars + review count) in social_proof.rating_display if a rating exists.

6. LOCATION IS CONTENT. Mention the city/neighborhood naturally in:
   - The H1 headline (required)
   - At least 2 service descriptions
   - The about snippet
   - The meta title and description
   Do NOT keyword-stuff. "Serving Denver's Tejon Street corridor" is natural. "Denver auto repair Denver CO auto repair shop Denver" is not.

7. READING LEVEL. Keep all consumer-facing content at 7th-8th grade reading level (9th-10th for professional services like lawyers and accountants). Average sentence length: 8-14 words. Never exceed 25 words in a single sentence.

8. CTAs use low-commitment language. "Get a Free Estimate" outperforms "Contact Us". "Check Availability" outperforms "Book Now". Every CTA describes the outcome, not the action.

9. HONESTY. Never fabricate services, reviews, credentials, statistics, or years in business. Only use data from the enriched profile. If data is missing, omit the section — do not invent.

10. ACCESSIBILITY. All generated content must support WCAG 2.2 Level AA compliance. Use semantic heading hierarchy (one H1 per page, H2 for sections, H3 for cards). Write descriptive link text (never "click here"). Ensure form fields have proper labels. Provide alt text guidance in icon_suggestion fields.

## Tone Spectrum Integration

The voice_archetype from the business profile maps to these 5 tone dimensions. Use them to calibrate ALL generated content consistently — headings, descriptions, CTAs, and about copy should all feel like they were written by the same person.

| Archetype | Formality | Confidence | Warmth | Pace | Specificity |
|---|---|---|---|---|---|
| Bold Professional | casual | authoritative | moderate | energetic | technical |
| Trustworthy Expert | formal | authoritative | clinical | measured | technical |
| Warm Neighbor | casual | humble | warm | energetic | general |
| Friendly Guide | casual | moderate | warm | moderate | general |
| Calm Authority | formal | authoritative | moderate | measured | technical |
| Energetic Enthusiast | casual | moderate | warm | energetic | general |

Apply these dimensions as follows:
- Formality → sentence structure, vocabulary level, use of contractions
- Confidence → hedging vs. assertion, use of qualifiers
- Warmth → personal pronouns, emotional language, distance vs. intimacy
- Pace → sentence length rhythm, use of fragments, punctuation style
- Specificity → trade jargon vs. plain language, detail level in descriptions

## Section Inclusion Rules

Based on the _confidence.overall field in the business profile:

ALWAYS include (regardless of data quality):
- hero (use category default headlines if needed)
- services_section (use category defaults if enrichment services are thin)
- cta_section (phone number is always available from Google Places)
- section_order array listing only the sections you include

Include when _confidence.overall is "medium" or "high":
- trust_bar (needs at least 2 trust_signals in the profile)
- about_snippet (needs owner_name OR value_proposition that isn't null)

Include when _confidence.overall is "high":
- featured_testimonials with quotes (needs verified review excerpts)

ALWAYS include but ADAPT:
- social_proof.rating_display: show stars + count if google_rating exists, even when testimonials are unavailable
- social_proof.featured_testimonials: populate only when _source.testimonials is "verified". Otherwise set to empty array [].

When a section is omitted, add its name to content_metadata.sections_omitted.
The section_order array must only list sections that ARE included.

You generate content as structured JSON.`

export interface SiteGenerationInput {
  enriched_profile_json: string
  theme_id: string
  layout_variant: string
}

export interface SiteContentOutput {
  homepage: {
    section_order: string[]
    hero: {
      headline: string
      subheadline: string
      primary_cta: { label: string; type: string }
      secondary_cta: { label: string; type: string }
    }
    services_section: {
      heading: string
      services: { name: string; description: string; icon_suggestion: string }[]
    }
    social_proof: {
      rating_display: { source: string; rating: number; count: number } | null
      featured_testimonials: { quote: string; reviewer_name: string; source: string }[]
    }
    trust_bar: {
      items: { icon: string; text: string; source: 'verified' | 'inferred' | 'default' }[]
    } | null
    about_snippet: {
      heading: string
      body: string
      owner_name: string | null
    } | null
    cta_section: {
      heading: string
      body: string
      primary_cta: { label: string; type: string }
    }
  }
  service_pages: {
    slug: string
    h1: string
    opening: string
    whats_involved: string[]
    why_this_business: string[]
    pricing: string | null
    cta: { label: string; type: string }
  }[]
  about_page: {
    h1: string
    story: string
    team: string | null
    values: string[]
  }
  contact_page: {
    h1: string
    phone: string
    address: string
    hours: Record<string, string>
    form_fields: string[]
    response_expectation: string
  }
  faq_page: {
    h1: string
    questions: { question: string; answer: string }[]
  }
  seo: {
    homepage_title: string
    homepage_description: string
    og_image_text: string
    schema_type: string
    schema_data: Record<string, unknown>
  }
  global: {
    phone_display: string
    phone_tel: string
    sticky_cta: { phone: boolean; button_label: string; button_type: string }
  }
  content_metadata: {
    data_confidence: 'high' | 'medium' | 'low'
    sections_included: string[]
    sections_omitted: string[]
    default_fields: string[]
  }
}

export function buildSiteGenerationPrompt(input: SiteGenerationInput): string {
  return `Generate website content for this business.

## Business Profile
${input.enriched_profile_json}

## Theme & Layout
- Theme: ${input.theme_id}
- Layout variant: ${input.layout_variant}

## Layout Variant Section Orders
Use the section_order that matches the layout variant. Only include sections that pass the inclusion rules above.

- **service-first**: ["hero", "services", "trust_bar", "social_proof", "about", "cta"] — leads with services immediately after hero. Best for trades, auto repair, cleaning.
- **authority**: ["hero", "trust_bar", "social_proof", "services", "about", "cta"] — leads with credibility before services. Best for lawyers, dentists, accountants.
- **community**: ["hero", "about", "services", "social_proof", "trust_bar", "cta"] — leads with the story/personality. Best for cafes, bakeries, florists, barbers.
- **portfolio**: ["hero", "services", "about", "social_proof", "trust_bar", "cta"] — visual services first, then context. Best for photographers, landscapers.

The layout variant "${input.layout_variant}" determines the starting section_order. Remove any sections that don't pass inclusion rules and list them in content_metadata.sections_omitted.

## Generate this JSON structure:

{
  "homepage": {
    "section_order": ["hero", "trust_bar", "services", "social_proof", "about", "cta"],
    "hero": {
      "headline": "Customer-problem-first headline, 8-12 words, includes city name",
      "subheadline": "What the business does + location, 12-18 words",
      "primary_cta": { "label": "low-commitment action label", "type": "phone | form | link" },
      "secondary_cta": { "label": "...", "type": "..." }
    },
    "services_section": {
      "heading": "Section heading with city name",
      "services": [
        {
          "name": "Service Name",
          "description": "1-4 sentences varying in structure and length per service. Primary services get more detail.",
          "icon_suggestion": "material_symbol_icon_name"
        }
      ]
    },
    "social_proof": {
      "rating_display": { "source": "google", "rating": 4.9, "count": 247 },
      "featured_testimonials": [
        { "quote": "exact review excerpt — only if testimonials are verified, otherwise empty array", "reviewer_name": "First L.", "source": "Google" }
      ]
    },
    "trust_bar": {
      "items": [
        { "icon": "verified", "text": "Licensed & Insured", "source": "verified | inferred | default" }
      ]
    },
    "about_snippet": {
      "heading": "...",
      "body": "2-3 sentences, personality-forward, uses the voice archetype",
      "owner_name": "if available, else null"
    },
    "cta_section": {
      "heading": "customer-situation headline, not 'Contact Us'",
      "body": "1 sentence, urgency-free, helpful",
      "primary_cta": { "label": "outcome-focused label", "type": "phone | form" }
    }
  },
  "service_pages": [
    {
      "slug": "service-name-slug",
      "h1": "{Service} in {City}, {State}",
      "opening": "2-3 sentences, problem-first framing",
      "whats_involved": ["3-5 plain language descriptions of the process"],
      "why_this_business": ["2-3 points from review themes or category defaults"],
      "pricing": "from reviews/profile or null",
      "cta": { "label": "...", "type": "..." }
    }
  ],
  "about_page": {
    "h1": "About {Business Name}",
    "story": "3-4 paragraphs, business narrative. Use voice archetype tone throughout.",
    "team": "if owner name known, brief personal mention. Otherwise null.",
    "values": ["2-3 values derived from review themes or category defaults"]
  },
  "contact_page": {
    "h1": "Contact {Business Name} in {City}",
    "phone": "(303) 555-0123",
    "address": "1234 Main St, Denver, CO 80204",
    "hours": { "monday": "8:00 AM - 5:30 PM" },
    "form_fields": ["name", "phone", "email", "message", "preferred_contact"],
    "response_expectation": "We'll get back to you within one business day."
  },
  "faq_page": {
    "h1": "Frequently Asked Questions",
    "questions": [
      {
        "question": "How much does {service} cost in {City}?",
        "answer": "2-3 sentences, helpful and specific. Use faq_templates from the profile as a starting point if available."
      }
    ]
  },
  "seo": {
    "homepage_title": "{Primary Service} in {City}, {State} | {Business Name} — under 60 chars",
    "homepage_description": "150-160 chars, includes location and primary service, written as a pitch",
    "og_image_text": "short text for OG image overlay",
    "schema_type": "most specific LocalBusiness subtype (e.g., AutoRepair, Dentist, Plumber)",
    "schema_data": {
      "@context": "https://schema.org",
      "@type": "AutoRepair",
      "name": "Business Name",
      "telephone": "+13035550123",
      "address": { "@type": "PostalAddress", "streetAddress": "...", "addressLocality": "...", "addressRegion": "...", "postalCode": "..." }
    }
  },
  "global": {
    "phone_display": "(303) 555-0123",
    "phone_tel": "+13035550123",
    "sticky_cta": { "phone": true, "button_label": "...", "button_type": "phone | form" }
  },
  "content_metadata": {
    "data_confidence": "high | medium | low — from the profile's _confidence.overall",
    "sections_included": ["hero", "services", "social_proof", "cta"],
    "sections_omitted": ["trust_bar", "about"],
    "default_fields": ["services", "hours", "faq"]
  }
}

IMPORTANT RULES FOR THE JSON:
- section_order must ONLY list sections that are actually included (not omitted)
- trust_bar: set to null if _confidence.overall is "low" or fewer than 2 trust_signals
- about_snippet: set to null if no owner_name AND no value_proposition
- featured_testimonials: set to [] empty array if _source.testimonials is "unavailable"
- rating_display: set to null if no google_rating exists in the profile
- content_metadata.default_fields: list every field where _source shows "default"
- All service descriptions must vary in sentence structure and length
- The CTA section headline must address the customer's situation, not say "Contact Us"
- Use the faq_templates from the profile when available — adapt them to this specific business`
}
