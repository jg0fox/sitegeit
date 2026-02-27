import { Queue } from 'bullmq'
import { getRedisConnection } from './connection'

function createQueue(name: string) {
  return new Queue(name, {
    connection: getRedisConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    },
  })
}

export const enrichmentQueue = createQueue('enrichment')
export const siteGenerationQueue = createQueue('site-generation')
export const deploymentQueue = createQueue('deployment')
export const emailGenerationQueue = createQueue('email-generation')
