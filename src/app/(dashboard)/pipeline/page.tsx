import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

const STAGE_TABS = [
  { key: 'all', label: 'All' },
  { key: 'discovered', label: 'Discovered' },
  { key: 'enriching', label: 'Enriching' },
  { key: 'review_ready', label: 'Review Ready' },
  { key: 'sent', label: 'Sent' },
  { key: 'responded', label: 'Responded' },
] as const

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>
}) {
  const params = await searchParams
  const stageFilter = params.stage || 'all'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in to view your pipeline.</div>
  }

  let query = supabase
    .from('businesses')
    .select('id, name, category, status, phone, address_city, address_state, google_rating, google_review_count, website_status, created_at, enriched_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (stageFilter !== 'all') {
    query = query.eq('status', stageFilter)
  }

  const { data: businesses } = await query

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          Track prospects as they move through discovery, enrichment, site
          generation, and outreach.
        </p>
      </div>

      {/* Stage filter tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 pb-px">
        {STAGE_TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === 'all' ? '/pipeline' : `/pipeline?stage=${tab.key}`}
            className={`whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${
              stageFilter === tab.key
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Business list */}
      {!businesses || businesses.length === 0 ? (
        <EmptyState
          icon="conversion_path"
          title={stageFilter === 'all' ? 'No prospects in pipeline' : `No prospects in this stage`}
          description="Discover leads to fill your pipeline. Prospects will appear here as they move through each stage."
          action={
            <Button asChild>
              <Link href="/discover">
                <span className="material-symbols-outlined text-[18px]">
                  travel_explore
                </span>
                Discover leads
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">{businesses.length} prospect{businesses.length !== 1 ? 's' : ''}</p>
          {businesses.map((biz) => (
            <Card key={biz.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-gray-900">
                      {biz.name}
                    </h3>
                    <StatusBadge status={biz.status} />
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
                    {biz.google_rating && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-amber-400">star</span>
                        {biz.google_rating}{biz.google_review_count ? ` (${biz.google_review_count})` : ''}
                      </span>
                    )}
                    {biz.phone && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">phone</span>
                        {biz.phone}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">
                    Added {formatDistanceToNow(new Date(biz.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
