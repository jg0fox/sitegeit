import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase admin client
const mockSelect = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  getAdminClient: () => ({
    from: vi.fn().mockImplementation(() => ({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle,
        }),
      }),
      update: mockUpdate.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })),
  }),
}))

describe('vercel-deploy service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deploySite returns deploy URL and live status', async () => {
    mockSingle.mockResolvedValue({
      data: { deploy_url: 'joes-plumbing.sitegeit.com' },
      error: null,
    })

    const { deploySite } = await import('./vercel-deploy')
    const result = await deploySite('test-site-id')

    expect(result.deployUrl).toBe('joes-plumbing.sitegeit.com')
    expect(result.status).toBe('live')
  })

  it('deploySite throws on missing site', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
    })

    const { deploySite } = await import('./vercel-deploy')
    await expect(deploySite('bad-id')).rejects.toThrow('Failed to fetch site')
  })

  it('getDeployStatus returns current status', async () => {
    mockSingle.mockResolvedValue({
      data: { deploy_status: 'live' },
      error: null,
    })

    const { getDeployStatus } = await import('./vercel-deploy')
    const status = await getDeployStatus('test-site-id')
    expect(status).toBe('live')
  })

  it('getDeployStatus returns pending for missing site', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: null,
    })

    const { getDeployStatus } = await import('./vercel-deploy')
    const status = await getDeployStatus('missing-id')
    expect(status).toBe('pending')
  })
})
