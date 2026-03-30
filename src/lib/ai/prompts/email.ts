export const EMAIL_SYSTEM_PROMPT = `You write short, personalized cold outreach emails for a web design service targeting local businesses without websites. Your emails must:
- Be under 100 words
- Lead with value (you already built something for them)
- Include one personalized detail from their business profile
- Include the landing page link
- Sound human, not salesy
- Not use exclamation marks excessively (max 1)
- Not use phrases like "I hope this finds you well" or "I wanted to reach out"
- Comply with CAN-SPAM: include real sender info and unsubscribe option`

export interface EmailInput {
  business_name: string
  owner_name: string | null
  category: string
  city: string
  rating: number | null
  review_count: number | null
  unique_detail: string
  landing_page_url: string
  sender_name: string
  sender_company: string
  booking_url: string
}

export interface EmailOutput {
  subject: string
  body: string
  follow_up_1: {
    subject: string
    body: string
    delay_days: number
  }
  follow_up_2: {
    subject: string
    body: string
    delay_days: number
  }
}

export function buildEmailPrompt(input: EmailInput): string {
  return `Write an outreach email for this prospect.

## Prospect
- Business name: ${input.business_name}
- Owner name: ${input.owner_name || 'Unknown'}
- Category: ${input.category}
- City: ${input.city}
- Google rating: ${input.rating ?? 'N/A'} (${input.review_count ?? 0} reviews)
- A notable detail from their profile: ${input.unique_detail}

## Landing Page URL
${input.landing_page_url}

## Sender
- Name: ${input.sender_name}
- Company: ${input.sender_company}
- Booking page: ${input.booking_url}

## Generate:
{
  "subject": "short, specific, curiosity-driving subject line — under 50 chars",
  "body": "the email body, under 100 words, includes landing page link naturally",
  "follow_up_1": {
    "subject": "follow-up subject, different angle",
    "body": "shorter follow-up, 50-70 words, sent 3 days later if no reply",
    "delay_days": 3
  },
  "follow_up_2": {
    "subject": "final follow-up subject",
    "body": "final touch, 40-60 words, respectful close, sent 5 days after follow-up 1",
    "delay_days": 5
  }
}`
}
