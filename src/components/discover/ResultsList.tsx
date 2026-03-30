'use client'

import { ResultCard } from './ResultCard'
import { EmptyState } from '@/components/shared/EmptyState'
import type { DiscoveryResult } from '@/lib/utils/types'

interface ResultsListProps {
  results: DiscoveryResult[]
  selectedIds: Set<string>
  onToggleSelect: (placeId: string) => void
  onSelectAll: () => void
  isLoading: boolean
  onSaveSearch?: () => void
  isSaving?: boolean
  isSaved?: boolean
  totalGoogleResults?: number
  totalWithActiveSites?: number
}

function ResultSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="mt-1 h-4 w-4 rounded bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <div className="h-5 w-40 rounded bg-gray-200" />
            <div className="h-5 w-24 rounded bg-gray-200" />
          </div>
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-4 w-64 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

export function ResultsList({
  results,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  isLoading,
  onSaveSearch,
  isSaving,
  isSaved,
  totalGoogleResults,
  totalWithActiveSites,
}: ResultsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <ResultSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <EmptyState
        icon="search_off"
        title="No results found"
        description="Try adjusting your search region, category, or filters."
      />
    )
  }

  const selectableCount = results.filter(
    (r) => !r.already_in_pipeline && r.website_status !== 'active'
  ).length
  const allSelected = selectableCount > 0 && selectedIds.size === selectableCount
  const withoutSites = results.filter((r) => r.website_status !== 'active').length

  return (
    <div className="space-y-3">
      {/* Filter breakdown */}
      {totalGoogleResults !== undefined && totalGoogleResults > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-gray-400">search</span>
            {totalGoogleResults} found on Google
          </span>
          <span className="h-3 w-px bg-gray-300" />
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-emerald-500">public_off</span>
            {withoutSites} without active site
          </span>
          {(totalWithActiveSites ?? 0) > 0 && (
            <>
              <span className="h-3 w-px bg-gray-300" />
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-blue-400">check_circle</span>
                {totalWithActiveSites} with active site
              </span>
            </>
          )}
          {results.length < (totalGoogleResults ?? 0) && (
            <>
              <span className="h-3 w-px bg-gray-300" />
              <span className="flex items-center gap-1 text-amber-600">
                <span className="material-symbols-outlined text-[14px]">filter_alt</span>
                {(totalGoogleResults ?? 0) - results.length} filtered out
              </span>
            </>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">
            {results.length} business{results.length !== 1 ? 'es' : ''} shown
          </p>
          {onSaveSearch && !isSaved && (
            <button
              type="button"
              onClick={onSaveSearch}
              disabled={isSaving}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[14px]">
                {isSaving ? 'progress_activity' : 'bookmark_add'}
              </span>
              {isSaving ? 'Saving...' : 'Save search'}
            </button>
          )}
          {isSaved && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Saved
            </span>
          )}
        </div>
        {selectableCount > 0 && (
          <button
            type="button"
            onClick={onSelectAll}
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            {allSelected ? 'Deselect all' : `Select all (${selectableCount})`}
          </button>
        )}
      </div>

      {/* Cards */}
      {results.map((result) => (
        <ResultCard
          key={result.place_id}
          result={result}
          selected={selectedIds.has(result.place_id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  )
}
