import { Client, Receiver } from '@upstash/qstash'

let qstashClient: Client | null = null
let qstashReceiver: Receiver | null = null

export function getQStashClient(): Client {
  if (!qstashClient) {
    const token = process.env.QSTASH_TOKEN
    if (!token) {
      throw new Error('QSTASH_TOKEN is not configured')
    }
    qstashClient = new Client({ token })
  }
  return qstashClient
}

export function getQStashReceiver(): Receiver {
  if (!qstashReceiver) {
    const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY
    const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY
    if (!currentSigningKey || !nextSigningKey) {
      throw new Error('QSTASH signing keys are not configured')
    }
    qstashReceiver = new Receiver({ currentSigningKey, nextSigningKey })
  }
  return qstashReceiver
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function publishToWorker(
  route: string,
  data: Record<string, unknown>,
  options?: { retries?: number; delay?: number }
) {
  const client = getQStashClient()
  const url = `${getBaseUrl()}/api/workers/${route}`

  const result = await client.publishJSON({
    url,
    body: data,
    retries: options?.retries ?? 3,
    ...(options?.delay ? { delay: options.delay } : {}),
  })

  return (result as { messageId: string }).messageId
}

export async function verifyRequest(request: Request): Promise<Record<string, unknown>> {
  const receiver = getQStashReceiver()
  const body = await request.text()

  // In development, skip signature verification
  if (process.env.NODE_ENV === 'development') {
    return JSON.parse(body)
  }

  const signature = request.headers.get('upstash-signature')
  if (!signature) {
    throw new Error('Missing upstash-signature header')
  }

  const isValid = await receiver.verify({
    signature,
    body,
  })

  if (!isValid) {
    throw new Error('Invalid QStash signature')
  }

  return JSON.parse(body)
}
