import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TierBadge } from '@/components/shared/TierBadge'
import { CopyableId } from '@/components/shared/CopyableId'
import { PipelineActions } from '@/components/pipeline/PipelineActions'
import { Button } from '@/components/ui/button'
import { PipelineProgress } from '@/components/pipeline/PipelineProgress'
import { RegenerateSiteButton } from '@/components/pipeline/RegenerateSiteButton'
import { ActivityTimeline } from '@/components/shared/ActivityTimeline'
import { NotesSection } from '@/components/pipeline/NotesSection'
import { InlineEmail } from '@/components/shared/InlineEmail'
import { EmailSection } from '@/components/shared/EmailSection'
import { CustomDomainSetup } from '@/components/clients/CustomDomainSetup'
import { getSiteUrl, getLandingPageUrl } from '@/lib/utils/site-urls'
import { SlugEditor } from '@/components/shared/SlugEditor'
import { ClientTierEditor } from '@/components/clients/ClientTierEditor'
import { ClientBookingSetup } from '@/components/clients/ClientBookingSetup'
import { EmailCandidates } from '@/components/businesses/EmailCandidates'
import { ContactInfoCard } from '@/components/businesses/ContactInfoCard'
import { BusinessEmailReview } from '@/components/businesses/BusinessEmailReview'
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

const CLIENT_STATUSES = ['active', 'churned', 'closed_won', 'closed_lost']

