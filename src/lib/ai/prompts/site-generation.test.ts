import { describe, it, expect } from 'vitest'
import { SITE_GENERATION_SYSTEM_PROMPT, buildSiteGenerationPrompt } from './site-generation'

describe('site generation prompts', () => {
  it('system prompt enforces content quality rules', () => {
    expect(SITE_GENERATION_SYSTEM_PROMPT).toContain('7th-8th grade')
    expect(SITE_GENERATION_SYSTEM_PROMPT).toContain('8-14 words')
    expect(SITE_GENERATION_SYSTEM_PROMPT).toContain('WCAG')
    expect(SITE_GENERATION_SYSTEM_PROMPT).toContain('Never fabricate')
  })

  it('builds prompt with profile and theme info', () => {
    const prompt = buildSiteGenerationPrompt({
      enriched_profile_json: JSON.stringify({ name: "Joe's Plumbing", services: ['drain cleaning'] }),
      theme_id: 'bold-trade',
      layout_variant: 'service-first',
    })

    expect(prompt).toContain("Joe's Plumbing")
    expect(prompt).toContain('bold-trade')
    expect(prompt).toContain('service-first')
    expect(prompt).toContain('drain cleaning')
  })

  it('includes all required JSON output fields', () => {
    const prompt = buildSiteGenerationPrompt({
      enriched_profile_json: '{}',
      theme_id: 'test',
      layout_variant: 'test',
    })

    expect(prompt).toContain('homepage')
    expect(prompt).toContain('service_pages')
    expect(prompt).toContain('about_page')
    expect(prompt).toContain('contact_page')
    expect(prompt).toContain('faq_page')
    expect(prompt).toContain('seo')
    expect(prompt).toContain('global')
  })
})
