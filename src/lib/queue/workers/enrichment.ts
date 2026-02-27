import { Worker, type Job } from 'bullmq'
import { getRedisConnection } from '../connection'
import { siteGenerationQueue } from '../queues'
import { enrichBusiness } from '@/lib/ai/enrich'

interface EnrichmentJobData {
  businessId: string
}

export function createEnrichmentWorker() {
  const worker = new Worker<EnrichmentJobData>(
    'enrichment',
    async (job: Job<EnrichmentJobData>) => {
      const { businessId } = job.data
      console.log(`[enrichment] Processing business ${businessId}`)

      const result = await enrichBusiness(businessId)

      // Queue site generation
      await siteGenerationQueue.add('generate-site', { businessId }, {
        jobId: `site-gen-${businessId}`,
      })

      console.log(`[enrichment] Completed business ${businessId}, queued site generation`)
      return { businessId, voiceArchetype: result.voice_archetype }
    },
    {
      connection: getRedisConnection(),
      concurrency: 2,
    }
  )

  worker.on('failed', (job, err) => {
    console.error(`[enrichment] Job ${job?.id} failed:`, err.message)
  })

  return worker
}
