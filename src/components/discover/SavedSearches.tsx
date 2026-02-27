'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { BUSINESS_CATEGORIES } from '@/lib/utils/constants'
import { formatDistanceToNow } from 'date-fns'
import type { SavedSearch, SearchParams } from '@/lib/utils/types'

interface SavedSearchesProps {
  searches: SavedSearch[]
  onRerun: (params: SearchParams) => void
  isLoading: boolean
}

export function SavedSearches({
  searches,
  onRerun,
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
        description="Your search history will appear here after you run your first search."
      />
    )
  }

  return (
    <div className="space-y-3">
      {searches.map((search) => {
        const categoryLabel =
          BUSINESS_CATEGORIES.find((c) => c.value === search.category)?.label ||
          search.category

        return (
          <Card key={search.id}>
            <CardContent className="flex items-center justify-between p-4">
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
                    <Badge variant="secondary">{search.radius_km} km</Badge>
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
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
