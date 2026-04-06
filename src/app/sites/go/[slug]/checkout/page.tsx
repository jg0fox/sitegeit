'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

const TIER_DETAILS: Record<string, { name: string; price: number; features: string[] }> = {
  starter: {
    name: 'Starter',
    price: 25,
    features: [
      'Multi-page website (Home, About, Services, Contact, FAQ)',
      'Mobile-responsive design',
      'SEO-optimized content',
      'Contact form',
      'Google Business integration',
      'Monthly hosting & maintenance',
    ],
  },
  growth: {
    name: 'Growth',
    price: 50,
    features: [
      'Everything in Starter',
      'Appointment scheduling page',
      'Review showcase widget',
      'Priority support',
      'Monthly performance report',
      'Social media links integration',
    ],
  },
  pro: {
    name: 'Pro',
    price: 75,
    features: [
      'Everything in Growth',
      'Custom domain setup',
      'Advanced SEO & local search',
      'Blog / news section',
      'Email marketing integration',
      'Quarterly strategy call',
    ],
  },
  premium: {
    name: 'Premium',
    price: 100,
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'A/B testing & conversion optimization',
      'Analytics dashboard',
      'Priority feature requests',
      'Monthly strategy call',
    ],
  },
}

export default function CheckoutPage() {
  const params = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const slug = params.slug
  const tierKey = (searchParams.get('tier') || 'starter').toLowerCase()
  const tier = TIER_DETAILS[tierKey]
  const [loading, setLoading] = useState(false)

  if (!tier) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-lg text-slate-600">Invalid tier selected.</p>
          <Link
            href={`/${slug}`}
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Back to pricing
          </Link>
        </div>
      </div>
    )
  }

  async function handleSubscribe() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: null, tier: tierKey, slug }),
      })

      const data = await res.json()

      if (res.ok && data.url) {
        window.location.href = data.url
        return
      }

      alert(data.error || 'Failed to start checkout. Please try again.')
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header
        className="text-white"
        style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' }}
      >
        <div
          className="mx-auto flex items-center justify-between"
          style={{ maxWidth: '960px', padding: '1rem clamp(1rem, 0.5rem + 2vw, 2rem)' }}
        >
          <Link
            href={`/${slug}`}
            className="flex items-center gap-1.5 text-sm text-white/80 transition-colors hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to pricing
          </Link>
          <span className="flex items-center gap-1.5 text-sm text-white/80">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            Secure checkout
          </span>
        </div>
      </header>

      {/* Main content */}
      <main
        className="mx-auto"
        style={{ maxWidth: '960px', padding: '2.5rem clamp(1rem, 0.5rem + 2vw, 2rem)' }}
      >
        <div className="grid gap-8 md:grid-cols-5">
          {/* Order summary */}
          <div className="md:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2
                className="text-slate-900"
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: '1.25rem',
                  fontWeight: 600,
                }}
              >
                Order summary
              </h2>

              <div className="mt-4 flex items-baseline justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="font-semibold text-slate-900">{tier.name} Plan</p>
                  <p className="text-sm text-slate-500">Billed monthly</p>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  ${tier.price}<span className="text-sm font-normal text-slate-400">/mo</span>
                </p>
              </div>

              <ul className="mt-4 space-y-2">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined mt-px text-[16px] text-emerald-500">
                      check_circle
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-baseline justify-between border-t border-slate-100 pt-4">
                <p className="font-semibold text-slate-900">Total today</p>
                <p className="text-xl font-bold text-slate-900">${tier.price}</p>
              </div>
            </div>
          </div>

          {/* Payment section */}
          <div className="md:col-span-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2
                className="text-slate-900"
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: '1.25rem',
                  fontWeight: 600,
                }}
              >
                Get started
              </h2>

              <p className="mt-3 text-sm text-slate-600">
                Click below to proceed to our secure payment page powered by Stripe.
                You can cancel anytime from your billing dashboard.
              </p>

              {/* Trust signals */}
              <div className="mt-6 space-y-3">
                {[
                  { icon: 'lock', text: 'Secure payment via Stripe — your card details never touch our servers' },
                  { icon: 'autorenew', text: 'Cancel anytime — no long-term contracts or cancellation fees' },
                  { icon: 'support_agent', text: 'Questions? Book a free call and we\'ll walk you through everything' },
                ].map((item) => (
                  <div key={item.icon} className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-0.5 text-[20px] text-blue-600">
                      {item.icon}
                    </span>
                    <p className="text-sm text-slate-600">{item.text}</p>
                  </div>
                ))}
              </div>

              {/* Subscribe CTA */}
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0"
                style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' }}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Redirecting to Stripe...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">credit_card</span>
                    Subscribe — ${tier.price}/mo
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs text-slate-400">
                No commitment required. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6 text-center">
        <p className="text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Simple Instant Sites. Secure payments powered by Stripe.
        </p>
      </footer>
    </div>
  )
}
