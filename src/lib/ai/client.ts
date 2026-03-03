import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
  return client
}

export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  model: string = 'claude-sonnet-4-6'
): Promise<T> {
  const anthropic = getAnthropicClient()

  const message = await anthropic.messages.create({
    model,
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const textBlock = message.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  // Extract JSON from the response (handle markdown code blocks)
  let jsonText = textBlock.text.trim()
  const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonText = jsonMatch[1].trim()
  }

  try {
    return JSON.parse(jsonText) as T
  } catch {
    throw new Error(`Failed to parse Claude JSON response: ${jsonText.substring(0, 200)}...`)
  }
}
