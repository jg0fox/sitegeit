'use client'

import { useState, Fragment } from 'react'

interface LandingPricingTableProps {
  slug: string
}

interface Tier {
  name: string
  price: number
  tagline: string
  badge?: string
  popular?: boolean
  features: string[]
}

interface FeatureGroup {
  group: string
  features: { name: string; starter: boolean; growth: boolean; pro: boolean; premium: boolean }[]
}

const TIERS: Tier[] = [
  {
    name: 'Starter',
    price: 25,
    tagline: 'Everything you need to get online',
    features: [
      'Conversion-optimized website',
      'SEO optimization + LocalBusiness schema',
      'Mobile responsive + SSL + fast hosting',
      'Basic contact form',
      'Monthly uptime monitoring',
      'One round of site edits included',
      'Multi-page site (services, about, FAQ)',
      'Initial brand assessment',
    ],
  },
  {
    name: 'Growth',
    price: 50,
    tagline: 'Capture leads and grow your pipeline',
    badge: 'Most Popular',
    popular: true,
    features: [
      'Conversion-optimized website',
      'SEO optimization + LocalBusiness schema',
      'Mobile responsive + SSL + fast hosting',
      'Basic contact form',
      'Monthly uptime monitoring',
      'One round of site edits included',
      'Multi-page site (services, about, FAQ)',
      'Initial brand assessment',
      'Custom domain setup',
      'Google Analytics + dashboard',
      'Monthly analytics summary email',
      'CTA + lead tracking',
      'Appointment scheduling integration',
      'GBP optimization recommendations',
    ],
  },
  {
    name: 'Pro',
    price: 75,
    tagline: 'Automate your customer interactions',
    features: [
      'Conversion-optimized website',
      'SEO optimization + LocalBusiness schema',
      'Mobile responsive + SSL + fast hosting',
      'Basic contact form',
      'Monthly uptime monitoring',
      'One round of site edits included',
      'Multi-page site (services, about, FAQ)',
      'Initial brand assessment',
      'Custom domain setup',
      'Google Analytics + dashboard',
      'Monthly analytics summary email',
      'CTA + lead tracking',
      'Weekly performance reports (AI insights)',
      'Appointment scheduling integration',
      'Lead inbox',
      'AI customer portal (FAQ bot, scheduling)',
      'Monthly AI blog post / content update',
      'GBP optimization recommendations',
      'Review monitoring + suggested responses',
    ],
  },
  {
    name: 'Premium',
    price: 100,
    tagline: 'Full-service growth for your business',
    badge: 'Best Value',
    features: [
      'Conversion-optimized website',
      'SEO optimization + LocalBusiness schema',
      'Mobile responsive + SSL + fast hosting',
      'Basic contact form',
      'Monthly uptime monitoring',
      'One round of site edits included',
      'Multi-page site (services, about, FAQ)',
      'Initial brand assessment',
      'Custom domain setup',
      'Google Analytics + dashboard',
      'Monthly analytics summary email',
      'CTA + lead tracking',
      'Weekly performance reports (AI insights)',
      'Appointment scheduling integration',
      'Lead inbox',
      'AI customer portal (FAQ bot, scheduling)',
      'Monthly AI blog post / content update',
      'AI-generated social media content',
      'GBP optimization recommendations',
      'Review monitoring + suggested responses',
      'Managed GBP (posts, reviews, photos)',
      'Quarterly brand health check',
      'Competitor monitoring',
      'Quarterly growth experiment plan',
      'Quarterly strategy call',
    ],
  },
]

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    group: 'Website & Hosting',
    features: [
      { name: 'Conversion-optimized website', starter: true, growth: true, pro: true, premium: true },
      { name: 'SEO optimization + LocalBusiness schema', starter: true, growth: true, pro: true, premium: true },
      { name: 'Mobile responsive + SSL + fast hosting', starter: true, growth: true, pro: true, premium: true },
      { name: 'Basic contact form', starter: true, growth: true, pro: true, premium: true },
      { name: 'Monthly uptime monitoring', starter: true, growth: true, pro: true, premium: true },
      { name: 'One round of site edits', starter: true, growth: true, pro: true, premium: true },
      { name: 'Custom domain setup', starter: false, growth: true, pro: true, premium: true },
      { name: 'Multi-page site (services, about, FAQ)', starter: true, growth: true, pro: true, premium: true },
    ],
  },
  {
    group: 'Brand & Onboarding',
    features: [
      { name: 'Initial brand assessment', starter: true, growth: true, pro: true, premium: true },
      { name: 'Quarterly brand health check', starter: false, growth: false, pro: false, premium: true },
    ],
  },
  {
    group: 'Analytics & Tracking',
    features: [
      { name: 'Google Analytics + dashboard', starter: false, growth: true, pro: true, premium: true },
      { name: 'Monthly analytics summary email', starter: false, growth: true, pro: true, premium: true },
      { name: 'CTA + lead tracking', starter: false, growth: true, pro: true, premium: true },
      { name: 'Weekly performance reports (AI insights)', starter: false, growth: false, pro: true, premium: true },
    ],
  },
  {
    group: 'Lead Capture & Scheduling',
    features: [
      { name: 'Appointment scheduling integration', starter: false, growth: true, pro: true, premium: true },
      { name: 'Lead inbox', starter: false, growth: false, pro: true, premium: true },
      { name: 'AI customer portal (FAQ bot, scheduling)', starter: false, growth: false, pro: true, premium: true },
    ],
  },
  {
    group: 'Content & SEO',
    features: [
      { name: 'Monthly AI blog post / content update', starter: false, growth: false, pro: true, premium: true },
      { name: 'AI-generated social media content', starter: false, growth: false, pro: false, premium: true },
    ],
  },
]

