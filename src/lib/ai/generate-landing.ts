import { getAdminClient } from '@/lib/supabase/admin'
import { generateJSON } from './client'
import {
  LANDING_PAGE_SYSTEM_PROMPT,
  buildLandingPagePrompt,
  type LandingPageOutput,
} from './prompts/landing-page'

export async function generateLandingPage(
  businessId: string,
  siteId: string
): Promise<{ landingPageId: string; content: LandingPageOutput }> {
  const supabase = getAdminClient()

  // Fetch business and site data
  const [businessResult, siteResult] = await Promise.all([
    supabase.from('businesses').select('*').eq('id', businessId).single(),
    supabase.from('generated_sites').select('*').eq('id', siteId).single(),
  ])

  if (businessResult.error || !businessResult.data) {
    throw new Error(`Failed to fetch business ${businessId}: ${businessResult.error?.message}`)
  }
  if (siteResult.error || !siteResult.data) {
    throw new Error(`Failed to fetch site ${siteId}: ${siteResult.error?.message}`)
  }

  const business = businessResult.data
  const site = siteResult.data

  // Fetch user's calendly link
  const { data: user } = await supabase
    .from('users')
    .select('calendly_link')
    .eq('id', business.user_id)
    .single()

  const calendlyUrl = user?.calendly_link || 'https://calendly.com'

  const servicePages = (site.service_pages as { slug: string }[]) || []

  const userPrompt = buildLandingPagePrompt({
    business_name: business.name,
    category: business.category,
    city: business.address_city || '',
    state: business.address_state || '',
    rating: business.google_rating,
    review_count: business.google_review_count,
    website_status: business.website_status || 'none',
    preview_site_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://seitgeit.vercel.app'}/sites/${site.deploy_url}`,
    theme_id: site.theme_id,
    services_count: servicePages.length,
    calendly_url: calendlyUrl,
  })

  const content = await generateJSON<LandingPageOutput>(LANDING_PAGE_SYSTEM_PROMPT, userPrompt)

  // Generate slug for landing page URL
  const slug = business.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  // Upsert landing_pages record (idempotent — retries update instead of duplicating)
  const lpPayload = {
    business_id: businessId,
    site_id: siteId,
    headline: content.headline,
    strategy_summary: content.strategy_section.heading,
    site_preview_data: content,
    deploy_url: slug,
    deploy_status: 'live',
    calendly_link: calendlyUrl,
  }

  const { data: existingLP } = await supabase
    .from('landing_pages')
    .select('id')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  let landingPage: { id: string }
  if (existingLP) {
    const { data: updated, error: updateError } = await supabase
      .from('landing_pages')
      .update(lpPayload)
      .eq('id', existingLP.id)
      .select('id')
      .single()
    if (updateError || !updated) {
      throw new Error(`Failed to update landing page: ${updateError?.message}`)
    }
    landingPage = updated
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from('landing_pages')
      .insert(lpPayload)
      .select('id')
      .single()
    if (insertError || !inserted) {
      throw new Error(`Failed to create landing page: ${insertError?.message}`)
    }
    landingPage = inserted
  }

  // Log activity
  await supabase.from('activity_log').insert({
    business_id: businessId,
    event_type: 'landing_page_generated',
    event_data: {
      landing_page_id: landingPage.id,
      site_id: siteId,
    },
  })

  return { landingPageId: landingPage.id, content }
}
