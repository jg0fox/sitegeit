import { Worker, type Job } from 'bullmq'
import { getRedisConnection } from '../connection'
import { generateLandingPage } from '@/lib/ai/generate-landing'
import { generateEmail } from '@/lib/ai/generate-email'
import { getAdminClient } from '@/lib/supabase/admin'

interface EmailGenerationJobData {
  businessId: string
  siteId: string
}

export function createEmailGenerationWorker() {
  const worker = new Worker<EmailGenerationJobData>(
    'email-generation',
    async (job: Job<EmailGenerationJobData>) => {
      const { businessId, siteId } = job.data
      console.log(`[email-generation] Processing business ${businessId}`)

      // Step 1: Generate landing page
      const { landingPageId } = await generateLandingPage(businessId, siteId)
      console.log(`[email-generation] Landing page ${landingPageId} created`)

      // Step 2: Generate email drafts
      const { emailIds } = await generateEmail(businessId, landingPageId)
      console.log(`[email-generation] ${emailIds.length} email drafts created`)

      // Create notification for the user
      const supabase = getAdminClient()
      const { data: business } = await supabase
        .from('businesses')
        .select('user_id, name')
        .eq('id', businessId)
        .single()

      if (business?.user_id) {
        await supabase.from('notifications').insert({
          user_id: business.user_id,
          type: 'pipeline',
          title: 'Pipeline complete',
          body: `${business.name} is ready for review. Website generated, email draft ready.`,
          business_id: businessId,
          href: `/pipeline/${businessId}`,
        })
      }

      console.log(`[email-generation] Pipeline complete for business ${businessId}`)
      return { businessId, landingPageId, emailIds }
    },
    {
      connection: getRedisConnection(),
      concurrency: 2,
    }
  )

  worker.on('failed', (job, err) => {
    console.error(`[email-generation] Job ${job?.id} failed:`, err.message)
  })

  return worker
}
