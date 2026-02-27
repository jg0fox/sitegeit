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

  const selectableCount = results.filter((r) => !r.already_in_pipeline).length
  const allSelected = selectableCount > 0 && selectedIds.size === selectableCount

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {results.length} business{results.length !== 1 ? 'es' : ''} found
        </p>
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
