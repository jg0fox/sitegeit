'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WebStatusBadge } from './WebStatusBadge'
import { cn } from '@/lib/utils/cn'
import type { DiscoveryResult } from '@/lib/utils/types'

interface ResultCardProps {
  result: DiscoveryResult
  selected: boolean
  onToggleSelect: (placeId: string) => void
}

export function ResultCard({
  result,
  selected,
  onToggleSelect,
}: ResultCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isActive = result.website_status === 'active'
  const disabled = result.already_in_pipeline || isActive

  return (
    <Card
      className={cn(
        'transition-shadow',
        selected && 'ring-2 ring-primary ring-offset-1',
        isActive && 'opacity-50',
        result.already_in_pipeline && !isActive && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(result.place_id)}
          disabled={disabled}
          className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-primary accent-primary disabled:cursor-not-allowed"
        />

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-2">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-left font-semibold text-gray-900 hover:text-primary"
            >
              {result.name}
            </button>
            <WebStatusBadge status={result.website_status} />
            {result.already_in_pipeline && (
              <Badge variant="secondary">Already in pipeline</Badge>
            )}
            {isActive && !result.already_in_pipeline && (
              <Badge variant="secondary">Has website</Badge>
            )}
          </div>

          {/* Rating + reviews */}
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
            {result.rating !== undefined && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined filled text-[16px] text-amber-400">
                  star
                </span>
                {result.rating}
                {result.user_ratings_total !== undefined && (
                  <span className="text-gray-400">
                    ({result.user_ratings_total})
                  </span>
                )}
              </span>
            )}
            {result.formatted_phone_number && (
              <a
                href={`tel:${result.formatted_phone_number}`}
                className="flex items-center gap-1 hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="material-symbols-outlined text-[16px]">
                  phone
                </span>
                {result.formatted_phone_number}
              </a>
            )}
            {result.emails && result.emails.length > 0 && (
              <a
                href={`mailto:${result.emails[0]}`}
                className="flex items-center gap-1 hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="material-symbols-outlined text-[16px]">
                  mail
                </span>
                {result.emails[0]}
              </a>
            )}
          </div>

          {/* Address (truncated) */}
          <p className={cn('mt-1 text-sm text-gray-500', !expanded && 'truncate')}>
            {result.formatted_address}
          </p>

          {/* Expanded details */}
          {expanded && (
            <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
              {result.opening_hours?.weekday_text && (
                <div>
                  <p className="text-xs font-medium text-gray-600">Hours</p>
                  <div className="mt-1 space-y-0.5">
                    {result.opening_hours.weekday_text.map((line) => (
                      <p key={line} className="text-xs text-gray-500">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {result.website && (
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-gray-400">
                    language
                  </span>
                  <a
                    href={result.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {new URL(result.website).hostname}
                  </a>
                </div>
              )}

              <a
                href={`https://www.google.com/maps/place/?q=place_id:${result.place_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="material-symbols-outlined text-[16px]">
                  map
                </span>
                View on Google Maps
              </a>
            </div>
          )}
        </div>

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 text-gray-400 hover:text-gray-600"
        >
          <span className="material-symbols-outlined text-[20px]">
            {expanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </div>
    </Card>
  )
}
