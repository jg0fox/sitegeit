import Link from 'next/link'

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

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tier?: string }>
}) {
  const { slug } = await params
  const { tier: tierKey } = await searchParams
  const tier = TIER_DETAILS[(tierKey || 'starter').toLowerCase()]

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
                Payment details
              </h2>

              {/* Placeholder form fields */}
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Cardholder name
                  </label>
                  <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400">
                    John Doe
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Card number
                  </label>
                  <div className="mt-1 flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400">
                    <span className="material-symbols-outlined mr-2 text-[18px] text-slate-300">
                      credit_card
                    </span>
                    0000 0000 0000 0000
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Expiration
                    </label>
                    <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400">
                      MM / YY
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      CVC
                    </label>
                    <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400">
                      123
                    </div>
                  </div>
                </div>
              </div>

              {/* Coming soon notice */}
              <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-[20px] text-blue-600">
                    info
                  </span>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Secure checkout is being set up
                    </p>
                    <p className="mt-1 text-sm text-blue-700">
                      In the meantime, book a free call and we&apos;ll get you started right away.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link
                href={`/book?ref=${slug}`}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
                style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' }}
              >
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                Book a free call to get started
              </Link>

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
