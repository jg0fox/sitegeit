import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { RealtimeRefresh } from '@/components/pipeline/RealtimeRefresh'
import { PipelineList } from '@/components/pipeline/PipelineList'
import Link from 'next/link'

const FILTER_STAGES = [
  { key: 'all', label: 'All', icon: 'list' },
  { key: 'in_progress', label: 'In progress', icon: 'pending', statuses: ['discovered', 'enriching', 'enriched', 'generating'] },
  { key: 'review_ready', label: 'Needs review', icon: 'rate_review', statuses: ['review_ready'] },
  { key: 'outreach', label: 'Outreach', icon: 'send', statuses: ['sent', 'opened', 'clicked'] },
  { key: 'engaged', label: 'Engaged', icon: 'forum', statuses: ['responded', 'meeting_scheduled'] },
] as const

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'longest_in_stage', label: 'Longest in stage' },
] as const

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; search?: string; sort?: string; status?: string }>
}) {
  const params = await searchParams
  const activeFilter = params.filter || 'all'
  const searchQuery = params.search?.trim() || ''
  const sortKey = params.sort || 'newest'
  const statusFilter = params.status || '' // individual status from dashboard links

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in to view your pipeline.</div>
  }

  // Fetch businesses with related generated material
  let query = supabase
    .from('businesses')
    .select(`
      id, name, category, status, phone, address_city, address_state,
      google_rating, google_review_count, website_status, created_at, enriched_at,
      generated_sites(id, deploy_url, deploy_status),
      landing_pages(id, deploy_url, deploy_status),
      outreach_emails(id, review_status, sequence_position, open_count, click_count, replied_at)
    `)
    .eq('user_id', user.id)

  // Apply sort
  if (sortKey === 'oldest' || sortKey === 'longest_in_stage') {
    query = query.order('created_at', { ascending: true })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  // Apply search filter
  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,address_city.ilike.%${searchQuery}%`)
  }

  // Apply individual status filter (from dashboard links)
  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  // Apply grouped status filter
  const filterConfig = FILTER_STAGES.find((f) => f.key === activeFilter)
  if (!statusFilter && filterConfig && 'statuses' in filterConfig) {
    query = query.in('status', [...filterConfig.statuses])
  }

  const { data: businesses } = await query

  // Count per filter group for the pills (also filtered by search)
  let countQuery = supabase
    .from('businesses')
    .select('status')
    .eq('user_id', user.id)

  if (searchQuery) {
    countQuery = countQuery.or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,address_city.ilike.%${searchQuery}%`)
  }

  const { data: allBusinesses } = await countQuery

  const statusList = allBusinesses ?? []
  const counts: Record<string, number> = { all: statusList.length }
  for (const filter of FILTER_STAGES) {
    if ('statuses' in filter) {
      counts[filter.key] = statusList.filter((b) =>
        (filter.statuses as readonly string[]).includes(b.status)
      ).length
    }
  }

  return (
    <div className="space-y-6">
      <RealtimeRefresh />
      <div>
        <p className="text-sm text-gray-500">
          Track prospects as they move through discovery, enrichment, site generation, and outreach.
        </p>
      </div>

      {/* Search bar + sort */}
      <div className="flex gap-2">
        <form action="/pipeline" method="GET" className="flex flex-1 gap-2">
          {activeFilter !== 'all' && <input type="hidden" name="filter" value={activeFilter} />}
          {sortKey !== 'newest' && <input type="hidden" name="sort" value={sortKey} />}
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
              search
            </span>
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search by name, category, or city..."
              className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {searchQuery && (
            <Link
              href={activeFilter !== 'all' ? `/pipeline?filter=${activeFilter}` : '/pipeline'}
              className="inline-flex h-9 items-center gap-1 rounded-lg px-3 text-sm text-gray-500 ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
            >
              Clear
            </Link>
          )}
        </form>
        {/* Sort dropdown */}
        <div className="relative">
          <select
            defaultValue={sortKey}
            onChange={(e) => {
              // Not interactive in RSC — using form for now
            }}
            className="hidden"
          />
          <div className="flex gap-1">
            {SORT_OPTIONS.map((opt) => {
              const p = new URLSearchParams()
              if (activeFilter !== 'all') p.set('filter', activeFilter)
              if (searchQuery) p.set('search', searchQuery)
              if (statusFilter) p.set('status', statusFilter)
              if (opt.key !== 'newest') p.set('sort', opt.key)
              const qs = p.toString()
              const href = qs ? `/pipeline?${qs}` : '/pipeline'
              const isActive = sortKey === opt.key
              return (
                <Link
                  key={opt.key}
                  href={href}
                  className={`inline-flex h-9 items-center rounded-lg px-3 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-500 ring-1 ring-inset ring-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Individual status filter banner */}
      {statusFilter && (
        <div className="flex items-center gap-2 rounded-lg bg-primary-light px-4 py-2 text-sm text-primary">
          <span className="material-symbols-outlined text-[16px]">filter_alt</span>
          Showing: <span className="font-semibold capitalize">{statusFilter.replace(/_/g, ' ')}</span>
          <Link
            href="/pipeline"
            className="ml-auto text-xs font-medium text-primary hover:underline"
          >
            Clear filter
          </Link>
        </div>
      )}

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTER_STAGES.map((filter) => {
          const count = counts[filter.key] ?? 0
          const isActive = activeFilter === filter.key
          return (
            <Link
              key={filter.key}
              href={(() => {
                const p = new URLSearchParams()
                if (filter.key !== 'all') p.set('filter', filter.key)
                if (searchQuery) p.set('search', searchQuery)
                const qs = p.toString()
                return qs ? `/pipeline?${qs}` : '/pipeline'
              })()}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className={`material-symbols-outlined text-[16px] ${isActive ? '' : 'text-gray-400'}`}>
                {filter.icon}
              </span>
              {filter.label}
              {count > 0 && (
                <span
                  className={`ml-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Business list */}
      {!businesses || businesses.length === 0 ? (
        <EmptyState
          icon="conversion_path"
          title={activeFilter === 'all' ? 'No prospects in pipeline' : 'No prospects match this filter'}
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
        <PipelineList businesses={businesses} />
      )}
    </div>
  )
}
