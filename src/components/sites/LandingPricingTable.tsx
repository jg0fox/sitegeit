'use client'

import { useState } from 'react'

interface LandingPricingTableProps {
  slug: string
}

interface Tier {
  name: string
  price: string
  tagline: string
  badge?: string
  highlighted?: boolean
  ctaLabel: string
  ctaUrl: string
}

interface FeatureGroup {
  name: string
  features: { name: string; tiers: boolean[] }[]
}

const TIERS: Tier[] = [
  {
    name: 'Starter',
    price: '$25',
    tagline: 'Get online',
    ctaLabel: 'Get Started',
    ctaUrl: '',
  },
  {
    name: 'Growth',
    price: '$50',
    tagline: 'Capture leads',
    badge: 'Most Popular',
    highlighted: true,
    ctaLabel: 'Get Started',
    ctaUrl: '',
  },
  {
    name: 'Pro',
    price: '$75',
    tagline: 'Automate your customer interactions',
    ctaLabel: 'Get Started',
    ctaUrl: '',
  },
  {
    name: 'Premium',
    price: '$100',
    tagline: 'Grow your business',
    badge: 'Best Value',
    ctaLabel: 'Contact Us',
    ctaUrl: '',
  },
]

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    name: 'Website & Hosting',
    features: [
      { name: 'Conversion-optimized website', tiers: [true, true, true, true] },
      { name: 'SEO optimization + LocalBusiness schema', tiers: [true, true, true, true] },
      { name: 'Mobile responsive + SSL + fast hosting', tiers: [true, true, true, true] },
      { name: 'Basic contact form', tiers: [true, true, true, true] },
      { name: 'Monthly uptime monitoring', tiers: [true, true, true, true] },
      { name: 'One round of site edits', tiers: [true, true, true, true] },
      { name: 'Custom domain setup', tiers: [false, true, true, true] },
      { name: 'Multi-page site (services, about, FAQ)', tiers: [true, true, true, true] },
    ],
  },
  {
    name: 'Brand & Onboarding',
    features: [
      { name: 'Initial brand assessment', tiers: [true, true, true, true] },
      { name: 'Quarterly brand health check', tiers: [false, false, false, true] },
    ],
  },
  {
    name: 'Analytics & Tracking',
    features: [
      { name: 'Google Analytics + dashboard', tiers: [false, true, true, true] },
      { name: 'Monthly analytics summary email', tiers: [false, true, true, true] },
      { name: 'CTA + lead tracking', tiers: [false, true, true, true] },
      { name: 'Weekly performance reports (AI insights)', tiers: [false, false, true, true] },
    ],
  },
  {
    name: 'Lead Capture & Scheduling',
    features: [
      { name: 'Appointment scheduling integration', tiers: [false, true, true, true] },
      { name: 'Lead inbox', tiers: [false, false, true, true] },
      { name: 'AI customer portal (FAQ bot, scheduling)', tiers: [false, false, true, true] },
    ],
  },
  {
    name: 'Content & SEO',
    features: [
      { name: 'Monthly AI blog post / content update', tiers: [false, false, true, true] },
      { name: 'AI-generated social media content', tiers: [false, false, false, true] },
    ],
  },
  {
    name: 'Google Business Profile',
    features: [
      { name: 'GBP optimization recommendations', tiers: [false, true, true, true] },
      { name: 'Review monitoring + suggested responses', tiers: [false, false, true, true] },
      { name: 'Managed GBP (posts, reviews, photos)', tiers: [false, false, false, true] },
    ],
  },
  {
    name: 'Growth & Strategy',
    features: [
      { name: 'Competitor monitoring', tiers: [false, false, false, true] },
      { name: 'Quarterly growth experiment plan', tiers: [false, false, false, true] },
      { name: 'Quarterly strategy call', tiers: [false, false, false, true] },
    ],
  },
]

// Show first 2 groups expanded by default
const INITIALLY_EXPANDED = 2

function CheckIcon() {
  return (
    <span className="material-symbols-outlined text-[20px] text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>
      check_circle
    </span>
  )
}

function DashIcon() {
  return <span className="text-gray-300">&mdash;</span>
}

