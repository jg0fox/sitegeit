import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/ai/client'

/**
 * POST /api/ai/rewrite
 * Rewrites text using AI with a given instruction.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { text, instruction } = await request.json()

  if (!text || !instruction) {
    return NextResponse.json(
      { error: 'Missing required fields: text, instruction' },
      { status: 400 }
    )
  }

  const anthropic = getAnthropicClient()

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: 'You are a copywriting assistant. Rewrite the given text according to the instruction. Return only the rewritten text, nothing else. IMPORTANT RULES: Never use em dashes (—), use commas or periods instead. Always use sentence case for headings and display text (only capitalize the first word and proper nouns).',
    messages: [{
      role: 'user',
      content: `Instruction: ${instruction}\n\nText to rewrite:\n${text}`,
    }],
  })

  const textBlock = message.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
  }

  return NextResponse.json({ result: textBlock.text.trim() })
}
