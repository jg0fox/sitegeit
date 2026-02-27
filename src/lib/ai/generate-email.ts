import { getAdminClient } from '@/lib/supabase/admin'
import { generateJSON } from './client'
import {
  EMAIL_SYSTEM_PROMPT,
  buildEmailPrompt,
  type EmailOutput,
} from './prompts/email'

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

  // Fetch user info for sender details
  const { data: user } = await supabase
    .from('users')
    .select('full_name, email, calendly_link')
    .eq('id', business.user_id)
    .single()

  const senderName = user?.full_name || 'The Sitegeit Team'
  const calendlyUrl = user?.calendly_link || 'https://calendly.com'

  // Get a unique detail for personalization
  const services = (business.services as string[]) || []
  const uniqueDetail =
    business.value_proposition ||
    (services.length > 0 ? `They offer ${services.slice(0, 3).join(', ')}` : `A ${business.category} in ${business.address_city}`)

  const userPrompt = buildEmailPrompt({
    business_name: business.name,
    owner_name: business.owner_name,
    category: business.category,
    city: business.address_city || '',
    rating: business.google_rating,
    review_count: business.google_review_count,
    unique_detail: uniqueDetail,
    landing_page_url: `https://${landingPage.deploy_url}`,
    sender_name: senderName,
    sender_company: 'Sitegeit',
    calendly_url: calendlyUrl,
  })

  const content = await generateJSON<EmailOutput>(EMAIL_SYSTEM_PROMPT, userPrompt)

  const emailIds: string[] = []

  // Create primary email
  const { data: primaryEmail, error: primaryError } = await supabase
    .from('outreach_emails')
    .insert({
      business_id: businessId,
      landing_page_id: landingPageId,
      subject: content.subject,
      body: content.body,
      review_status: 'draft',
      sequence_position: 1,
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
    },
  })

  return { emailIds, content }
}
