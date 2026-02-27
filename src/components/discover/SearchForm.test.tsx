import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchForm } from './SearchForm'

describe('SearchForm', () => {
  it('renders region input, category select, and search button', () => {
    render(<SearchForm onSearch={vi.fn()} isLoading={false} />)

    expect(
      screen.getByPlaceholderText('City, state or zip code')
    ).toBeInTheDocument()
    expect(screen.getByText('Select category')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /search businesses/i })
    ).toBeInTheDocument()
  })

  it('disables search button when fields are empty', () => {
    render(<SearchForm onSearch={vi.fn()} isLoading={false} />)
    const button = screen.getByRole('button', { name: /search businesses/i })
    expect(button).toBeDisabled()
  })

  it('shows loading state when isLoading is true', () => {
    render(<SearchForm onSearch={vi.fn()} isLoading={true} />)
    expect(screen.getByText('Searching...')).toBeInTheDocument()
  })

  it('calls onSearch with correct params on submit', () => {
    const onSearch = vi.fn()
    render(<SearchForm onSearch={onSearch} isLoading={false} />)

    // Fill in region
    const regionInput = screen.getByPlaceholderText('City, state or zip code')
    fireEvent.change(regionInput, { target: { value: 'Austin, TX' } })

    // Fill in category
    const categorySelect = screen.getByDisplayValue('Select category')
    fireEvent.change(categorySelect, { target: { value: 'plumber' } })

    // Submit
    const button = screen.getByRole('button', { name: /search businesses/i })
    fireEvent.click(button)

    expect(onSearch).toHaveBeenCalledWith({
      region: 'Austin, TX',
      category: 'plumber',
      radius_km: 10,
      filters: undefined,
    })
  })

  it('toggles filter panel on click', () => {
    render(<SearchForm onSearch={vi.fn()} isLoading={false} />)

    // Filters should be hidden
    expect(screen.queryByText('Minimum rating')).not.toBeInTheDocument()

    // Click to show filters
    fireEvent.click(screen.getByText('Filters'))
    expect(screen.getByText('Minimum rating')).toBeInTheDocument()

    // Click to hide filters
    fireEvent.click(screen.getByText('Hide filters'))
    expect(screen.queryByText('Minimum rating')).not.toBeInTheDocument()
  })
})
