'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BUSINESS_CATEGORIES } from '@/lib/utils/constants'
import type { SearchParams, SearchFilters, WebsiteStatus } from '@/lib/utils/types'

interface SearchFormProps {
  onSearch: (params: SearchParams) => void
  isLoading: boolean
  initialValues?: Partial<SearchParams>
}

const RATING_OPTIONS = [
  { label: 'Any rating', value: 0 },
  { label: '3+ stars', value: 3 },
  { label: '4+ stars', value: 4 },
  { label: '4.5+ stars', value: 4.5 },
]

const REVIEW_OPTIONS = [
  { label: 'Any reviews', value: 0 },
  { label: '5+ reviews', value: 5 },
  { label: '10+ reviews', value: 10 },
  { label: '25+ reviews', value: 25 },
  { label: '50+ reviews', value: 50 },
]

const WEB_STATUS_FILTER_OPTIONS: { label: string; value: WebsiteStatus }[] = [
  { label: 'No website', value: 'none' },
  { label: 'Dead link', value: 'dead' },
  { label: 'Parked domain', value: 'parked' },
  { label: 'Social only', value: 'social_only' },
  { label: 'Outdated site', value: 'outdated' },
]

function kmToMiles(km: number) {
  return Math.round(km / 1.60934)
}

function milesToKm(miles: number) {
  return Math.round(miles * 1.60934)
}

export function SearchForm({ onSearch, isLoading, initialValues }: SearchFormProps) {
  const [region, setRegion] = useState(initialValues?.region || '')
  const [category, setCategory] = useState(initialValues?.category || '')
  const [radiusMiles, setRadiusMiles] = useState(
    initialValues?.radius_km ? kmToMiles(initialValues.radius_km) : 6
  )
  const [filters, setFilters] = useState<SearchFilters>(
    initialValues?.filters || {}
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!region.trim() || !category) return

    onSearch({
      region: region.trim(),
      category,
      radius_km: milesToKm(radiusMiles),
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    })
  }

  const handleWebStatusToggle = (status: WebsiteStatus) => {
    setFilters((prev) => {
      const current = prev.website_status || []
      const next = current.includes(status)
        ? current.filter((s) => s !== status)
        : [...current, status]
      return { ...prev, website_status: next.length > 0 ? next : undefined }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Region input */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-gray-400">
            location_on
          </span>
          <input
            type="text"
            placeholder="City, state or zip code"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="h-10 w-full rounded-md border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Category select */}
        <div className="relative sm:w-56">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-gray-400">
            category
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 w-full appearance-none rounded-md border border-gray-200 bg-white pl-10 pr-8 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select category</option>
            {BUSINESS_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[20px] text-gray-400">
            expand_more
          </span>
        </div>

        {/* Search button */}
        <Button type="submit" disabled={isLoading || !region.trim() || !category}>
          {isLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]">
                progress_activity
              </span>
              Searching...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">
                search
              </span>
              Search businesses
            </>
          )}
        </Button>
      </div>

      {/* Radius slider */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-500">Radius:</label>
        <input
          type="range"
          min={1}
          max={30}
          value={radiusMiles}
          onChange={(e) => setRadiusMiles(Number(e.target.value))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200 accent-primary"
        />
        <span className="w-14 text-right text-sm font-medium text-gray-700">
          {radiusMiles} mi
        </span>
      </div>

      {/* Filters — always visible */}
      <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Min rating */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">
            Minimum rating
          </label>
          <select
            value={filters.min_rating || 0}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                min_rating: Number(e.target.value) || undefined,
              }))
            }
            className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"
          >
            {RATING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Min reviews */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">
            Minimum reviews
          </label>
          <select
            value={filters.min_reviews || 0}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                min_reviews: Number(e.target.value) || undefined,
              }))
            }
            className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"
          >
            {REVIEW_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Website status checkboxes */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">
            Website status
          </label>
          <div className="space-y-1.5">
            {WEB_STATUS_FILTER_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={filters.website_status?.includes(opt.value) || false}
                  onChange={() => handleWebStatusToggle(opt.value)}
                  className="h-4 w-4 rounded border-gray-300 text-primary accent-primary"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Has phone */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">
            Contact info
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={filters.has_phone || false}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  has_phone: e.target.checked || undefined,
                }))
              }
              className="h-4 w-4 rounded border-gray-300 text-primary accent-primary"
            />
            Has phone number
          </label>
        </div>
      </div>
    </form>
  )
}
