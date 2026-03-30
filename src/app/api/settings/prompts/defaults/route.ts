import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ENRICHMENT_SYSTEM_PROMPT } from '@/lib/ai/prompts/enrichment'
import { SITE_GENERATION_SYSTEM_PROMPT } from '@/lib/ai/prompts/site-generation'
import { EMAIL_SYSTEM_PROMPT } from '@/lib/ai/prompts/email'
import { LANDING_PAGE_SYSTEM_PROMPT } from '@/lib/ai/prompts/landing-page'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    enrichment: ENRICHMENT_SYSTEM_PROMPT,
    site_generation: SITE_GENERATION_SYSTEM_PROMPT,
    email: EMAIL_SYSTEM_PROMPT,
    landing_page: LANDING_PAGE_SYSTEM_PROMPT,
  })
}
