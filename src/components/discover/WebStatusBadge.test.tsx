import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WebStatusBadge } from './WebStatusBadge'
import type { WebsiteStatus } from '@/lib/utils/types'

describe('WebStatusBadge', () => {
  const statuses: { status: WebsiteStatus; label: string }[] = [
    { status: 'none', label: 'No website' },
    { status: 'dead', label: 'Dead link' },
    { status: 'parked', label: 'Parked domain' },
    { status: 'social_only', label: 'Social only' },
    { status: 'outdated', label: 'Outdated site' },
    { status: 'active', label: 'Active site' },
  ]

  statuses.forEach(({ status, label }) => {
    it(`renders correct label for "${status}" status`, () => {
      render(<WebStatusBadge status={status} />)
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })
})
