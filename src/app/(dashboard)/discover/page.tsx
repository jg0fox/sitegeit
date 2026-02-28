'use client'

import { useState, useEffect, useCallback } from 'react'
import { SearchForm } from '@/components/discover/SearchForm'
import { ResultsList } from '@/components/discover/ResultsList'
import { SavedSearches } from '@/components/discover/SavedSearches'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { DiscoveryResult, SearchParams, SavedSearch } from '@/lib/utils/types'

type Tab = 'search' | 'saved'

const STORAGE_KEY = 'sitegeit_discover_state'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

function loadCachedState(): { results: DiscoveryResult[]; params: SearchParams | null } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Check TTL
    if (parsed.cachedAt && Date.now() - parsed.cachedAt > CACHE_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function saveCachedState(results: DiscoveryResult[], params: SearchParams | null) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ results, params, cachedAt: Date.now() }))
  } catch {
    // Storage full or unavailable
  }
}

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<Tab>('search')
  const [results, setResults] = useState<DiscoveryResult[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [isSavedLoading, setIsSavedLoading] = useState(false)
  const [lastSearchParams, setLastSearchParams] = useState<SearchParams | null>(null)

  // Restore cached results on mount
  useEffect(() => {
    const cached = loadCachedState()
    if (cached && cached.results.length > 0) {
      setResults(cached.results)
      setLastSearchParams(cached.params)
      setHasSearched(true)
    }
  }, [])

  const loadSavedSearches = useCallback(async () => {
    setIsSavedLoading(true)
    try {
      const res = await fetch('/api/discover/saved-searches')
      if (res.ok) {
        const data = await res.json()
        setSavedSearches(data.searches || [])
      }
    } catch {
      // Silently fail — not critical
    } finally {
      setIsSavedLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSavedSearches()
  }, [loadSavedSearches])

  const handleSearch = async (params: SearchParams) => {
    setIsSearching(true)
    setHasSearched(true)
    setResults([])
    setSelectedIds(new Set())
    setLastSearchParams(params)

    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Search failed')
      }

      const data = await res.json()
      setResults(data.results)
      saveCachedState(data.results, params)

      // Auto-save the search
      await fetch('/api/discover/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          result_count: data.results.length,
        }),
      })

      // Refresh saved searches
      loadSavedSearches()

      if (data.results.length === 0) {
        toast.info('No businesses found matching your criteria.')
      } else {
        toast.success(
          `Found ${data.results.length} business${data.results.length !== 1 ? 'es' : ''} without active websites.`
        )
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed'
      toast.error(message)
    } finally {
      setIsSearching(false)
    }
  }

  const handleToggleSelect = (placeId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(placeId)) {
        next.delete(placeId)
      } else {
        next.add(placeId)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    const selectable = results.filter((r) => !r.already_in_pipeline)
    if (selectedIds.size === selectable.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(selectable.map((r) => r.place_id)))
    }
  }

  const handleAddToPipeline = async () => {
    if (selectedIds.size === 0 || !lastSearchParams) return

    setIsAdding(true)
    try {
      const selectedResults = results.filter((r) =>
        selectedIds.has(r.place_id)
      )

      const res = await fetch('/api/discover/add-to-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          results: selectedResults.map((r) => ({
            place_id: r.place_id,
            name: r.name,
            formatted_address: r.formatted_address,
            geometry: r.geometry,
            rating: r.rating,
            user_ratings_total: r.user_ratings_total,
            types: r.types,
            formatted_phone_number: r.formatted_phone_number,
            website: r.website,
            website_status: r.website_status,
          })),
          category: lastSearchParams.category,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to add to pipeline')
      }

      const data = await res.json()

      // Mark added results as already in pipeline
      setResults((prev) => {
        const updated = prev.map((r) =>
          selectedIds.has(r.place_id)
            ? { ...r, already_in_pipeline: true }
            : r
        )
        saveCachedState(updated, lastSearchParams)
        return updated
      })
      setSelectedIds(new Set())

      const parts = []
      if (data.added > 0) parts.push(`${data.added} added to pipeline`)
      if (data.skipped > 0) parts.push(`${data.skipped} already existed`)
      toast.success(parts.join(', '))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to add to pipeline'
      toast.error(message)
    } finally {
      setIsAdding(false)
    }
  }

  const handleRerunSearch = (params: SearchParams) => {
    setActiveTab('search')
    handleSearch(params)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          Find local businesses without websites and add them to your pipeline.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'search'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">
              search
            </span>
            Search
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'saved'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">
              history
            </span>
            Saved searches
            {savedSearches.length > 0 && (
              <span className="ml-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                {savedSearches.length}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <SearchForm
            onSearch={handleSearch}
            isLoading={isSearching}
            initialValues={lastSearchParams || undefined}
          />

          {hasSearched ? (
            <ResultsList
              results={results}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              isLoading={isSearching}
            />
          ) : (
            <EmptyState
              icon="travel_explore"
              title="No search results yet"
              description="Search for businesses by region and category to discover leads without websites."
            />
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <SavedSearches
          searches={savedSearches}
          onRerun={handleRerunSearch}
          isLoading={isSavedLoading}
        />
      )}

      {/* Sticky bottom bar for adding to pipeline */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-4 py-3 shadow-lg lg:left-64">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">
                {selectedIds.size}
              </span>{' '}
              business{selectedIds.size !== 1 ? 'es' : ''} selected
            </p>
            <Button onClick={handleAddToPipeline} disabled={isAdding}>
              {isAdding ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                  Adding...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    add
                  </span>
                  Add {selectedIds.size} to pipeline
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
