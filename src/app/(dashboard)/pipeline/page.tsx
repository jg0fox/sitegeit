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

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const params = await searchParams
  const activeFilter = params.filter || 'all'

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
      outreach_emails(id, review_status, sequence_position)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Apply filter
  const filterConfig = FILTER_STAGES.find((f) => f.key === activeFilter)
  if (filterConfig && 'statuses' in filterConfig) {
    query = query.in('status', [...filterConfig.statuses])
  }

  const { data: businesses } = await query

  // Count per filter group for the pills
  const { data: allBusinesses } = await supabase
    .from('businesses')
    .select('status')
    .eq('user_id', user.id)

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

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTER_STAGES.map((filter) => {
          const count = counts[filter.key] ?? 0
          const isActive = activeFilter === filter.key
          return (
            <Link
              key={filter.key}
              href={filter.key === 'all' ? '/pipeline' : `/pipeline?filter=${filter.key}`}
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
