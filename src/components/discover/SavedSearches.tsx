'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { BUSINESS_CATEGORIES } from '@/lib/utils/constants'
import { formatDistanceToNow } from 'date-fns'
import type { SavedSearch, SearchParams, DiscoveryResult } from '@/lib/utils/types'

interface SavedSearchesProps {
  searches: SavedSearch[]
  onRerun: (params: SearchParams) => void
  onViewResults: (results: DiscoveryResult[], params: SearchParams) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

function kmToMiles(km: number) {
  return Math.round(km / 1.60934)
}

export function SavedSearches({
  searches,
  onRerun,
  onViewResults,
  onDelete,
  isLoading,
}: SavedSearchesProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="space-y-2">
              <div className="h-4 w-48 rounded bg-gray-200" />
              <div className="h-3 w-32 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (searches.length === 0) {
    return (
      <EmptyState
        icon="history"
        title="No saved searches"
        description="Save a search after running it to revisit results later."
      />
    )
  }

  return (
    <div className="space-y-3">
      {searches.map((search) => {
        const categoryLabel =
          BUSINESS_CATEGORIES.find((c) => c.value === search.category)?.label ||
          search.category

        const hasStoredResults = search.results && search.results.length > 0

        return (
          <Card key={search.id}>
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-gray-400">
                    travel_explore
                  </span>
                  <span className="font-medium text-gray-900">
                    {categoryLabel}
                  </span>
                  <span className="text-gray-400">in</span>
                  <span className="font-medium text-gray-900">
                    {search.region}
                  </span>
                  {search.radius_km && (
                    <Badge variant="secondary">{kmToMiles(search.radius_km)} mi</Badge>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                  {search.result_count !== null && (
                    <span>{search.result_count} results</span>
                  )}
                  {search.last_run_at && (
                    <span>
                      {formatDistanceToNow(new Date(search.last_run_at), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasStoredResults && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onViewResults(search.results!, {
                        region: search.region,
                        category: search.category,
                        radius_km: search.radius_km || 10,
                        filters: search.filters || undefined,
                      })
                    }
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      visibility
                    </span>
                    View results
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onRerun({
                      region: search.region,
                      category: search.category,
                      radius_km: search.radius_km || 10,
                      filters: search.filters || undefined,
                    })
                  }
                >
                  <span className="material-symbols-outlined text-[16px]">
                    replay
                  </span>
                  Re-run
                </Button>
                <button
                  onClick={() => onDelete(search.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Delete saved search"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
