import { createEnrichmentWorker } from '@/lib/queue/workers/enrichment'
import { createSiteGenerationWorker } from '@/lib/queue/workers/site-generation'
import { createDeploymentWorker } from '@/lib/queue/workers/deployment'
import { createEmailGenerationWorker } from '@/lib/queue/workers/email-generation'

console.log('[workers] Starting Sitegeit pipeline workers...')

const enrichmentWorker = createEnrichmentWorker()
const siteGenerationWorker = createSiteGenerationWorker()
const deploymentWorker = createDeploymentWorker()
const emailGenerationWorker = createEmailGenerationWorker()

console.log('[workers] All workers started')

// Graceful shutdown
async function shutdown() {
  console.log('[workers] Shutting down...')
  await Promise.all([
    enrichmentWorker.close(),
    siteGenerationWorker.close(),
    deploymentWorker.close(),
    emailGenerationWorker.close(),
  ])
  console.log('[workers] All workers stopped')
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
