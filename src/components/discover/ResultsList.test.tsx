import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ResultsList } from './ResultsList'
import type { DiscoveryResult } from '@/lib/utils/types'

const mockResults: DiscoveryResult[] = [
  {
    place_id: 'ChIJ1',
    name: "Joe's Plumbing",
    formatted_address: '123 Main St',
    geometry: { lat: 30.27, lng: -97.74 },
    rating: 4.5,
    user_ratings_total: 127,
    types: ['plumber'],
    website_status: 'none',
    already_in_pipeline: false,
  },
  {
    place_id: 'ChIJ2',
    name: "Bob's Electric",
    formatted_address: '456 Oak Ave',
    geometry: { lat: 30.28, lng: -97.75 },
    rating: 4.0,
    user_ratings_total: 45,
    types: ['electrician'],
    website_status: 'dead',
    already_in_pipeline: false,
  },
  {
    place_id: 'ChIJ3',
    name: 'Existing Biz',
    formatted_address: '789 Elm St',
    geometry: { lat: 30.29, lng: -97.76 },
    types: ['plumber'],
    website_status: 'parked',
    already_in_pipeline: true,
  },
]

describe('ResultsList', () => {
  it('renders loading skeletons when loading', () => {
    const { container } = render(
      <ResultsList
        results={[]}
        selectedIds={new Set()}
        onToggleSelect={vi.fn()}
        onSelectAll={vi.fn()}
        isLoading={true}
      />
    )
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(6) // header + 5 skeletons
  })

  it('renders empty state when no results', () => {
    render(
      <ResultsList
        results={[]}
        selectedIds={new Set()}
        onToggleSelect={vi.fn()}
        onSelectAll={vi.fn()}
        isLoading={false}
      />
    )
    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('renders result count and cards', () => {
    render(
      <ResultsList
        results={mockResults}
        selectedIds={new Set()}
        onToggleSelect={vi.fn()}
        onSelectAll={vi.fn()}
        isLoading={false}
      />
    )
    expect(screen.getByText('3 businesses found')).toBeInTheDocument()
    expect(screen.getByText("Joe's Plumbing")).toBeInTheDocument()
    expect(screen.getByText("Bob's Electric")).toBeInTheDocument()
    expect(screen.getByText('Existing Biz')).toBeInTheDocument()
  })

  it('shows "Select all" with selectable count (excludes pipeline items)', () => {
    render(
      <ResultsList
        results={mockResults}
        selectedIds={new Set()}
        onToggleSelect={vi.fn()}
        onSelectAll={vi.fn()}
        isLoading={false}
      />
    )
    expect(screen.getByText('Select all (2)')).toBeInTheDocument()
  })

  it('calls onSelectAll when select all is clicked', () => {
    const onSelectAll = vi.fn()
    render(
      <ResultsList
        results={mockResults}
        selectedIds={new Set()}
        onToggleSelect={vi.fn()}
        onSelectAll={onSelectAll}
        isLoading={false}
      />
    )
    fireEvent.click(screen.getByText('Select all (2)'))
    expect(onSelectAll).toHaveBeenCalled()
  })

  it('shows "Deselect all" when all selectable are selected', () => {
    render(
      <ResultsList
        results={mockResults}
        selectedIds={new Set(['ChIJ1', 'ChIJ2'])}
        onToggleSelect={vi.fn()}
        onSelectAll={vi.fn()}
        isLoading={false}
      />
    )
    expect(screen.getByText('Deselect all')).toBeInTheDocument()
  })
})
