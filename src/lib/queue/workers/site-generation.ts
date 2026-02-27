import { Worker, type Job } from 'bullmq'
import { getRedisConnection } from '../connection'
import { deploymentQueue } from '../queues'
import { generateSite } from '@/lib/ai/generate-site'

interface SiteGenerationJobData {
  businessId: string
}

export function createSiteGenerationWorker() {
  const worker = new Worker<SiteGenerationJobData>(
    'site-generation',
    async (job: Job<SiteGenerationJobData>) => {
      const { businessId } = job.data
      console.log(`[site-generation] Processing business ${businessId}`)

      const { siteId, content } = await generateSite(businessId)

      // Queue deployment
      await deploymentQueue.add('deploy-site', { businessId, siteId }, {
        jobId: `deploy-${businessId}`,
      })

      console.log(`[site-generation] Completed business ${businessId}, site ${siteId}, queued deployment`)
      return {
        businessId,
        siteId,
        servicePages: content.service_pages.length,
        faqQuestions: content.faq_page.questions.length,
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: 2,
    }
  )

  worker.on('failed', (job, err) => {
    console.error(`[site-generation] Job ${job?.id} failed:`, err.message)
  })

  return worker
}