export default async function BusinessDetailPage({
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

  const isClient = CLIENT_STATUSES.includes(business.status)
  const isGrowthPlus = business.tier && business.tier !== 'starter'

  // Fetch related data in parallel
  const [sitesResult, landingsResult, emailsResult, activityResult, notesResult, engagementResult, emailCandidatesResult] = await Promise.all([
    supabase
      .from('generated_sites')
      .select('id, deploy_url, deploy_status, custom_domain, theme_id, layout_variant, version, created_at')
      .eq('business_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('landing_pages')
      .select('id, deploy_url, deploy_status, headline, created_at')
      .eq('business_id', id)
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('outreach_emails')
      .select('id, subject, body, edited_body, review_status, sequence_position, template_variant, created_at')
      .eq('business_id', id)
      .order('sequence_position', { ascending: true }),
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
    supabase
      .from('outreach_emails')
      .select('open_count, click_count, replied_at, bounced')
      .eq('business_id', id),
    supabase
      .from('email_candidates')
      .select('*')
      .eq('business_id', id)
      .order('created_at', { ascending: true }),
  ])

  const sites = sitesResult.data ?? []
  const liveSite = sites.find((s) => s.deploy_status === 'live') || sites[0]
  const landing = landingsResult.data?.[0]
  const emails = emailsResult.data ?? []
  const activities = activityResult.data ?? []
  const notes = notesResult.data ?? []

  // Sort email candidates by confidence: high > medium > low
  const confidenceOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
  const emailCandidates = (emailCandidatesResult.data ?? []).sort(
    (a, b) => (confidenceOrder[a.confidence] ?? 3) - (confidenceOrder[b.confidence] ?? 3)
  )

  // Aggregate engagement signals
  const engagementEmails = engagementResult.data ?? []
  const totalOpens = engagementEmails.reduce((sum, e) => sum + ((e.open_count as number) ?? 0), 0)
  const totalClicks = engagementEmails.reduce((sum, e) => sum + ((e.click_count as number) ?? 0), 0)
  const hasReply = engagementEmails.some((e) => e.replied_at)
  const hasBounce = engagementEmails.some((e) => e.bounced)
  const hasEngagement = totalOpens > 0 || totalClicks > 0 || hasReply || hasBounce

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
          href="/businesses"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to businesses
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
              <StatusBadge status={business.status} />
              {business.tier && <TierBadge tier={business.tier} />}
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
              <InlineEmail businessId={id} initialEmail={business.email} />
              {business.owner_name && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  {business.owner_name}
                </span>
              )}
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

      {/* Contact information */}
      <ContactInfoCard
        businessId={id}
        contactEmail={business.contact_email}
        phone={business.phone}
        addressStreet={business.address_street}
        addressCity={business.address_city}
        addressState={business.address_state}
        addressZip={business.address_zip}
      />

      {/* Email candidates */}
      <EmailCandidates
        businessId={id}
        initialCandidates={emailCandidates}
        primaryEmail={business.email}
      />

      {/* Generated material grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Generated Site */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">web</span>
              <CardTitle>Generated site</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {liveSite ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    liveSite.deploy_status === 'live' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {liveSite.deploy_status === 'live' ? 'Live' : liveSite.deploy_status}
                  </span>
                  <span>Theme: {liveSite.theme_id}</span>
                  {liveSite.version && (
                    <span className="text-gray-400">v{liveSite.version}</span>
                  )}
                </div>
                {liveSite.deploy_url && (
                  <SlugEditor
                    businessId={id}
                    deployUrl={liveSite.deploy_url}
                    customDomain={liveSite.custom_domain}
                  />
                )}
                <Button asChild size="sm" className="w-full">
                  <a href={getSiteUrl(liveSite.deploy_url, liveSite.custom_domain)} target="_blank" rel="noopener noreferrer">
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    View site
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href={`/businesses/${id}/edit-site`}>
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    Edit site
                  </Link>
                </Button>
                <RegenerateSiteButton businessId={id} />

                {/* Version history (when multiple versions exist) */}
                {sites.length > 1 && (
                  <div className="border-t border-gray-100 pt-3">
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

                {/* Custom Domain (active clients) */}
                {isClient && (
                  <div className="border-t border-gray-100 pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Custom domain
                    </p>
                    <CustomDomainSetup
                      businessId={id}
                      currentDomain={liveSite?.custom_domain ?? null}
                    />
                  </div>
                )}
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
                  <a href={getLandingPageUrl(landing.deploy_url)} target="_blank" rel="noopener noreferrer">
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    View landing page
                  </a>
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
      </div>

      {/* Inline email review */}
      {emails.length > 0 && (
        <BusinessEmailReview
          businessId={id}
          businessEmail={business.email}
          emails={emails}
        />
      )}

      {/* Client-only: Tier & Billing */}
      {isClient && (
        <div className="grid gap-6 lg:grid-cols-2">
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
                stripeSubscriptionId={business.stripe_subscription_id}
              />
            </CardContent>
          </Card>

          {/* Analytics placeholder (Growth+) */}
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
        </div>
      )}

      {/* Booking setup — available for all businesses (demo to prospects) */}
      <ClientBookingSetup
        businessId={id}
        businessName={business.name}
        businessEmail={business.email}
      />

      {/* Engagement signals */}
      {hasEngagement && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-blue-500">monitoring</span>
              <CardTitle>Engagement</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              {totalOpens > 0 && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-blue-500">visibility</span>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{totalOpens}</p>
                    <p className="text-xs text-gray-500">Email opens</p>
                  </div>
                </div>
              )}
              {totalClicks > 0 && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-cyan-500">ads_click</span>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{totalClicks}</p>
                    <p className="text-xs text-gray-500">Link clicks</p>
                  </div>
                </div>
              )}
              {hasReply && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-emerald-500">reply</span>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">Replied</p>
                    <p className="text-xs text-gray-500">Prospect responded</p>
                  </div>
                </div>
              )}
              {hasBounce && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-red-500">error</span>
                  <div>
                    <p className="text-sm font-semibold text-red-700">Bounced</p>
                    <p className="text-xs text-gray-500">Delivery failed</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email correspondence */}
      <EmailSection
        businessId={id}
        recipientEmail={business.email}
        recipientName={business.name}
      />

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

              {business.review_sentiment && (
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">AI sentiment analysis</p>
                  <p className="text-sm leading-relaxed text-blue-900">{business.review_sentiment}</p>
                </div>
              )}

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
            <ActivityTimeline activities={activities} />
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <NotesSection businessId={id} initialNotes={notes} />
    </div>
  )
}
