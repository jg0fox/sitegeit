'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TierBadge } from '@/components/shared/TierBadge'
import { CopyableId } from '@/components/shared/CopyableId'
import { PipelineActions } from '@/components/pipeline/PipelineActions'
import { PipelineProgress } from '@/components/pipeline/PipelineProgress'
import { PipelineBulkBar } from '@/components/pipeline/PipelineBulkBar'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { getSiteUrl, getSiteDisplayDomain, getLandingPageUrl } from '@/lib/utils/site-urls'

interface GeneratedSite {
  id: string
  deploy_url: string
  deploy_status: string
  custom_domain?: string | null
}

interface LandingPage {
  id: string
  deploy_url: string
  deploy_status: string
}

interface OutreachEmail {
  id: string
  review_status: string
  sequence_position: number
  open_count?: number
  click_count?: number
  replied_at?: string | null
}

export interface Business {
  id: string
  name: string
  category: string
  status: string
  phone: string | null
  address_city: string | null
  address_state: string | null
  google_rating: number | null
  google_review_count: number | null
  website_status: string | null
  created_at: string
  enriched_at: string | null
  tier?: string | null
  monthly_rate?: number | null
  converted_at?: string | null
  generated_sites: GeneratedSite[]
  landing_pages: LandingPage[]
  outreach_emails: OutreachEmail[]
}

export function BusinessesList({ businesses }: { businesses: Business[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const allSelected = businesses.length > 0 && selected.size === businesses.length
  const someSelected = selected.size > 0 && selected.size < businesses.length

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(businesses.map((b) => b.id)))
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function clearSelection() {
    setSelected(new Set())
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleAll}
          className="flex h-5 w-5 items-center justify-center rounded border border-gray-300 transition-colors hover:border-gray-400"
          aria-label={allSelected ? 'Deselect all' : 'Select all'}
        >
          {allSelected && (
            <span className="material-symbols-outlined text-[16px] text-primary">check</span>
          )}
          {someSelected && (
            <span className="block h-2 w-2 rounded-sm bg-primary" />
          )}
        </button>
        <p className="text-xs text-gray-400">
          {selected.size > 0
            ? `${selected.size} of ${businesses.length} selected`
            : `${businesses.length} business${businesses.length !== 1 ? 'es' : ''}`}
        </p>
      </div>

      {businesses.map((biz) => {
        const liveSite = biz.generated_sites?.find((s) => s.deploy_status === 'live')
        const liveLanding = biz.landing_pages?.find((lp) => lp.deploy_status === 'live')
        const draftEmails = biz.outreach_emails?.filter((e) => e.review_status === 'draft') ?? []
        const hasGeneratedMaterial = liveSite || liveLanding || draftEmails.length > 0

        const emails = biz.outreach_emails ?? []
        const totalOpens = emails.reduce((sum, e) => sum + (e.open_count ?? 0), 0)
        const totalClicks = emails.reduce((sum, e) => sum + (e.click_count ?? 0), 0)
        const hasReply = emails.some((e) => e.replied_at)
        const isHighIntent = totalOpens >= 3 || totalClicks >= 1
        const showEngagement = totalOpens > 0 || totalClicks > 0 || hasReply

        const isSelected = selected.has(biz.id)
        const isClient = ['active', 'churned', 'closed_won', 'closed_lost'].includes(biz.status)
        const domain = liveSite?.deploy_url ? getSiteDisplayDomain(liveSite.deploy_url, liveSite.custom_domain) : null

        return (
          <Card
            key={biz.id}
            className={`overflow-hidden transition-shadow ${
              isSelected ? 'ring-2 ring-primary ring-offset-1' : ''
            }`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <button
                    onClick={() => toggleOne(biz.id)}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    aria-label={isSelected ? `Deselect ${biz.name}` : `Select ${biz.name}`}
                  >
                    {isSelected && (
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/businesses/${biz.id}`}
                        className="truncate text-sm font-semibold text-gray-900 hover:text-primary"
                      >
                        {biz.name}
                      </Link>
                      <StatusBadge status={biz.status} />
                      {biz.tier && <TierBadge tier={biz.tier} />}
                      <CopyableId id={biz.id} />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      {biz.category && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">category</span>
                          {biz.category}
                        </span>
                      )}
                      {(biz.address_city || biz.address_state) && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          {[biz.address_city, biz.address_state].filter(Boolean).join(', ')}
                        </span>
                      )}
                      {biz.google_rating != null && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-amber-400">star</span>
                          {biz.google_rating}
                          {biz.google_review_count ? ` (${biz.google_review_count})` : ''}
                        </span>
                      )}
                      {biz.phone && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">phone</span>
                          {biz.phone}
                        </span>
                      )}
                      {biz.monthly_rate != null && biz.monthly_rate > 0 && (
                        <span className="flex items-center gap-1 font-medium text-gray-700">
                          <span className="material-symbols-outlined text-[14px]">payments</span>
                          ${biz.monthly_rate}/mo
                        </span>
                      )}
                      {isClient && domain && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">language</span>
                          {domain}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(biz.created_at), { addSuffix: true })}
                  </p>
                  <PipelineActions businessId={biz.id} businessName={biz.name} status={biz.status} />
                </div>
              </div>

              {showEngagement && (
                <div className="mt-2 flex flex-wrap items-center gap-2 pl-8">
                  {isHighIntent && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <span className="material-symbols-outlined text-[12px]">local_fire_department</span>
                      High intent
                    </span>
                  )}
                  {totalOpens > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                      <span className="material-symbols-outlined text-[14px] text-blue-500">visibility</span>
                      Opened {totalOpens}x
                    </span>
                  )}
                  {totalClicks > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                      <span className="material-symbols-outlined text-[14px] text-cyan-500">ads_click</span>
                      Clicked
                    </span>
                  )}
                  {hasReply && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
                      <span className="material-symbols-outlined text-[14px]">reply</span>
                      Replied
                    </span>
                  )}
                </div>
              )}

              <div className="mt-3 pl-8">
                <PipelineProgress status={biz.status} />
              </div>

              {hasGeneratedMaterial && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pl-8 pt-3">
                  {liveSite && (
                    <a
                      href={getSiteUrl(liveSite.deploy_url, liveSite.custom_domain)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200 transition-colors hover:bg-gray-100"
                    >
                      <span className="material-symbols-outlined text-[14px] text-primary">web</span>
                      View site
                    </a>
                  )}
                  {liveLanding && (
                    <a
                      href={getLandingPageUrl(liveLanding.deploy_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200 transition-colors hover:bg-gray-100"
                    >
                      <span className="material-symbols-outlined text-[14px] text-purple-500">campaign</span>
                      Landing page
                    </a>
                  )}
                  {draftEmails.length > 0 && (
                    <Link
                      href={`/email-review?business=${biz.id}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200 transition-colors hover:bg-amber-100"
                    >
                      <span className="material-symbols-outlined text-[14px]">rate_review</span>
                      Review {draftEmails.length} email{draftEmails.length !== 1 ? 's' : ''}
                    </Link>
                  )}
                  <Link
                    href={`/businesses/${biz.id}`}
                    className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-primary"
                  >
                    Details
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        )
      })}

      {selected.size > 0 && (
        <PipelineBulkBar
          selectedIds={Array.from(selected)}
          selectedCount={selected.size}
          onClear={clearSelection}
        />
      )}
    </div>
  )
}