const TIER_KEYS = ['starter', 'growth', 'pro', 'premium'] as const
const INITIALLY_VISIBLE_GROUPS = 2

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <span
      className={`material-symbols-outlined text-[18px] text-emerald-500 ${className}`}
      style={{ fontVariationSettings: "'FILL' 1" }}
    >
      check_circle
    </span>
  )
}

function DashIcon() {
  return (
    <span className="material-symbols-outlined text-[18px] text-slate-300">
      horizontal_rule
    </span>
  )
}

export function LandingPricingTable({ slug }: LandingPricingTableProps) {
  const [activeTab, setActiveTab] = useState(1) // Growth default
  const [tableExpanded, setTableExpanded] = useState(false)

  const getCtaUrl = (tierName: string) =>
    `/${slug}/checkout?tier=${tierName.toLowerCase()}`

  const visibleGroups = tableExpanded
    ? FEATURE_GROUPS
    : FEATURE_GROUPS.slice(0, INITIALLY_VISIBLE_GROUPS)
  const hiddenGroupCount = FEATURE_GROUPS.length - INITIALLY_VISIBLE_GROUPS

  return (
    <>
      {/* ========== PRICING CARDS ========== */}
      <section className="bg-slate-50" style={{ padding: 'clamp(3rem, 2rem + 5vw, 5rem) 0' }}>
        <div className="mx-auto" style={{ maxWidth: '1120px', padding: '0 clamp(1rem, 0.5rem + 2vw, 2rem)' }}>
          <h2
            className="mb-2 text-center font-bold text-slate-900"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 'clamp(1.9rem, 1.5rem + 2vw, 2.25rem)',
              lineHeight: 1.15,
            }}
          >
            Simple, transparent pricing
          </h2>
          <p
            className="mb-10 text-center text-slate-600"
            style={{ fontSize: 'clamp(0.95rem, 0.9rem + 0.25vw, 1.0625rem)' }}
          >
            No contracts. No setup fees. Cancel anytime.
          </p>

          {/* Mobile: tab switcher */}
          <div className="mb-6 flex gap-1 overflow-x-auto min-[900px]:hidden">
            {TIERS.map((tier, i) => (
              <button
                key={tier.name}
                onClick={() => setActiveTab(i)}
                className={`flex-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === i
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-800'
                }`}
              >
                {tier.name}
              </button>
            ))}
          </div>

          {/* Mobile: single active card */}
          <div className="min-[900px]:hidden">
            <PricingCard tier={TIERS[activeTab]} ctaUrl={getCtaUrl(TIERS[activeTab].name)} />
          </div>

          {/* Desktop: 4-column grid */}
          <div className="hidden gap-6 min-[900px]:grid min-[900px]:grid-cols-4">
            {TIERS.map((tier) => (
              <PricingCard key={tier.name} tier={tier} ctaUrl={getCtaUrl(tier.name)} />
            ))}
          </div>
        </div>
      </section>

      {/* ========== COMPARISON TABLE ========== */}
      <section style={{ padding: 'clamp(2rem, 1rem + 3vw, 3rem) 0 clamp(3rem, 2rem + 5vw, 5rem)' }}>
        <div className="mx-auto" style={{ maxWidth: '1120px', padding: '0 clamp(1rem, 0.5rem + 2vw, 2rem)' }}>
          <h2
            className="mb-8 text-center font-bold text-slate-900"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 'clamp(1.6rem, 1.3rem + 1.5vw, 1.875rem)',
              lineHeight: 1.15,
            }}
          >
            Compare plans in detail
          </h2>

          {/* Mobile note */}
          <p className="mb-4 text-center text-sm text-slate-400 min-[900px]:hidden">
            Switch between plans above to compare features on mobile.
          </p>

          {/* Desktop table */}
          <div className="hidden min-[900px]:block">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th
                    className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900"
                    style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(0.95rem, 0.9rem + 0.25vw, 1.0625rem)' }}
                  >
                    Feature
                  </th>
                  {TIERS.map((tier) => (
                    <th
                      key={tier.name}
                      className={`border-b border-slate-200 px-4 py-3 text-center text-sm font-semibold ${
                        tier.popular ? 'bg-blue-50 text-blue-600' : 'text-slate-900'
                      }`}
                      style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(0.95rem, 0.9rem + 0.25vw, 1.0625rem)' }}
                    >
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleGroups.map((group) => (
                  <Fragment key={group.group}>
                    <tr>
                      <td
                        colSpan={5}
                        className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700"
                        style={{ paddingTop: '1.5rem' }}
                      >
                        {group.group}
                      </td>
                    </tr>
                    {group.features.map((feat) => (
                      <tr key={feat.name}>
                        <td className="border-b border-slate-100 px-4 py-2.5 text-sm font-medium text-slate-600">
                          {feat.name}
                        </td>
                        {TIER_KEYS.map((key) => (
                          <td
                            key={key}
                            className={`border-b border-slate-100 px-4 py-2.5 text-center ${
                              key === 'growth' ? 'bg-blue-50/50' : ''
                            }`}
                          >
                            {feat[key] ? <CheckIcon /> : <DashIcon />}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>

            {/* Expand toggle */}
            {hiddenGroupCount > 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setTableExpanded(!tableExpanded)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-600 transition-all hover:border-blue-600 hover:text-blue-600"
                >
                  {tableExpanded ? 'Show less' : `Show ${hiddenGroupCount} more categories`}
                  <span
                    className={`material-symbols-outlined text-[18px] transition-transform ${
                      tableExpanded ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function PricingCard({ tier, ctaUrl }: { tier: Tier; ctaUrl: string }) {
  return (
    <div
      className={`relative flex flex-col rounded-xl border bg-white transition-shadow hover:shadow-lg ${
        tier.popular ? 'border-blue-600 shadow-md' : 'border-slate-200'
      }`}
      style={{ padding: tier.badge ? '2.5rem 1.5rem 2rem' : '2rem 1.5rem' }}
    >
      {/* Badge */}
      {tier.badge && (
        <span
          className={`absolute left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-semibold uppercase ${
            tier.badge === 'Best Value'
              ? 'bg-amber-500 text-slate-900'
              : 'bg-blue-600 text-white'
          }`}
          style={{ top: '-0.625rem', letterSpacing: '0.05em' }}
        >
          {tier.badge}
        </span>
      )}

      {/* Tier name */}
      <h3
        className="mt-2 text-slate-900"
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 'clamp(1.15rem, 1.05rem + 0.5vw, 1.25rem)',
          fontWeight: 600,
        }}
      >
        {tier.name}
      </h3>

      {/* Price */}
      <p className="mt-1">
        <span
          className="font-bold text-slate-900"
          style={{
            fontSize: 'clamp(1.9rem, 1.5rem + 2vw, 2.25rem)',
          }}
        >
          ${tier.price}
        </span>
        <span className="text-sm font-normal text-slate-400">/mo</span>
      </p>

      {/* Tagline */}
      <p
        className="mt-1 border-b border-slate-200 pb-5 text-sm text-slate-600"
        style={{ lineHeight: 1.3 }}
      >
        {tier.tagline}
      </p>

      {/* Features */}
      <ul className="mt-5 flex flex-1 flex-col gap-2.5">
        {tier.features.map((feat) => (
          <li key={feat} className="flex items-start gap-2 text-sm text-slate-600" style={{ lineHeight: 1.3 }}>
            <CheckIcon className="mt-px shrink-0" />
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href={ctaUrl}
        className={`mt-6 block rounded-lg px-4 py-3 text-center font-semibold transition-all ${
          tier.popular
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
        }`}
        style={{ fontSize: 'clamp(0.95rem, 0.9rem + 0.25vw, 1.0625rem)' }}
      >
        Get started
      </a>
    </div>
  )
}
