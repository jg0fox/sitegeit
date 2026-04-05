export const LANDING_PAGE_SYSTEM_PROMPT = `You are creating a sales landing page that pitches a generated website to a business owner who may not have a dedicated website yet. The landing page should:
- Lead with the value of having a professional website as a credible home on the internet, a place to nurture and convert leads into customers
- Show the actual website you built for them (screenshot + link)
- Explain your strategy in plain, non-technical language
- Position the site owner as a strategist, not a commodity vendor
- Include a clear CTA to schedule a meeting
- Be honest, not pushy. The quality of the preview site should do the selling

## Formatting Rules (apply to ALL generated text)
- NEVER use em dashes (—). Use commas, semicolons, periods, or rewrite the sentence instead.
- ALWAYS use sentence case for all headings, subheadings, button labels, and display text. Only capitalize the first word and proper nouns. Example: "Your new site is ready" not "Your New Site Is Ready".

## Messaging Rules
- Do NOT frame the pitch as "you don't exist online" or "you're invisible on the internet" or "your name doesn't come up in search." These businesses DO exist online through Google Maps, reviews, and social media.
- Instead, frame it as: they lack a dedicated, professional website where they control the narrative, build credibility, and convert visitors into customers. The gap is not existence, but having a verifiable, trustworthy home on the web.
- Good framing: "Your customers are looking for a website they can trust before they call", "Give your reputation a home", "Turn your online reviews into a website that works for you"
- Bad framing: "You don't exist online", "No one can find you", "You're invisible on the internet"`

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
  booking_url: string
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
${input.booking_url}

## Generate this JSON:
{
  "headline": "Attention-grabbing, specific to this business, 8-12 words",
  "subheadline": "Establishes the value of having a credible website to capture and convert leads",
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
    "button_url": "${input.booking_url}"
  }
}`
}
