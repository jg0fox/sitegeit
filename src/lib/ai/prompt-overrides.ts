import { getAdminClient } from '@/lib/supabase/admin'

type PromptKey = 'enrichment' | 'site_generation' | 'email' | 'landing_page'

/**
 * Returns the effective system prompt for a given key, checking for user overrides.
 * If the user has a custom override for this prompt, it replaces the default.
 */
export async function getEffectivePrompt(
  userId: string,
  key: PromptKey,
  defaultPrompt: string
): Promise<string> {
  try {
    const supabase = getAdminClient()
    const { data } = await supabase
      .from('users')
      .select('prompt_overrides')
      .eq('id', userId)
      .single()

    const overrides = data?.prompt_overrides as Record<string, string> | null
    if (overrides?.[key]?.trim()) {
      return overrides[key]
    }
  } catch {
    // Fall through to default
  }

  return defaultPrompt
}
