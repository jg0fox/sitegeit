import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders the correct label for a known status', () => {
    render(<StatusBadge status="discovered" />)
    expect(screen.getByText('Discovered')).toBeInTheDocument()
  })

  it('renders the correct label for review_ready', () => {
    render(<StatusBadge status="review_ready" />)
    expect(screen.getByText('Ready for Review')).toBeInTheDocument()
  })

  it('renders the raw status for unknown values', () => {
    render(<StatusBadge status="unknown_status" />)
    expect(screen.getByText('unknown_status')).toBeInTheDocument()
  })
})
