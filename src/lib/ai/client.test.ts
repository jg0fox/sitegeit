import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn(),
      },
    })),
  }
})

describe('generateJSON', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.ANTHROPIC_API_KEY = 'test-key'
  })

  it('parses direct JSON response', async () => {
    // First import is used to setup mock, fresh import below is used for the test
    await import('./client')

    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const mockCreate = vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: '{"name": "test", "value": 42}' }],
    })
    vi.mocked(Anthropic).mockImplementation(() => ({
      messages: { create: mockCreate },
    }) as never)

    // Force recreation of client
    vi.resetModules()
    const { generateJSON: fresh } = await import('./client')
    const result = await fresh<{ name: string; value: number }>('system', 'user')
    expect(result).toEqual({ name: 'test', value: 42 })
  })

  it('parses JSON wrapped in code blocks', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const mockCreate = vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: '```json\n{"name": "test"}\n```' }],
    })
    vi.mocked(Anthropic).mockImplementation(() => ({
      messages: { create: mockCreate },
    }) as never)

    vi.resetModules()
    const { generateJSON } = await import('./client')
    const result = await generateJSON<{ name: string }>('system', 'user')
    expect(result).toEqual({ name: 'test' })
  })

  it('throws on invalid JSON', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const mockCreate = vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: 'not json at all' }],
    })
    vi.mocked(Anthropic).mockImplementation(() => ({
      messages: { create: mockCreate },
    }) as never)

    vi.resetModules()
    const { generateJSON } = await import('./client')
    await expect(generateJSON('system', 'user')).rejects.toThrow('Failed to parse Claude JSON response')
  })

  it('throws when no text block in response', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const mockCreate = vi.fn().mockResolvedValue({
      content: [],
    })
    vi.mocked(Anthropic).mockImplementation(() => ({
      messages: { create: mockCreate },
    }) as never)

    vi.resetModules()
    const { generateJSON } = await import('./client')
    await expect(generateJSON('system', 'user')).rejects.toThrow('No text response from Claude')
  })
})
