export const LANDING_PAGE_SYSTEM_PROMPT = `You are creating a sales landing page that pitches a generated website to a business owner who currently has no web presence. The landing page should:
- Lead with the value of having a website (not features of your service)
- Show the actual website you built for them (screenshot + link)
- Explain your strategy in plain, non-technical language
- Position the site owner as a strategist, not a commodity vendor
- Include a clear CTA to schedule a meeting
- Be honest, not pushy — the quality of the preview site should do the selling`

export interface LandingPageInput {
  business_name: string
  category: string
  city: string
  state: string
  rating: number | null
  review_count: number | null
  website_status: string
  preview_site_url: string
  theme_id: string
  services_count: number
  calendly_url: string
}

export interface LandingPageOutput {
  headline: string
  subheadline: string
  site_preview_section: {
    intro: string
    site_url: string
    screenshot_alt: string
  }
  strategy_section: {
    heading: string
    points: { title: string; description: string }[]
  }
  what_you_get: {
    heading: string
    tiers_preview: { name: string; price: string; highlight: string }[]
  }
  cta_section: {
    heading: string
    body: string
    button_label: string
    button_url: string
  }
}

export function buildLandingPagePrompt(input: LandingPageInput): string {
  return `Generate landing page content for this prospect.

## Business
- Name: ${input.business_name}
- Category: ${input.category}
- Location: ${input.city}, ${input.state}
- Rating: ${input.rating ?? 'N/A'} (${input.review_count ?? 0} reviews)
- Current web presence: ${input.website_status}

## Generated Site
- URL: ${input.preview_site_url}
- Theme: ${input.theme_id}
- Key features: ${input.services_count} service pages, SEO optimized, mobile responsive, ${input.review_count ?? 0}+ reviews featured

## Booking Page URL
${input.calendly_url}

## Generate this JSON:
{
  "headline": "Attention-grabbing, specific to this business, 8-12 words",
  "subheadline": "Establishes the problem — they're invisible online",
  "site_preview_section": {
    "intro": "1-2 sentences introducing the preview site",
    "site_url": "${input.preview_site_url}",
    "screenshot_alt": "descriptive alt text for site screenshot"
  },
  "strategy_section": {
    "heading": "Why this site is built the way it is",
    "points": [
      {
        "title": "short point title",
        "description": "1-2 sentences explaining the strategic choice in plain language"
      }
    ]
  },
  "what_you_get": {
    "heading": "...",
    "tiers_preview": [
      { "name": "Starter", "price": "$25/mo", "highlight": "Get online fast" },
      { "name": "Growth", "price": "$50/mo", "highlight": "Capture more leads" },
      { "name": "Pro", "price": "$75/mo", "highlight": "Automate your presence" },
      { "name": "Premium", "price": "$100/mo", "highlight": "Full growth partner" }
    ]
  },
  "cta_section": {
    "heading": "...",
    "body": "1 sentence, no pressure. Always say '15-minute call' (not 20 or 30).",
    "button_label": "Book a free 15-minute call",
    "button_url": "${input.calendly_url}"
  }
}`
}
