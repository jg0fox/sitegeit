import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        icon="search"
        title="Nothing here"
        description="Start searching to see results."
      />
    )
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    expect(screen.getByText('Start searching to see results.')).toBeInTheDocument()
  })

  it('renders the icon', () => {
    render(
      <EmptyState icon="search" title="Test" description="Test desc" />
    )
    expect(screen.getByText('search')).toBeInTheDocument()
  })

  it('renders optional action', () => {
    render(
      <EmptyState
        icon="search"
        title="Test"
        description="Test"
        action={<button>Do something</button>}
      />
    )
    expect(screen.getByRole('button', { name: 'Do something' })).toBeInTheDocument()
  })

  it('does not render action when not provided', () => {
    render(
      <EmptyState icon="search" title="Test" description="Test" />
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
