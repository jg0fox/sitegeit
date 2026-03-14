import { describe, it, expect } from 'vitest'
import { EMAIL_SYSTEM_PROMPT, buildEmailPrompt, type EmailInput } from './email'

describe('email prompts', () => {
  const sampleInput: EmailInput = {
    business_name: "Joe's Plumbing",
    owner_name: 'Joe',
    category: 'Plumber',
    city: 'Austin',
    rating: 4.8,
    review_count: 247,
    unique_detail: 'Known for same-day emergency service',
    landing_page_url: 'https://go.sitegeit.com/joes-plumbing',
    sender_name: 'Alex',
    sender_company: 'Sitegeit',
    calendly_url: 'https://seitgeit.vercel.app/book',
  }

  it('system prompt enforces email rules', () => {
    expect(EMAIL_SYSTEM_PROMPT).toContain('under 100 words')
    expect(EMAIL_SYSTEM_PROMPT).toContain('CAN-SPAM')
    expect(EMAIL_SYSTEM_PROMPT).toContain('not salesy')
  })

  it('builds prompt with business details', () => {
    const prompt = buildEmailPrompt(sampleInput)

    expect(prompt).toContain("Joe's Plumbing")
    expect(prompt).toContain('Joe')
    expect(prompt).toContain('Austin')
    expect(prompt).toContain('4.8')
    expect(prompt).toContain('same-day emergency service')
    expect(prompt).toContain('go.sitegeit.com/joes-plumbing')
    expect(prompt).toContain('Alex')
    expect(prompt).toContain('Sitegeit')
  })

  it('handles unknown owner name', () => {
    const prompt = buildEmailPrompt({ ...sampleInput, owner_name: null })
    expect(prompt).toContain('Unknown')
  })

  it('includes follow-up structure', () => {
    const prompt = buildEmailPrompt(sampleInput)
    expect(prompt).toContain('follow_up_1')
    expect(prompt).toContain('follow_up_2')
    expect(prompt).toContain('delay_days')
  })
})
