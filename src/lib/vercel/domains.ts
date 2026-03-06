const VERCEL_TOKEN = process.env.VERCEL_TOKEN
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID

const BASE_URL = 'https://api.vercel.com'

function headers() {
  return {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

function teamQuery() {
  return VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''
}

export async function addDomainToProject(domain: string): Promise<{ success: boolean; error?: string }> {
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
    console.warn('[vercel/domains] Missing VERCEL_TOKEN or VERCEL_PROJECT_ID — skipping domain add')
    return { success: false, error: 'Vercel credentials not configured' }
  }

  const res = await fetch(
    `${BASE_URL}/v10/projects/${VERCEL_PROJECT_ID}/domains${teamQuery()}`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ name: domain }),
    }
  )

  if (!res.ok) {
    const data = await res.json()
    return { success: false, error: data.error?.message || `HTTP ${res.status}` }
  }

  return { success: true }
}

export async function removeDomainFromProject(domain: string): Promise<{ success: boolean; error?: string }> {
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
    console.warn('[vercel/domains] Missing VERCEL_TOKEN or VERCEL_PROJECT_ID — skipping domain remove')
    return { success: false, error: 'Vercel credentials not configured' }
  }

  const res = await fetch(
    `${BASE_URL}/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}${teamQuery()}`,
    {
      method: 'DELETE',
      headers: headers(),
    }
  )

  if (!res.ok) {
    const data = await res.json()
    return { success: false, error: data.error?.message || `HTTP ${res.status}` }
  }

  return { success: true }
}

export async function checkDomainConfig(domain: string): Promise<{
  configured: boolean
  verified: boolean
  error?: string
}> {
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
    return { configured: false, verified: false, error: 'Vercel credentials not configured' }
  }

  const res = await fetch(
    `${BASE_URL}/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}${teamQuery()}`,
    {
      method: 'GET',
      headers: headers(),
    }
  )

  if (!res.ok) {
    return { configured: false, verified: false, error: `HTTP ${res.status}` }
  }

  const data = await res.json()
  return {
    configured: true,
    verified: data.verified === true,
  }
}
