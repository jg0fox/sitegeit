import { Worker, type Job } from 'bullmq'
import { getRedisConnection } from '../connection'
import { emailGenerationQueue } from '../queues'
import { getAdminClient } from '@/lib/supabase/admin'

interface DeploymentJobData {
  businessId: string
  siteId: string
}

export function createDeploymentWorker() {
  const worker = new Worker<DeploymentJobData>(
    'deployment',
    async (job: Job<DeploymentJobData>) => {
      const { businessId, siteId } = job.data
      console.log(`[deployment] Processing site ${siteId} for business ${businessId}`)

      const supabase = getAdminClient()

      // For MVP, "deployment" means setting the site as live
      // since all sites are rendered dynamically via subdomain routing.
      // The deploy_url was already set during site generation.
      const { data: site, error: fetchError } = await supabase
        .from('generated_sites')
        .select('deploy_url')
        .eq('id', siteId)
        .single()

      if (fetchError || !site) {
        throw new Error(`Failed to fetch site ${siteId}: ${fetchError?.message}`)
      }

      // Mark site as live
      await supabase
        .from('generated_sites')
        .update({ deploy_status: 'live' })
        .eq('id', siteId)

      // Queue email generation
      await emailGenerationQueue.add('generate-email', { businessId, siteId }, {
        jobId: `email-gen-${businessId}`,
      })

      console.log(`[deployment] Site ${siteId} is live at ${site.deploy_url}, queued email generation`)
      return { businessId, siteId, deployUrl: site.deploy_url }
    },
    {
      connection: getRedisConnection(),
      concurrency: 5,
    }
  )

  worker.on('failed', (job, err) => {
    console.error(`[deployment] Job ${job?.id} failed:`, err.message)
  })

  return worker
}
