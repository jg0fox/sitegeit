/**
 * Instantly.ai API v2 Client
 *
 * Wraps the Instantly email sending platform API for:
 * - Sending outreach emails
 * - Managing sending accounts
 * - Querying warmup and health status
 *
 * Auth: Bearer token via INSTANTLY_API_KEY env var.
 * Docs: https://developer.instantly.ai/api
 */

const BASE_URL = 'https://api.instantly.ai/api/v2'

function getApiKey(): string {
  const key = process.env.INSTANTLY_API_KEY
  if (!key) throw new Error('INSTANTLY_API_KEY is not configured')
  return key
}

async function instantlyFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const { method = 'GET', body } = options
  const url = `${BASE_URL}${path}`

  const headers: Record<string, string> = {
    Authorization: `Bearer ${getApiKey()}`,
    'Content-Type': 'application/json',
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    // Retry once on 5xx
    if (res.status >= 500) {
      const retry = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!retry.ok) {
        const text = await retry.text().catch(() => '')
        throw new Error(`Instantly API ${method} ${path} failed (${retry.status}): ${text}`)
      }
      return retry.json() as Promise<T>
    }
    const text = await res.text().catch(() => '')
    throw new Error(`Instantly API ${method} ${path} failed (${res.status}): ${text}`)
  }

  return res.json() as Promise<T>
}

// ── Types ──────────────────────────────────────────────

/** V2 paginated response wrapper */
interface PaginatedResponse<T> {
  items: T[]
  next_starting_after?: string | null
}

export interface InstantlyAccount {
  email: string
  first_name?: string
  last_name?: string
  timestamp_created?: string
  timestamp_updated?: string
  warmup?: {
    limit?: number
    advanced?: Record<string, unknown>
  }
  provider_code?: number
  setup_pending?: boolean
  stat_warmup_score?: number
  sending_gap?: number
  status?: number
  daily_limit?: number
}

export interface InstantlyEmailParams {
  from_email: string
  to: string
  subject: string
  body: string
  reply_to_message_id?: string
}

export interface InstantlySendResult {
  id: string
  message_id?: string
  status: string
}

export interface InstantlyWarmupAnalytics {
  email: string
  health_score?: number
  sent?: number
  landed_inbox?: number
  landed_spam?: number
  received?: number
}

export interface InstantlyCampaignAnalytics {
  total_sent: number
  total_opened: number
  total_clicked: number
  total_replied: number
  total_bounced: number
}

// ── API Methods ────────────────────────────────────────

/**
 * List all sending accounts connected to Instantly.
 * V2 returns paginated { items: [...], next_starting_after }
 */
export async function listAccounts(): Promise<InstantlyAccount[]> {
  const allAccounts: InstantlyAccount[] = []
  let cursor: string | undefined

  // Paginate through all accounts
  for (let page = 0; page < 20; page++) {
    const params = new URLSearchParams({ limit: '100' })
    if (cursor) params.set('starting_after', cursor)

    const response = await instantlyFetch<PaginatedResponse<InstantlyAccount>>(
      `/accounts?${params}`
    )

    if (response.items && Array.isArray(response.items)) {
      allAccounts.push(...response.items)
    }

    if (!response.next_starting_after) break
    cursor = response.next_starting_after
  }

  return allAccounts
}

/**
 * Get a single account's details.
 */
export async function getAccount(email: string): Promise<InstantlyAccount> {
  return instantlyFetch<InstantlyAccount>(`/accounts/${encodeURIComponent(email)}`)
}

/**
 * Get warmup analytics for accounts.
 * V2 endpoint: POST /accounts/warmup-analytics with { emails: [...] }
 */
export async function getAccountWarmup(email: string): Promise<InstantlyWarmupAnalytics | null> {
  try {
    const response = await instantlyFetch<InstantlyWarmupAnalytics[]>(
      '/accounts/warmup-analytics',
      { method: 'POST', body: { emails: [email] } }
    )
    return Array.isArray(response) && response.length > 0 ? response[0] : null
  } catch {
    return null
  }
}

/**
 * Send an email via Instantly.
 */
export async function sendEmail(params: InstantlyEmailParams): Promise<InstantlySendResult> {
  return instantlyFetch<InstantlySendResult>('/emails/send', {
    method: 'POST',
    body: params,
  })
}

/**
 * Get campaign analytics.
 */
export async function getCampaignAnalytics(campaignId: string): Promise<InstantlyCampaignAnalytics> {
  return instantlyFetch<InstantlyCampaignAnalytics>(`/campaigns/${campaignId}/analytics`)
}

/**
 * Verify an Instantly webhook signature.
 * Instantly signs webhooks with HMAC-SHA256 using the webhook secret.
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string
): Promise<boolean> {
  const secret = process.env.INSTANTLY_WEBHOOK_SECRET
  if (!secret) {
    console.warn('[instantly] INSTANTLY_WEBHOOK_SECRET not configured, skipping verification')
    return true
  }

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const computed = Buffer.from(sig).toString('hex')

  return computed === signature
}
