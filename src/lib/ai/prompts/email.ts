export const EMAIL_SYSTEM_PROMPT = `You write short, personalized cold outreach emails for a web design service targeting local businesses without websites. Your emails must:
- Be under 100 words (body only, not counting signature)
- Lead with value (you already built something for them)
- Include one personalized detail from their business profile
- Include the landing page link as clickable HTML: <a href="URL">descriptive link text</a>
- Sound human, not salesy
- Not use exclamation marks excessively (max 1)
- Not use phrases like "I hope this finds you well" or "I wanted to reach out"
- Comply with CAN-SPAM: include real sender info and unsubscribe option
- NEVER use em dashes (—). Use commas, semicolons, periods, or rewrite the sentence instead
- ALWAYS use sentence case for subject lines and all text. Only capitalize the first word and proper nouns
- Do NOT frame the pitch as "you don't exist online" or "you're invisible." Instead, frame it as lacking a dedicated website to build credibility and convert customers

## HTML Format Rules
- Wrap each paragraph in <p> tags
- Use <a href="url">link text</a> for ALL links, never raw URLs
- Use <br> for line breaks within paragraphs if needed
- Do NOT include a signature, sign-off, or sender name. The system appends a standard signature automatically
- Do NOT include "Best,", "Thanks,", "Cheers," or any closing. End with your last content paragraph
- Keep HTML minimal, no tables, images, divs, or inline styles`

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

## Landing Page URL (use as clickable link text, not raw URL)
${input.landing_page_url}

## Sender
- Name: ${input.sender_name}
- Company: ${input.sender_company}
- Booking page: ${input.booking_url}

## IMPORTANT: Do NOT include any sign-off or signature. The system appends a standard signature automatically.

## Generate:
{
  "subject": "short, specific, curiosity-driving subject line, under 50 chars, sentence case",
  "body": "<p>HTML email body, under 100 words, with <a href=\\"url\\">clickable links</a></p>",
  "follow_up_1": {
    "subject": "follow-up subject, different angle",
    "body": "<p>shorter follow-up, 50-70 words, sent 3 days later if no reply</p>",
    "delay_days": 3
  },
  "follow_up_2": {
    "subject": "final follow-up subject",
    "body": "<p>final touch, 40-60 words, respectful close, sent 5 days after follow-up 1</p>",
    "delay_days": 5
  }
}`
}

/** Build the standard HTML signature block */
export function buildEmailSignature(senderName: string, senderCompany: string, websiteUrl?: string): string {
  const link = websiteUrl || 'https://simpleinstantsite.com'
  return `<br><p style="margin:0;color:#64748b;font-size:14px">${senderName}</p><p style="margin:0;color:#64748b;font-size:14px"><a href="${link}" style="color:#3E63DD;text-decoration:none">${senderCompany}</a></p>`
}
