import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CopyableId } from '@/components/shared/CopyableId'
import { PipelineActions } from '@/components/pipeline/PipelineActions'
import { Button } from '@/components/ui/button'
import { PipelineProgress } from '@/components/pipeline/PipelineProgress'
import { RegenerateSiteButton } from '@/components/pipeline/RegenerateSiteButton'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface GoogleReview {
  author_name: string
  rating: number
  text: string
  time: number
}

function StarRow({ rating, size = '18px' }: { rating: number; size?: string }) {
  const fills = Array.from({ length: 5 }, (_, i) => {
    const diff = rating - i
    if (diff >= 1) return 1
    if (diff <= 0) return 0
    return Math.round(diff * 10) / 10
  })

  return (
    <span className="inline-flex gap-0.5">
      {fills.map((fill, i) => {
        if (fill >= 1) {
          return (
            <span
              key={i}
              className="material-symbols-outlined"
              style={{ fontSize: size, color: '#facc15', fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
          )
        }
        if (fill <= 0) {
          return (
            <span
              key={i}
              className="material-symbols-outlined"
              style={{ fontSize: size, color: '#d1d5db', fontVariationSettings: "'FILL' 0" }}
            >
              star
            </span>
          )
        }
        const pct = Math.round(fill * 100)
        return (
          <span
            key={i}
            className="material-symbols-outlined"
            style={{
              fontSize: size,
              fontVariationSettings: "'FILL' 1",
              background: `linear-gradient(90deg, #facc15 ${pct}%, #d1d5db ${pct}%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            star
          </span>
        )
      })}
    </span>
  )
}

export default async function ProspectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
  const [sitesResult, landingsResult, emailsResult, activityResult] = await Promise.all([
    supabase
      .from('generated_sites')
      .select('id, deploy_url, deploy_status, theme_id, layout_variant, created_at')
      .eq('business_id', id)
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('landing_pages')
      .select('id, deploy_url, deploy_status, headline, created_at')
      .eq('business_id', id)
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('outreach_emails')
      .select('id, subject, review_status, sequence_position, created_at')
      .eq('business_id', id)
      .order('sequence_position', { ascending: true }),
    supabase
      .from('activity_log')
      .select('id, event_type, event_data, created_at')
      .eq('business_id', id)
      .order('created_at', { ascending: false })
      .limit(15),
  ])

  const site = sitesResult.data?.[0]
  const landing = landingsResult.data?.[0]
  const emails = emailsResult.data ?? []
  const activities = activityResult.data ?? []

  const SEQUENCE_LABELS: Record<number, string> = {
    1: 'Primary outreach',
    2: 'Follow-up 1',
    3: 'Follow-up 2',
  }

  const EVENT_LABELS: Record<string, { label: string; icon: string; color: string }> = {
    lead_discovered: { label: 'Lead discovered', icon: 'person_add', color: 'text-gray-500' },
    enrichment_complete: { label: 'Enrichment complete', icon: 'auto_awesome', color: 'text-blue-500' },
    site_generated: { label: 'Site generated', icon: 'web', color: 'text-purple-500' },
    landing_page_generated: { label: 'Landing page generated', icon: 'campaign', color: 'text-indigo-500' },
    email_drafted: { label: 'Emails drafted', icon: 'edit_note', color: 'text-amber-500' },
    status_changed: { label: 'Status changed', icon: 'swap_horiz', color: 'text-gray-500' },
  }

  // Enrichment data
  const enrichmentConfidence = business.enrichment_confidence as {
    overall?: string
    fields?: Record<string, string>
  } | null
  const brandColors = business.brand_colors as { primary?: string; secondary?: string; source?: string } | null
  const googleReviews = (business.google_reviews ?? []) as GoogleReview[]
  const topExcerpts = (business.top_review_excerpts ?? []) as string[]
  const hasEnrichment = business.brand_voice || business.value_proposition || business.services ||
    business.service_area || business.target_audience || business.owner_name || brandColors
  const hasReviews = business.google_rating != null || googleReviews.length > 0 || topExcerpts.length > 0 || business.review_sentiment

  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <div>
        <Link
          href="/pipeline"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to pipeline
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
              <StatusBadge status={business.status} />
              <CopyableId id={business.id} />
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
                  {[business.address_street, business.address_city, business.address_state, business.address_zip]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              )}
              {business.phone && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">phone</span>
                  {business.phone}
                </span>
              )}
              {business.owner_name && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  {business.owner_name}
                </span>
              )}
            </div>
          </div>
          <PipelineActions businessId={id} businessName={business.name} status={business.status} />
        </div>
      </div>

      {/* Progress */}
      <Card className="p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Pipeline progress</p>
        <PipelineProgress status={business.status} />
        <p className="mt-2 text-xs text-gray-400">
          Added {formatDistanceToNow(new Date(business.created_at), { addSuffix: true })}
          {business.enriched_at && (
            <> &middot; Enriched {formatDistanceToNow(new Date(business.enriched_at), { addSuffix: true })}</>
          )}
        </p>
      </Card>

      {/* Generated material grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Generated Site */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">web</span>
              <CardTitle>Generated site</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {site ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    site.deploy_status === 'live' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {site.deploy_status === 'live' ? 'Live' : 'Pending'}
                  </span>
                  <span>Theme: {site.theme_id}</span>
                </div>
                <Button asChild size="sm" className="w-full">
                  <Link href={`/sites/${site.deploy_url}`} target="_blank">
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    View site
                  </Link>
                </Button>
                <RegenerateSiteButton businessId={id} />
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                {['discovered', 'enriching', 'enriched'].includes(business.status)
                  ? 'Site will be generated after enrichment.'
                  : 'No site generated yet.'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Landing Page */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-purple-500">campaign</span>
              <CardTitle>Landing page</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {landing ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 line-clamp-2">{landing.headline}</p>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href={`/sites/go/${landing.deploy_url}`} target="_blank">
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    View landing page
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                {['discovered', 'enriching', 'enriched', 'generating'].includes(business.status)
                  ? 'Landing page will be generated with the site.'
                  : 'No landing page generated yet.'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Email Drafts */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-amber-500">mail</span>
              <CardTitle>Email drafts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {emails.length > 0 ? (
              <div className="space-y-2">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-gray-700">
                        {SEQUENCE_LABELS[email.sequence_position] ?? `Email ${email.sequence_position}`}
                      </p>
                      <p className="truncate text-[11px] text-gray-500">{email.subject}</p>
                    </div>
                    <span className={`ml-2 flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      email.review_status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : email.review_status === 'draft'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      {email.review_status}
                    </span>
                  </div>
                ))}
                {emails.some((e) => e.review_status === 'draft') && (
                  <Button asChild size="sm" variant="outline" className="mt-1 w-full">
                    <Link href="/email-review">
                      <span className="material-symbols-outlined text-[16px]">rate_review</span>
                      Review emails
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                {business.status === 'review_ready'
                  ? 'No emails found.'
                  : 'Emails will be drafted after site generation.'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reviews & Ratings */}
      {hasReviews && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-amber-500">reviews</span>
              <CardTitle>Reviews & ratings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Rating summary */}
              {business.google_rating != null && (
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-gray-900">{business.google_rating}</div>
                  <div>
                    <StarRow rating={business.google_rating} size="24px" />
                    <p className="mt-0.5 text-sm text-gray-500">
                      {business.google_review_count
                        ? `${business.google_review_count} Google reviews`
                        : 'Google rating'}
                    </p>
                  </div>
                  {business.google_place_id && (
                    <a
                      href={`https://search.google.com/local/reviews?placeid=${business.google_place_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200 transition-colors hover:bg-gray-50"
                    >
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      View on Google
                    </a>
                  )}
                </div>
              )}

              {/* Review sentiment summary */}
              {business.review_sentiment && (
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">AI sentiment analysis</p>
                  <p className="text-sm leading-relaxed text-blue-900">{business.review_sentiment}</p>
                </div>
              )}

              {/* Top review excerpts */}
              {topExcerpts.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Top review excerpts</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {topExcerpts.map((excerpt, i) => (
                      <blockquote
                        key={i}
                        className="relative rounded-lg border border-gray-100 bg-gray-50 p-4"
                      >
                        <span
                          className="absolute -top-2 left-3 text-2xl font-bold leading-none text-amber-300"
                          aria-hidden="true"
                        >
                          &ldquo;
                        </span>
                        <p className="text-sm italic leading-relaxed text-gray-700">{excerpt}</p>
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw Google reviews */}
              {googleReviews.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Google reviews ({googleReviews.length})
                  </p>
                  <div className="space-y-3">
                    {googleReviews.map((review, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-gray-100 p-4"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <StarRow rating={review.rating} size="14px" />
                          <span className="text-xs font-medium text-gray-700">{review.author_name}</span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-600">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enrichment data */}
      {hasEnrichment && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-500">auto_awesome</span>
                <CardTitle>Enrichment data</CardTitle>
              </div>
              {enrichmentConfidence?.overall && (
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                  enrichmentConfidence.overall === 'high'
                    ? 'bg-emerald-50 text-emerald-700'
                    : enrichmentConfidence.overall === 'medium'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {enrichmentConfidence.overall} confidence
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {business.brand_voice && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Brand voice</p>
                  <p className="mt-1 text-sm text-gray-700">
                    {typeof business.brand_voice === 'object' ? JSON.stringify(business.brand_voice) : business.brand_voice}
                  </p>
                </div>
              )}
              {business.value_proposition && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Value proposition</p>
                  <p className="mt-1 text-sm text-gray-700">{business.value_proposition}</p>
                </div>
              )}
              {business.target_audience && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Target audience</p>
                  <p className="mt-1 text-sm text-gray-700">{business.target_audience}</p>
                </div>
              )}
              {business.service_area && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Service area</p>
                  <p className="mt-1 text-sm text-gray-700">{business.service_area}</p>
                </div>
              )}
              {brandColors && (brandColors.primary || brandColors.secondary) && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Brand colors</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    {brandColors.primary && (
                      <div className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-5 w-5 rounded-full ring-1 ring-inset ring-gray-200"
                          style={{ backgroundColor: brandColors.primary }}
                        />
                        <span className="font-mono text-xs text-gray-500">{brandColors.primary}</span>
                      </div>
                    )}
                    {brandColors.secondary && (
                      <div className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-5 w-5 rounded-full ring-1 ring-inset ring-gray-200"
                          style={{ backgroundColor: brandColors.secondary }}
                        />
                        <span className="font-mono text-xs text-gray-500">{brandColors.secondary}</span>
                      </div>
                    )}
                    {brandColors.source && (
                      <span className="text-[10px] text-gray-400">({brandColors.source})</span>
                    )}
                  </div>
                </div>
              )}
              {business.services && Array.isArray(business.services) && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Services</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {(business.services as string[]).map((s: string) => (
                      <span key={s} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Per-field confidence indicators */}
              {enrichmentConfidence?.fields && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Data sources</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {Object.entries(enrichmentConfidence.fields).map(([field, source]) => (
                      <span
                        key={field}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          source === 'verified'
                            ? 'bg-emerald-50 text-emerald-700'
                            : source === 'inferred'
                              ? 'bg-blue-50 text-blue-700'
                              : source === 'unavailable'
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {field.replace(/_/g, ' ')}: {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
            <div className="space-y-3">
              {activities.map((activity) => {
                const config = EVENT_LABELS[activity.event_type] ?? {
                  label: activity.event_type,
                  icon: 'circle',
                  color: 'text-gray-400',
                }
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <span className={`material-symbols-outlined mt-0.5 text-[16px] ${config.color}`}>
                      {config.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-700">{config.label}</p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
