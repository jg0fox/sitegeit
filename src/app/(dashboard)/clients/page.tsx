import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { ClientMetrics } from '@/components/clients/ClientMetrics'
import { ClientList } from '@/components/clients/ClientList'
import Link from 'next/link'

const TIER_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'starter', label: 'Starter' },
  { key: 'growth', label: 'Growth' },
  { key: 'pro', label: 'Pro' },
  { key: 'premium', label: 'Premium' },
] as const

const STATUS_FILTERS = [
  { key: 'all', label: 'All statuses' },
  { key: 'active', label: 'Active' },
  { key: 'churned', label: 'Churned' },
  { key: 'closed_won', label: 'Closed won' },
  { key: 'closed_lost', label: 'Closed lost' },
] as const

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest' },
  { key: 'name', label: 'Name' },
  { key: 'rate_high', label: 'Rate ↓' },
  { key: 'rate_low', label: 'Rate ↑' },
] as const

const CLIENT_STATUSES = ['active', 'churned', 'closed_won', 'closed_lost']

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; tier?: string; status?: string; sort?: string }>
}) {
  const params = await searchParams
  const searchQuery = params.search?.trim() || ''
  const tierFilter = params.tier || 'all'
  const statusFilter = params.status || 'all'
  const sortKey = params.sort || 'newest'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in to view clients.</div>
  }

  let query = supabase
    .from('businesses')
    .select(
      `id, name, category, status, tier, monthly_rate, converted_at,
       address_city, address_state,
       generated_sites(deploy_url, custom_domain)`
    )
    .eq('user_id', user.id)
    .in('status', CLIENT_STATUSES)

  if (searchQuery) {
    query = query.or(
      `name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,address_city.ilike.%${searchQuery}%`
    )
  }

  if (tierFilter !== 'all') {
    query = query.eq('tier', tierFilter)
  }

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  switch (sortKey) {
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
      query = query.order('converted_at', { ascending: false, nullsFirst: false })
  }

  const { data: businesses } = await query

  function buildHref(overrides: Record<string, string>) {
    const p = new URLSearchParams()
    const merged = { search: searchQuery, tier: tierFilter, status: statusFilter, sort: sortKey, ...overrides }
    if (merged.search) p.set('search', merged.search)
    if (merged.tier && merged.tier !== 'all') p.set('tier', merged.tier)
    if (merged.status && merged.status !== 'all') p.set('status', merged.status)
    if (merged.sort && merged.sort !== 'newest') p.set('sort', merged.sort)
    const qs = p.toString()
    return qs ? `/clients?${qs}` : '/clients'
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          Manage active clients, track revenue, and monitor their sites.
        </p>
      </div>

      <ClientMetrics />

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <form action="/clients" method="GET" className="flex flex-1 gap-2">
          {tierFilter !== 'all' && <input type="hidden" name="tier" value={tierFilter} />}
          {statusFilter !== 'all' && <input type="hidden" name="status" value={statusFilter} />}
          {sortKey !== 'newest' && <input type="hidden" name="sort" value={sortKey} />}
          <div className="relative min-w-[200px] flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
              search
            </span>
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search clients..."
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
      </div>

      {/* Tier filter pills */}
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
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.key}
            href={buildHref({ status: f.key })}
            className={`inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium transition-colors ${
              statusFilter === f.key
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </Link>
        ))}

        <span className="ml-3 text-xs font-medium text-gray-500">Sort:</span>
        {SORT_OPTIONS.map((opt) => (
          <Link
            key={opt.key}
            href={buildHref({ sort: opt.key })}
            className={`inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium transition-colors ${
              sortKey === opt.key
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Client list */}
      {!businesses || businesses.length === 0 ? (
        <EmptyState
          icon="group"
          title={
            tierFilter !== 'all' || statusFilter !== 'all' || searchQuery
              ? 'No clients match these filters'
              : 'No clients yet'
          }
          description="Convert prospects to clients to start managing them here. Clients appear once a deal closes."
          action={
            <Button variant="outline" asChild>
              <Link href="/pipeline">
                <span className="material-symbols-outlined text-[18px]">
                  conversion_path
                </span>
                View pipeline
              </Link>
            </Button>
          }
        />
      ) : (
        <ClientList businesses={businesses} />
      )}
    </div>
  )
}
