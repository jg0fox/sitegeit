import { getAdminClient } from '@/lib/supabase/admin'
import { generateJSON } from './client'
import {
  SITE_GENERATION_SYSTEM_PROMPT,
  buildSiteGenerationPrompt,
  type SiteContentOutput,
} from './prompts/site-generation'
import { getThemeForCategory, getThemeId, getLayoutForCategory, themeConfigToCSSVars } from '@/lib/themes'

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
  const themeId = getThemeId(categorySlug)
  const layoutVariant = getLayoutForCategory(categorySlug)
  const themeConfig = getThemeForCategory(categorySlug)

  // Build enriched profile JSON for the prompt
  const enrichedProfile = {
    name: business.name,
    category: business.category,
    address: {
      street: business.address_street,
      city: business.address_city,
      state: business.address_state,
      zip: business.address_zip,
    },
    phone: business.phone,
    email: business.email,
    google_rating: business.google_rating,
    google_review_count: business.google_review_count,
    hours: business.hours,
    brand_voice: business.brand_voice,
    brand_colors: business.brand_colors,
    value_proposition: business.value_proposition,
    services: business.services,
    service_area: business.service_area,
    target_audience: business.target_audience,
    review_sentiment: business.review_sentiment,
    owner_name: business.owner_name,
  }

  const userPrompt = buildSiteGenerationPrompt({
    enriched_profile_json: JSON.stringify(enrichedProfile, null, 2),
    theme_id: themeId,
    layout_variant: layoutVariant,
  })

  const content = await generateJSON<SiteContentOutput>(SITE_GENERATION_SYSTEM_PROMPT, userPrompt)

  // Generate slug for the site URL
  const slug = business.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  // Create generated_sites record
  const { data: site, error: insertError } = await supabase
    .from('generated_sites')
    .insert({
      business_id: businessId,
      theme_id: themeId,
      layout_variant: layoutVariant,
      theme_config: { ...themeConfig, cssVars: themeConfigToCSSVars(themeConfig) },
      homepage_content: content.homepage,
      service_pages: content.service_pages,
      about_content: content.about_page,
      contact_content: content.contact_page,
      faq_content: content.faq_page,
      seo_meta: content.seo,
      deploy_url: `${slug}.sitegeit.com`,
      deploy_status: 'pending',
    })
    .select('id')
    .single()

  if (insertError || !site) {
    throw new Error(`Failed to create generated site: ${insertError?.message}`)
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
    },
  })

  return { siteId: site.id, content }
}
