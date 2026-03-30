import { getAdminClient } from '@/lib/supabase/admin'
import { generateJSON } from './client'
import {
  SITE_GENERATION_SYSTEM_PROMPT,
  buildSiteGenerationPrompt,
  type SiteContentOutput,
} from './prompts/site-generation'
import { getThemeForCategory, getThemeId, getLayoutForCategory, themeConfigToCSSVars, buildEditorialThemeConfig, getEditorialPaletteId } from '@/lib/themes'
import { getCategoryDefaults } from '@/lib/defaults/category-defaults'
import { mergeEnrichmentWithDefaults } from '@/lib/defaults/merge'
import { getCategoryImageUrls } from '@/lib/images/category-images'
import type { DataConfidence } from './prompts/enrichment'

export async function generateSite(businessId: string): Promise<{ siteId: string; content: SiteContentOutput }> {
  const supabase = getAdminClient()

  // Fetch enriched business
  const { data: business, error: fetchError } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single()

  if (fetchError || !business) {
    throw new Error(`Failed to fetch business ${businessId}: ${fetchError?.message}`)
  }

  // Update status
  await supabase
    .from('businesses')
    .update({ status: 'generating' })
    .eq('id', businessId)

  // Select theme and layout based on category
  const categorySlug = business.category_slug || business.category.toLowerCase().replace(/\s+/g, '_')

  // Use editorial design system for all new sites
  const useEditorial = true
  const editorialPaletteId = getEditorialPaletteId(categorySlug)
  const editorialConfig = useEditorial ? buildEditorialThemeConfig(categorySlug) : null

  // Legacy theme selection (kept for fallback / existing sites)
  const themeId = useEditorial ? `editorial-${editorialPaletteId}` : getThemeId(categorySlug)
  const layoutVariant = useEditorial ? 'editorial' : getLayoutForCategory(categorySlug)
  const themeConfig = useEditorial ? null : getThemeForCategory(categorySlug)

  // Resolve category stock images
  const categoryImages = getCategoryImageUrls(categorySlug)

  // Merge enrichment data with category defaults
  const categoryDefaults = getCategoryDefaults(categorySlug)
  const enrichmentConfidence = (business.enrichment_confidence as DataConfidence) || null
  const mergedProfile = mergeEnrichmentWithDefaults(
    business,
    enrichmentConfidence,
    categoryDefaults,
    { hero: !!categoryImages, about: !!categoryImages },
  )

  const userPrompt = buildSiteGenerationPrompt({
    enriched_profile_json: JSON.stringify(mergedProfile, null, 2),
    theme_id: themeId,
    layout_variant: layoutVariant,
    palette_id: useEditorial ? editorialPaletteId : undefined,
    design_system: useEditorial ? 'editorial' : 'legacy',
  })

  const { getEffectivePrompt } = await import('./prompt-overrides')
  const systemPrompt = await getEffectivePrompt(business.user_id, 'site_generation', SITE_GENERATION_SYSTEM_PROMPT)
  const content = await generateJSON<SiteContentOutput>(systemPrompt, userPrompt)

  // Replace real phone numbers with sample number for non-client businesses
  const clientStatuses = ['closed_won', 'active']
  if (!clientStatuses.includes(business.status)) {
    const sampleDisplay = '(555) 000-0100'
    const sampleTel = '+15550000100'
    if (content.global) {
      content.global.phone_display = sampleDisplay
      content.global.phone_tel = sampleTel
    }
    if (content.contact_page?.phone) {
      content.contact_page.phone = sampleDisplay
    }
    if (content.seo?.schema_data?.telephone) {
      content.seo.schema_data.telephone = sampleTel
    }
  }

  // Generate slug for the site URL (max 48 chars, break at word boundary)
  const rawSlug = business.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const slug = rawSlug.length > 48
    ? rawSlug.slice(0, 48).replace(/-[^-]*$/, '')
    : rawSlug

  // Check for existing site to support versioning
  const { data: existingSite } = await supabase
    .from('generated_sites')
    .select('id, version, deploy_url, custom_domain')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const newVersion = existingSite ? ((existingSite.version as number) || 1) + 1 : 1
  // Preserve slug and custom domain from previous version
  const deployUrl = existingSite?.deploy_url || slug
  const customDomain = existingSite?.custom_domain || null

  // Build theme_config based on design system
  const storedThemeConfig = editorialConfig
    ? editorialConfig  // EditorialThemeConfig includes cssVars, designSystem flag, palette
    : { ...themeConfig, cssVars: themeConfigToCSSVars(themeConfig!) }

  const sitePayload = {
    business_id: businessId,
    theme_id: themeId,
    layout_variant: layoutVariant,
    theme_config: storedThemeConfig,
    homepage_content: { ...content.homepage, global: content.global },
    service_pages: content.service_pages,
    about_content: content.about_page,
    contact_content: content.contact_page,
    faq_content: content.faq_page,
    seo_meta: content.seo,
    trust_bar: content.homepage.trust_bar,
    content_metadata: content.content_metadata,
    hero_image_url: categoryImages?.heroUrl ?? null,
    about_image_url: categoryImages?.aboutUrl ?? null,
    deploy_url: deployUrl,
    deploy_status: 'pending' as const,
    version: newVersion,
    previous_version_id: existingSite?.id || null,
    custom_domain: customDomain,
  }

  let site: { id: string }
  if (existingSite) {
    // Mark old version as superseded
    await supabase
      .from('generated_sites')
      .update({ deploy_status: 'superseded' })
      .eq('id', existingSite.id)

    // Create new versioned record
    const { data: inserted, error: insertError } = await supabase
      .from('generated_sites')
      .insert(sitePayload)
      .select('id')
      .single()
    if (insertError || !inserted) {
      throw new Error(`Failed to create generated site v${newVersion}: ${insertError?.message}`)
    }
    site = inserted
  } else {
    // Insert first version
    const { data: inserted, error: insertError } = await supabase
      .from('generated_sites')
      .insert(sitePayload)
      .select('id')
      .single()
    if (insertError || !inserted) {
      throw new Error(`Failed to create generated site: ${insertError?.message}`)
    }
    site = inserted
  }

  // Update business with generated_at timestamp
  await supabase
    .from('businesses')
    .update({ generated_at: new Date().toISOString() })
    .eq('id', businessId)

  // Log activity
  await supabase.from('activity_log').insert({
    business_id: businessId,
    event_type: 'site_generated',
    event_data: {
      site_id: site.id,
      theme_id: themeId,
      layout_variant: layoutVariant,
      service_pages_count: content.service_pages.length,
      faq_count: content.faq_page.questions.length,
      content_metadata: content.content_metadata,
    },
  })

  return { siteId: site.id, content }
}