export function LandingPricingTable({ slug }: LandingPricingTableProps) {
  const [activeTier, setActiveTier] = useState(1) // Default to Growth
  const [expanded, setExpanded] = useState(false)

  const tiers = TIERS.map((tier) => ({
    ...tier,
    ctaUrl:
      tier.name === 'Premium'
        ? `/sites/go/${slug}/checkout?tier=premium`
        : `/sites/go/${slug}/checkout?tier=${tier.name.toLowerCase()}`,
  }))

  const visibleGroups = expanded
    ? FEATURE_GROUPS
    : FEATURE_GROUPS.slice(0, INITIALLY_EXPANDED)
  const hiddenCount = FEATURE_GROUPS.length - INITIALLY_EXPANDED
  const hiddenFeatureCount = FEATURE_GROUPS.slice(INITIALLY_EXPANDED).reduce(
    (sum, g) => sum + g.features.length, 0
  )

  const colClass = 'grid grid-cols-[minmax(180px,2fr)_repeat(4,minmax(100px,1fr))]'

  return (
    <section className="bg-gray-50 px-4 py-16" id="pricing">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">
          Choose the right plan for your business
        </h2>
        <p className="mb-10 text-center text-gray-600">
          Every plan includes a professionally built website. Upgrade anytime.
        </p>

        {/* Desktop: full comparison table */}
        <div className="hidden lg:block">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {/* Tier headers */}
            <div className={`${colClass} border-b border-gray-200`}>
              <div className="p-4" />
              {tiers.map((tier, i) => (
                <div
                  key={tier.name}
                  className={`p-4 text-center ${
                    tier.highlighted
                      ? 'border-x-2 border-t-2 border-blue-600 bg-blue-50'
                      : i < tiers.length - 1
                        ? 'border-r border-gray-100'
                        : ''
                  }`}
                >
                  {tier.badge && (
                    <span
                      className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        tier.highlighted
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {tier.badge}
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
                  <p className="mt-1 text-2xl font-bold text-blue-600">
                    {tier.price}<span className="text-sm font-normal text-gray-500">/mo</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{tier.tagline}</p>
                </div>
              ))}
            </div>

            {/* Feature groups */}
            {visibleGroups.map((group) => (
              <div key={group.name}>
                {/* Group header */}
                <div className={`${colClass} border-b border-gray-200 bg-gray-50`}>
                  <div className="px-4 py-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {group.name}
                    </span>
                  </div>
                  {tiers.map((tier) => (
                    <div
                      key={tier.name}
                      className={tier.highlighted ? 'border-x-2 border-blue-600 bg-blue-50/50' : ''}
                    />
                  ))}
                </div>
                {/* Features */}
                {group.features.map((feature) => (
                  <div
                    key={feature.name}
                    className={`${colClass} border-b border-gray-100 last:border-gray-200`}
                  >
                    <div className="px-4 py-3 text-sm text-gray-700">{feature.name}</div>
                    {feature.tiers.map((included, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-center px-4 py-3 ${
                          tiers[i].highlighted ? 'border-x-2 border-blue-600 bg-blue-50/30' : ''
                        }`}
                      >
                        {included ? <CheckIcon /> : <DashIcon />}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}

            {/* Expand/collapse toggle */}
            {hiddenCount > 0 && (
              <div className={`${colClass} border-b border-gray-200`}>
                <div className="px-4 py-3">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {expanded ? 'expand_less' : 'expand_more'}
                    </span>
                    {expanded
                      ? 'Show less'
                      : `Show ${hiddenFeatureCount} more features`}
                  </button>
                </div>
                {tiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={tier.highlighted ? 'border-x-2 border-blue-600' : ''}
                  />
                ))}
              </div>
            )}

            {/* CTA row */}
            <div className={colClass}>
              <div className="p-4" />
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`p-4 text-center ${
                    tier.highlighted ? 'border-x-2 border-b-2 border-blue-600 bg-blue-50' : ''
                  }`}
                >
                  <a
                    href={tier.ctaUrl}
                    className={`inline-block w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                      tier.highlighted
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tier.ctaLabel}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: tabbed tier view */}
        <div className="lg:hidden">
          {/* Tier tabs */}
          <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
            {tiers.map((tier, i) => (
              <button
                key={tier.name}
                onClick={() => setActiveTier(i)}
                className={`flex-1 rounded-md px-2 py-2 text-center text-sm font-medium transition-colors ${
                  activeTier === i
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tier.name}
              </button>
            ))}
          </div>

          {/* Active tier card */}
          {(() => {
            const tier = tiers[activeTier]
            const mobileGroups = expanded
              ? FEATURE_GROUPS
              : FEATURE_GROUPS.slice(0, INITIALLY_EXPANDED)
            return (
              <div
                className={`overflow-hidden rounded-xl border-2 bg-white ${
                  tier.highlighted ? 'border-blue-600' : 'border-gray-200'
                }`}
              >
                {/* Tier header */}
                <div className={`p-6 text-center ${tier.highlighted ? 'bg-blue-50' : ''}`}>
                  {tier.badge && (
                    <span
                      className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        tier.highlighted
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {tier.badge}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                  <p className="mt-1 text-3xl font-bold text-blue-600">
                    {tier.price}<span className="text-base font-normal text-gray-500">/mo</span>
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{tier.tagline}</p>
                </div>

                {/* Features list */}
                <div className="divide-y divide-gray-100 px-6">
                  {mobileGroups.map((group) => {
                    const includedFeatures = group.features.filter(
                      (f) => f.tiers[activeTier]
                    )
                    if (includedFeatures.length === 0) return null

                    return (
                      <div key={group.name} className="py-4">
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          {group.name}
                        </h4>
                        <ul className="space-y-2">
                          {includedFeatures.map((feature) => (
                            <li
                              key={feature.name}
                              className="flex items-start gap-2 text-sm text-gray-700"
                            >
                              <CheckIcon />
                              <span>{feature.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}

                  {/* Expand/collapse toggle */}
                  {hiddenCount > 0 && (
                    <div className="py-4">
                      <button
                        onClick={() => setExpanded(!expanded)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {expanded ? 'expand_less' : 'expand_more'}
                        </span>
                        {expanded
                          ? 'Show less'
                          : `Show ${hiddenFeatureCount} more features`}
                      </button>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="p-6">
                  <a
                    href={tier.ctaUrl}
                    className={`block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors ${
                      tier.highlighted
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tier.ctaLabel}
                  </a>
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </section>
  )
}
