export const SITE_GENERATION_SYSTEM_PROMPT = `You are an expert content designer creating a conversion-optimized website for a local business. You follow these principles:

Content quality: Every sentence must be purposeful, concise, conversational, and clear.
Reading level: 7th-8th grade for consumer businesses, 9th-10th for professional services.
Sentence length: Average 8-14 words. Never exceed 25 words.
SEO: Include location in H1s, use semantic HTML structure, write for search intent.
Accessibility: All content supports WCAG 2.2 AA compliance.
Voice: Match the business's derived voice archetype and characteristics.
Honesty: Only include verified information. Never fabricate services, reviews, or credentials.

You generate content as structured JSON that the rendering engine will use to build the site.`

export interface SiteGenerationInput {
  enriched_profile_json: string
  theme_id: string
  layout_variant: string
}

export interface SiteContentOutput {
  homepage: {
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
      rating_display: { source: string; rating: number; count: number }
      featured_testimonials: { quote: string; reviewer_name: string; source: string }[]
    }
    about_snippet: {
      heading: string
      body: string
      owner_name: string | null
    }
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
}

export function buildSiteGenerationPrompt(input: SiteGenerationInput): string {
  return `Generate website content for this business.

## Business Profile
${input.enriched_profile_json}

## Theme
- Theme: ${input.theme_id}
- Layout: ${input.layout_variant}

## Content Knowledge Base Reference
Follow all patterns from the Content & SEO Knowledge Base, particularly:
- Homepage section patterns (hero, services, social proof, about, CTA)
- Service page patterns
- Contact page patterns
- Microcopy patterns for forms and CTAs
- SEO meta generation rules
- Schema.org LocalBusiness markup requirements

## Generate this JSON structure:

{
  "homepage": {
    "hero": {
      "headline": "Customer-problem-first headline, 8-12 words, includes location",
      "subheadline": "What the business does + location, 12-18 words",
      "primary_cta": { "label": "low-commitment action label", "type": "phone | form | link" },
      "secondary_cta": { "label": "...", "type": "..." }
    },
    "services_section": {
      "heading": "...",
      "services": [
        {
          "name": "...",
          "description": "1-2 sentences, plain language",
          "icon_suggestion": "material symbol name"
        }
      ]
    },
    "social_proof": {
      "rating_display": { "source": "google", "rating": 4.9, "count": 247 },
      "featured_testimonials": [
        { "quote": "exact review excerpt", "reviewer_name": "First name + last initial", "source": "Google" }
      ]
    },
    "about_snippet": {
      "heading": "...",
      "body": "2-3 sentences, personality-forward, derived from profile",
      "owner_name": "if available"
    },
    "cta_section": {
      "heading": "...",
      "body": "1 sentence, urgency-free",
      "primary_cta": { "label": "...", "type": "..." }
    }
  },
  "service_pages": [
    {
      "slug": "drain-cleaning",
      "h1": "{Service} in {City}, {State}",
      "opening": "2-3 sentences, problem-first framing",
      "whats_involved": ["3-5 plain language descriptions of the process"],
      "why_this_business": ["2-3 points from review themes"],
      "pricing": "from reviews/profile or null",
      "cta": { "label": "...", "type": "..." }
    }
  ],
  "about_page": {
    "h1": "About {Business Name}",
    "story": "3-4 paragraphs, business narrative derived from profile and reviews",
    "team": "if owner name known, brief mention",
    "values": ["2-3 values derived from review themes"]
  },
  "contact_page": {
    "h1": "Contact {Business Name}",
    "phone": "{formatted phone}",
    "address": "{full address}",
    "hours": { "monday": "8:00 AM - 5:00 PM", ... },
    "form_fields": ["name", "phone", "email", "message", "preferred_contact"],
    "response_expectation": "derived from review response patterns or default"
  },
  "faq_page": {
    "h1": "Frequently Asked Questions",
    "questions": [
      { "question": "matches real search queries for this business type + location", "answer": "2-3 sentences" }
    ]
  },
  "seo": {
    "homepage_title": "{Primary Service} in {City}, {State} | {Business Name} — under 60 chars",
    "homepage_description": "150-160 chars, includes location and primary service",
    "og_image_text": "text to overlay on OG image template",
    "schema_type": "specific LocalBusiness subtype",
    "schema_data": { "full LocalBusiness JSON-LD" }
  },
  "global": {
    "phone_display": "(510) 555-0123",
    "phone_tel": "+15105550123",
    "sticky_cta": { "phone": true, "button_label": "...", "button_type": "..." }
  }
}`
}
