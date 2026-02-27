import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ResultCard } from './ResultCard'
import type { DiscoveryResult } from '@/lib/utils/types'

const mockResult: DiscoveryResult = {
  place_id: 'ChIJ123',
  name: "Joe's Plumbing",
  formatted_address: '123 Main St, Austin, TX 78701',
  geometry: { lat: 30.27, lng: -97.74 },
  rating: 4.5,
  user_ratings_total: 127,
  business_status: 'OPERATIONAL',
  types: ['plumber'],
  formatted_phone_number: '(512) 555-0123',
  website: 'https://joesplumbing.com',
  website_status: 'none',
  already_in_pipeline: false,
  opening_hours: {
    open_now: true,
    weekday_text: ['Monday: 8:00 AM – 5:00 PM'],
  },
}

describe('ResultCard', () => {
  it('renders business name and details', () => {
    render(
      <ResultCard
        result={mockResult}
        selected={false}
        onToggleSelect={vi.fn()}
      />
    )

    expect(screen.getByText("Joe's Plumbing")).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('(127)')).toBeInTheDocument()
    expect(screen.getByText('(512) 555-0123')).toBeInTheDocument()
    expect(screen.getByText('No website')).toBeInTheDocument()
  })

  it('calls onToggleSelect when checkbox is clicked', () => {
    const onToggle = vi.fn()
    render(
      <ResultCard
        result={mockResult}
        selected={false}
        onToggleSelect={onToggle}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    expect(onToggle).toHaveBeenCalledWith('ChIJ123')
  })

  it('shows "Already in pipeline" badge when applicable', () => {
    render(
      <ResultCard
        result={{ ...mockResult, already_in_pipeline: true }}
        selected={false}
        onToggleSelect={vi.fn()}
      />
    )

    expect(screen.getByText('Already in pipeline')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('expands to show details on click', () => {
    render(
      <ResultCard
        result={mockResult}
        selected={false}
        onToggleSelect={vi.fn()}
      />
    )

    // Hours not visible initially
    expect(
      screen.queryByText('Monday: 8:00 AM – 5:00 PM')
    ).not.toBeInTheDocument()

    // Click the business name to expand
    fireEvent.click(screen.getByText("Joe's Plumbing"))

    // Now hours should be visible
    expect(
      screen.getByText('Monday: 8:00 AM – 5:00 PM')
    ).toBeInTheDocument()
    expect(screen.getByText('View on Google Maps')).toBeInTheDocument()
  })

  it('shows selected state with ring', () => {
    const { container } = render(
      <ResultCard
        result={mockResult}
        selected={true}
        onToggleSelect={vi.fn()}
      />
    )

    const card = container.querySelector('.ring-2')
    expect(card).toBeInTheDocument()
  })
})
