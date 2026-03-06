import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CopyableId } from '@/components/shared/CopyableId'
import { PipelineActions } from './PipelineActions'
import { PipelineProgress } from './PipelineProgress'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface GeneratedSite {
  id: string
  deploy_url: string
  deploy_status: string
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

interface Business {
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
  generated_sites: GeneratedSite[]
  landing_pages: LandingPage[]
  outreach_emails: OutreachEmail[]
}

export function PipelineList({ businesses }: { businesses: Business[] }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">
        {businesses.length} prospect{businesses.length !== 1 ? 's' : ''}
      </p>
      {businesses.map((biz) => {
        const liveSite = biz.generated_sites?.find((s) => s.deploy_status === 'live')
        const liveLanding = biz.landing_pages?.find((lp) => lp.deploy_status === 'live')
        const draftEmails = biz.outreach_emails?.filter((e) => e.review_status === 'draft') ?? []
        const hasGeneratedMaterial = liveSite || liveLanding || draftEmails.length > 0

        // Engagement signals
        const emails = biz.outreach_emails ?? []
        const totalOpens = emails.reduce((sum, e) => sum + (e.open_count ?? 0), 0)
        const totalClicks = emails.reduce((sum, e) => sum + (e.click_count ?? 0), 0)
        const hasReply = emails.some((e) => e.replied_at)
        const isHighIntent = totalOpens >= 3 || totalClicks >= 1
        const showEngagement = totalOpens > 0 || totalClicks > 0 || hasReply

        return (
          <Card key={biz.id} className="overflow-hidden">
            <div className="p-4">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/pipeline/${biz.id}`}
                      className="truncate text-sm font-semibold text-gray-900 hover:text-primary"
                    >
                      {biz.name}
                    </Link>
                    <StatusBadge status={biz.status} />
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
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(biz.created_at), { addSuffix: true })}
                  </p>
                  <PipelineActions businessId={biz.id} businessName={biz.name} status={biz.status} />
                </div>
              </div>

              {/* Engagement signals */}
              {showEngagement && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
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

              {/* Progress stepper */}
              <div className="mt-3">
                <PipelineProgress status={biz.status} />
              </div>

              {/* Quick action links for generated material */}
              {hasGeneratedMaterial && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                  {liveSite && (
                    <Link
                      href={`/sites/${liveSite.deploy_url}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200 transition-colors hover:bg-gray-100"
                    >
                      <span className="material-symbols-outlined text-[14px] text-primary">web</span>
                      View site
                    </Link>
                  )}
                  {liveLanding && (
                    <Link
                      href={`/sites/go/${liveLanding.deploy_url}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200 transition-colors hover:bg-gray-100"
                    >
                      <span className="material-symbols-outlined text-[14px] text-purple-500">campaign</span>
                      Landing page
                    </Link>
                  )}
                  {draftEmails.length > 0 && (
                    <Link
                      href="/email-review"
                      className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200 transition-colors hover:bg-amber-100"
                    >
                      <span className="material-symbols-outlined text-[14px]">rate_review</span>
                      Review {draftEmails.length} email{draftEmails.length !== 1 ? 's' : ''}
                    </Link>
                  )}
                  {biz.status === 'active' && (
                    <Link
                      href={`/clients/${biz.id}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200 transition-colors hover:bg-emerald-100"
                    >
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      View client
                    </Link>
                  )}
                  <Link
                    href={`/pipeline/${biz.id}`}
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
    </div>
  )
}
