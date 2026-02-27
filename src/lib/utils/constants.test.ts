import { describe, it, expect } from 'vitest'
import { PIPELINE_STAGES, DASHBOARD_STAGES, SERVICE_TIERS, NAV_ITEMS } from './constants'

describe('constants', () => {
  it('PIPELINE_STAGES has all expected stages', () => {
    expect(PIPELINE_STAGES.length).toBe(15)
    expect(PIPELINE_STAGES[0].key).toBe('discovered')
    expect(PIPELINE_STAGES[PIPELINE_STAGES.length - 1].key).toBe('archived')
  })

  it('DASHBOARD_STAGES is a subset of pipeline stages', () => {
    expect(DASHBOARD_STAGES.length).toBe(7)
    DASHBOARD_STAGES.forEach((stage) => {
      expect(PIPELINE_STAGES.find((s) => s.key === stage.key)).toBeDefined()
    })
  })

  it('SERVICE_TIERS has 4 tiers with correct prices', () => {
    expect(SERVICE_TIERS.length).toBe(4)
    expect(SERVICE_TIERS[0]).toEqual({
      key: 'starter',
      label: 'Starter',
      price: 2500,
      priceDisplay: '$25/mo',
    })
    expect(SERVICE_TIERS[3].key).toBe('premium')
  })

  it('NAV_ITEMS has 5 sections', () => {
    expect(NAV_ITEMS.length).toBe(5)
    expect(NAV_ITEMS.map((n) => n.key)).toEqual([
      'dashboard',
      'discover',
      'pipeline',
      'clients',
      'settings',
    ])
  })

  it('all NAV_ITEMS have required fields', () => {
    NAV_ITEMS.forEach((item) => {
      expect(item.label).toBeTruthy()
      expect(item.href).toBeTruthy()
      expect(item.icon).toBeTruthy()
    })
  })
})
