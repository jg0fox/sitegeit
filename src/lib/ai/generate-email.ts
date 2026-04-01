import { getAdminClient } from '@/lib/supabase/admin'
import { generateJSON } from './client'
import {
  EMAIL_SYSTEM_PROMPT,
  buildEmailPrompt,
  buildEmailSignature,
  type EmailOutput,
} from './prompts/email'
import { selectTemplateVariant } from './prompts/email-templates'
import { getLandingPageUrl } from '@/lib/utils/site-urls'

export async function generateEmail(
  businessId: string,
  landingPageId: string
): Promise<{ emailIds: string[]; content: EmailOutput }> {
  const supabase = getAdminClient()

  // Fetch business and landing page data
  const [businessResult, landingPageResult] = await Promise.all([
    supabase.from('businesses').select('*').eq('id', businessId).single(),
    supabase.from('landing_pages').select('*').eq('id', landingPageId).single(),
  ])

  if (businessResult.error || !businessResult.data) {
    throw new Error(`Failed to fetch business ${businessId}: ${businessResult.error?.message}`)
  }
  if (landingPageResult.error || !landingPageResult.data) {
    throw new Error(`Failed to fetch landing page ${landingPageId}: ${landingPageResult.error?.message}`)
  }

  const business = businessResult.data
  const landingPage = landingPageResult.data

  // Verify landing page is live
  if (landingPage.deploy_status !== 'live') {
    console.warn(`Landing page ${landingPageId} is not live (status: ${landingPage.deploy_status}), proceeding with URL anyway`)
  }

  // Fetch user info for sender details
  const { data: user } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', business.user_id)
    .single()

  const senderName = user?.full_name || 'Jason Fox'
  const senderCompany = 'Simple Instant Sites'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://goget.im'
  const landingPageUrl = getLandingPageUrl(landingPage.deploy_url)
  const bookingUrl = `${appUrl}/book?ref=${businessId}`

  // Get a unique detail for personalization
  const services = (business.services as string[]) || []
  const uniqueDetail =
    business.value_proposition ||
    (services.length > 0 ? `They offer ${services.slice(0, 3).join(', ')}` : `A ${business.category} in ${business.address_city}`)

  // Select template variant for A/B tracking
  const variant = selectTemplateVariant()

  const userPrompt = buildEmailPrompt({
    business_name: business.name,
    owner_name: business.owner_name,
    category: business.category,
    city: business.address_city || '',
    rating: business.google_rating,
    review_count: business.google_review_count,
    unique_detail: uniqueDetail,
    landing_page_url: landingPageUrl,
    sender_name: senderName,
    sender_company: senderCompany,
    booking_url: bookingUrl,
  })

  // Inject template variant instructions into the prompt
  const variantPrompt = `${userPrompt}\n\n## Template Approach\n${variant.promptInstructions}`

  const { getEffectivePrompt } = await import('./prompt-overrides')
  const systemPrompt = await getEffectivePrompt(business.user_id, 'email', EMAIL_SYSTEM_PROMPT)
  const content = await generateJSON<EmailOutput>(systemPrompt, variantPrompt)

  // Build signature and append to all email bodies
  const signature = buildEmailSignature(senderName, senderCompany)
  content.body = content.body + signature
  content.follow_up_1.body = content.follow_up_1.body + signature
  content.follow_up_2.body = content.follow_up_2.body + signature

  // Delete any existing draft emails for this business (idempotent — retries replace instead of duplicating)
  await supabase
    .from('outreach_emails')
    .delete()
    .eq('business_id', businessId)
    .eq('review_status', 'draft')

  const emailIds: string[] = []

  // Create primary email with template variant
  const { data: primaryEmail, error: primaryError } = await supabase
    .from('outreach_emails')
    .insert({
      business_id: businessId,
      landing_page_id: landingPageId,
      subject: content.subject,
      body: content.body,
      review_status: 'draft',
      sequence_position: 1,
      template_variant: variant.id,
    })
    .select('id')
    .single()

  if (primaryError || !primaryEmail) {
    throw new Error(`Failed to create primary email: ${primaryError?.message}`)
  }
  emailIds.push(primaryEmail.id)

  // Create follow-up 1
  const { data: followUp1, error: fu1Error } = await supabase
    .from('outreach_emails')
    .insert({
      business_id: businessId,
      landing_page_id: landingPageId,
      subject: content.follow_up_1.subject,
      body: content.follow_up_1.body,
      review_status: 'draft',
      sequence_position: 2,
      parent_email_id: primaryEmail.id,
      template_variant: variant.id,
    })
    .select('id')
    .single()

  if (fu1Error || !followUp1) {
    throw new Error(`Failed to create follow-up 1: ${fu1Error?.message}`)
  }
  emailIds.push(followUp1.id)

  // Create follow-up 2
  const { data: followUp2, error: fu2Error } = await supabase
    .from('outreach_emails')
    .insert({
      business_id: businessId,
      landing_page_id: landingPageId,
      subject: content.follow_up_2.subject,
      body: content.follow_up_2.body,
      review_status: 'draft',
      sequence_position: 3,
      parent_email_id: primaryEmail.id,
      template_variant: variant.id,
    })
    .select('id')
    .single()

  if (fu2Error || !followUp2) {
    throw new Error(`Failed to create follow-up 2: ${fu2Error?.message}`)
  }
  emailIds.push(followUp2.id)

  // Update business status to review_ready
  await supabase
    .from('businesses')
    .update({ status: 'review_ready' })
    .eq('id', businessId)

  // Log activity
  await supabase.from('activity_log').insert({
    business_id: businessId,
    event_type: 'email_drafted',
    event_data: {
      email_id: primaryEmail.id,
      landing_page_id: landingPageId,
      follow_up_count: 2,
      template_variant: variant.id,
    },
  })

  return { emailIds, content }
}
