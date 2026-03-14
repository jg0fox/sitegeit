import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TierBadge } from '@/components/shared/TierBadge'
import { PipelineActions } from '@/components/pipeline/PipelineActions'
import { Button } from '@/components/ui/button'
import { ActivityTimeline } from '@/components/shared/ActivityTimeline'
import { NotesSection } from '@/components/pipeline/NotesSection'
import { CustomDomainSetup } from '@/components/clients/CustomDomainSetup'
import { ClientTierEditor } from '@/components/clients/ClientTierEditor'
import { InlineEmail } from '@/components/shared/InlineEmail'
import { EmailSection } from '@/components/shared/EmailSection'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in.</div>
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!business) {
    notFound()
  }

  // Fetch related data in parallel
  const [sitesResult, activityResult, notesResult] = await Promise.all([
    supabase
      .from('generated_sites')
      .select('id, deploy_url, deploy_status, custom_domain, theme_id, version, created_at')
      .eq('business_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('activity_log')
      .select('id, event_type, event_data, created_at')
      .eq('business_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('notes')
      .select('id, content, created_at')
      .eq('business_id', id)
      .order('created_at', { ascending: false }),
  ])

  const sites = sitesResult.data ?? []
  const liveSite = sites.find((s) => s.deploy_status === 'live') || sites[0]
  const activities = activityResult.data ?? []
  const notes = notesResult.data ?? []

  const isGrowthPlus = business.tier && business.tier !== 'starter'

  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <div>
        <Link
          href="/clients"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to clients
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
              <StatusBadge status={business.status} />
              {business.tier && <TierBadge tier={business.tier} />}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              {business.category && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">category</span>
                  {business.category}
                </span>
              )}
              {(business.address_city || business.address_state) && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {[business.address_city, business.address_state].filter(Boolean).join(', ')}
                </span>
              )}
              <InlineEmail businessId={id} initialEmail={business.email} />
              {business.monthly_rate && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">payments</span>
                  ${business.monthly_rate}/mo
                </span>
              )}
              {business.converted_at && (
                <span className="text-xs text-gray-400">
                  Converted {formatDistanceToNow(new Date(business.converted_at), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/pipeline/${id}`}
              className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
            >
              <span className="material-symbols-outlined text-[14px]">conversion_path</span>
              Pipeline history
            </Link>
            <PipelineActions businessId={id} businessName={business.name} status={business.status} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Site Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">web</span>
              <CardTitle>Site management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {liveSite ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          liveSite.deploy_status === 'live'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {liveSite.deploy_status === 'live' ? 'Live' : liveSite.deploy_status}
                      </span>
                      {liveSite.version && (
                        <span className="text-xs text-gray-400">v{liveSite.version}</span>
                      )}
                    </div>
                    {liveSite.deploy_url && (
                      <p className="mt-1 text-xs text-gray-500">
                        {liveSite.custom_domain || `${liveSite.deploy_url}.sitegeit.com`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/sites/${liveSite.deploy_url}`} target="_blank">
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        View site
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/api/businesses/${id}/regenerate`}>
                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                        Update site
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Version history */}
                {sites.length > 1 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-gray-500">Version history</p>
                    <div className="space-y-1">
                      {sites.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-1.5 text-xs"
                        >
                          <span className="text-gray-700">
                            v{s.version || 1} — {s.theme_id}
                          </span>
                          <span className="text-gray-400">
                            {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">No site generated yet.</p>
            )}

            {/* Custom Domain */}
            {isGrowthPlus && (
              <div className="border-t border-gray-100 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Custom domain
                </p>
                <CustomDomainSetup
                  businessId={id}
                  currentDomain={liveSite?.custom_domain ?? null}
                  tier={business.tier || 'starter'}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tier & Billing */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-amber-500">workspace_premium</span>
              <CardTitle>Tier & billing</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ClientTierEditor
              businessId={id}
              currentTier={business.tier || 'starter'}
              currentRate={business.monthly_rate || 0}
              status={business.status}
              convertedAt={business.converted_at}
            />
          </CardContent>
        </Card>
      </div>

      {/* Email correspondence */}
      <EmailSection
        businessId={id}
        recipientEmail={business.email}
        recipientName={business.name}
      />

      {/* Analytics placeholder (Growth+ only) */}
      {isGrowthPlus && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-blue-500">monitoring</span>
              <CardTitle>Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4">
              <span className="material-symbols-outlined text-[24px] text-blue-400">insights</span>
              <div>
                <p className="text-sm font-medium text-blue-700">Analytics dashboard coming soon</p>
                <p className="text-xs text-blue-600">
                  Site traffic, page views, and visitor analytics will be available here via Plausible.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity timeline */}
      {activities.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-gray-500">history</span>
              <CardTitle>Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ActivityTimeline activities={activities} />
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <NotesSection businessId={id} initialNotes={notes} />
    </div>
  )
}
