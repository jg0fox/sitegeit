import Redis from 'ioredis'
import type { ConnectionOptions } from 'bullmq'

const REDIS_URL = process.env.UPSTASH_REDIS_URL

let connection: Redis | null = null

export function getRedisConnection(): ConnectionOptions {
  if (!connection) {
    if (!REDIS_URL) {
      throw new Error('UPSTASH_REDIS_URL is not configured')
    }
    connection = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    })
  }
  // Cast needed because ioredis and bullmq's bundled ioredis have
  // slightly different type definitions despite being compatible at runtime
  return connection as unknown as ConnectionOptions
}

export default getRedisConnection
