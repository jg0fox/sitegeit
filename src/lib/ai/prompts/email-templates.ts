/**
 * Email Template Variants for A/B Performance Tracking
 *
 * Each variant defines a structural approach for the primary outreach email.
 * The AI follows the variant's instructions to produce consistently structured
 * emails that can be compared for performance over time.
 */

export interface EmailTemplateVariant {
  id: string
  name: string
  description: string
  /** Additional instructions injected into the AI prompt */
  promptInstructions: string
}

export const EMAIL_TEMPLATE_VARIANTS: EmailTemplateVariant[] = [
  {
    id: 'direct-value',
    name: 'Direct Value',
    description: 'Lead with "I built you a website" + link. Straightforward value-first approach.',
    promptInstructions: `APPROACH: Direct Value
- Open by stating you built them a preview website
- Link to the landing page in the first or second sentence
- Follow with one personalized detail about their business
- Close with a low-pressure invitation to take a look`,
  },
  {
    id: 'social-proof',
    name: 'Social Proof',
    description: 'Lead with their Google rating/reviews, then offer.',
    promptInstructions: `APPROACH: Social Proof
- Open by referencing their Google rating or review count as social proof of their quality
- Transition to: "your online presence should match that reputation"
- Introduce the preview website you built
- Link to the landing page after establishing credibility`,
  },
  {
    id: 'question-hook',
    name: 'Question Hook',
    description: 'Open with a question about their current online presence.',
    promptInstructions: `APPROACH: Question Hook
- Open with a genuine question about their business or online presence (not rhetorical/salesy)
- Transition naturally to the preview website you created
- Link to the landing page as the answer to the question
- Keep the tone curious and helpful, not pushy`,
  },
  {
    id: 'local-angle',
    name: 'Local Angle',
    description: 'Lead with something specific to their neighborhood or city.',
    promptInstructions: `APPROACH: Local Angle
- Open with a specific reference to their city, neighborhood, or local context
- Connect their local presence to the opportunity for a website
- Introduce the preview website you built for them
- Link to the landing page with local framing ("for your [City] customers")`,
  },
]

/** Select a random template variant */
export function selectTemplateVariant(): EmailTemplateVariant {
  const idx = Math.floor(Math.random() * EMAIL_TEMPLATE_VARIANTS.length)
  return EMAIL_TEMPLATE_VARIANTS[idx]
}
