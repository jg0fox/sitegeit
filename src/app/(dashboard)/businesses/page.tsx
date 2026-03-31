import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { RealtimeRefresh } from '@/components/pipeline/RealtimeRefresh'
import { BusinessesList } from '@/components/businesses/BusinessesList'
import { ClientMetrics } from '@/components/clients/ClientMetrics'
import { ManualAddDialog } from '@/components/businesses/ManualAddDialog'
import Link from 'next/link'

const FILTER_STAGES = [
  { key: 'all', label: 'All', icon: 'list' },
  { key: 'in_progress', label: 'In progress', icon: 'pending', statuses: ['discovered', 'enriching', 'enriched', 'generating'] },
  { key: 'review_ready', label: 'Needs review', icon: 'rate_review', statuses: ['review_ready'] },
  { key: 'outreach', label: 'Outreach', icon: 'send', statuses: ['sent', 'opened', 'clicked'] },
  { key: 'engaged', label: 'Engaged', icon: 'forum', statuses: ['responded', 'meeting_scheduled'] },
  { key: 'clients', label: 'Clients', icon: 'group', statuses: ['active', 'churned', 'closed_won', 'closed_lost'] },
  { key: 'archived', label: 'Archived', icon: 'archive', statuses: ['archived'] },
] as const

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'name', label: 'Name' },
  { key: 'rate_high', label: 'Rate ↓' },
  { key: 'rate_low', label: 'Rate ↑' },
] as const

const TIER_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'starter', label: 'Starter' },
  { key: 'growth', label: 'Growth' },
  { key: 'pro', label: 'Pro' },
  { key: 'premium', label: 'Premium' },
] as const

const CLIENT_STATUS_FILTERS = [
  { key: 'all', label: 'All statuses' },
  { key: 'active', label: 'Active' },
  { key: 'churned', label: 'Churned' },
  { key: 'closed_won', label: 'Closed won' },
  { key: 'closed_lost', label: 'Closed lost' },
] as const

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; search?: string; sort?: string; status?: string; tier?: string; client_status?: string }>
}) {
  const params = await searchParams
  const activeFilter = params.filter || 'all'
  const searchQuery = params.search?.trim() || ''
  const sortKey = params.sort || 'newest'
  const statusFilter = params.status || '' // individual status from dashboard links
  const tierFilter = params.tier || 'all'
  const clientStatusFilter = params.client_status || 'all'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in to view your businesses.</div>
  }

  let query = supabase
    .from('businesses')
    .select(`
      id, name, category, status, phone, address_city, address_state,
      google_rating, google_review_count, website_status, created_at, enriched_at,
      tier, monthly_rate, converted_at,
      generated_sites(id, deploy_url, deploy_status, custom_domain),
      landing_pages(id, deploy_url, deploy_status),
      outreach_emails(id, review_status, sequence_position, open_count, click_count, replied_at)
    `)
    .eq('user_id', user.id)

  // Apply sort
  switch (sortKey) {
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'name':
      query = query.order('name', { ascending: true })
      break
    case 'rate_high':
      query = query.order('monthly_rate', { ascending: false, nullsFirst: false })
      break
    case 'rate_low':
      query = query.order('monthly_rate', { ascending: true, nullsFirst: false })
      break
    default:
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

  // Apply client sub-filters when viewing clients
  if (activeFilter === 'clients') {
    if (tierFilter !== 'all') {
      query = query.eq('tier', tierFilter)
    }
    if (clientStatusFilter !== 'all') {
      query = query.eq('status', clientStatusFilter)
    }
  }

  const { data: businesses } = await query

  // Count per filter group for the pills
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

  const showClientMetrics = (activeFilter === 'clients' || activeFilter === 'all') && (counts['clients'] ?? 0) > 0

  function buildHref(overrides: Record<string, string>) {
    const p = new URLSearchParams()
    const merged = {
      filter: activeFilter,
      search: searchQuery,
      sort: sortKey,
      tier: tierFilter,
      client_status: clientStatusFilter,
      ...overrides,
    }
    if (merged.filter && merged.filter !== 'all') p.set('filter', merged.filter)
    if (merged.search) p.set('search', merged.search)
    if (merged.sort && merged.sort !== 'newest') p.set('sort', merged.sort)
    if (merged.filter === 'clients') {
      if (merged.tier && merged.tier !== 'all') p.set('tier', merged.tier)
      if (merged.client_status && merged.client_status !== 'all') p.set('client_status', merged.client_status)
    }
    const qs = p.toString()
    return qs ? `/businesses?${qs}` : '/businesses'
  }

  return (
    <div className="space-y-6">
      <RealtimeRefresh />
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Track prospects through discovery, enrichment, site generation, outreach, and client management.
        </p>
        <div className="flex items-center gap-2">
          <ManualAddDialog />
          <Link href="/discover">
            <Button size="sm" className="gap-1.5">
              <span className="material-symbols-outlined text-[16px]">travel_explore</span>
              Discover leads
            </Button>
          </Link>
        </div>
      </div>

      {/* Client metrics strip */}
      {showClientMetrics && <ClientMetrics />}

      {/* Search bar + sort */}
      <div className="flex gap-2">
        <form action="/businesses" method="GET" className="flex flex-1 gap-2">
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
              href={buildHref({ search: '' })}
              className="inline-flex h-9 items-center gap-1 rounded-lg px-3 text-sm text-gray-500 ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
            >
              Clear
            </Link>
          )}
        </form>
        {/* Sort buttons */}
        <div className="flex gap-1">
          {SORT_OPTIONS.map((opt) => (
            <Link
              key={opt.key}
              href={buildHref({ sort: opt.key })}
              className={`inline-flex h-9 items-center rounded-lg px-3 text-xs font-medium transition-colors ${
                sortKey === opt.key
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 ring-1 ring-inset ring-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Individual status filter banner */}
      {statusFilter && (
        <div className="flex items-center gap-2 rounded-lg bg-primary-light px-4 py-2 text-sm text-primary">
          <span className="material-symbols-outlined text-[16px]">filter_alt</span>
          Showing: <span className="font-semibold capitalize">{statusFilter.replace(/_/g, ' ')}</span>
          <Link
            href="/businesses"
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
              href={buildHref({ filter: filter.key, tier: 'all', client_status: 'all' })}
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

      {/* Client sub-filters (tier + client status) */}
      {activeFilter === 'clients' && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Tier:</span>
          {TIER_FILTERS.map((f) => (
            <Link
              key={f.key}
              href={buildHref({ tier: f.key })}
              className={`inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium transition-colors ${
                tierFilter === f.key
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </Link>
          ))}

          <span className="ml-3 text-xs font-medium text-gray-500">Status:</span>
          {CLIENT_STATUS_FILTERS.map((f) => (
            <Link
              key={f.key}
              href={buildHref({ client_status: f.key })}
              className={`inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium transition-colors ${
                clientStatusFilter === f.key
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      )}

      {/* Business list */}
      {!businesses || businesses.length === 0 ? (
        <EmptyState
          icon="store"
          title={activeFilter === 'all' ? 'No businesses yet' : 'No businesses match this filter'}
          description="Discover leads or add a business manually to get started."
          action={
            <div className="flex items-center gap-2">
              <ManualAddDialog />
              <Button asChild>
                <Link href="/discover">
                  <span className="material-symbols-outlined text-[18px]">
                    travel_explore
                  </span>
                  Discover leads
                </Link>
              </Button>
            </div>
          }
        />
      ) : (
        <BusinessesList businesses={businesses} />
      )}
    </div>
  )
}
