interface LandingHeroProps {
  headline: string
  subheadline: string
  businessName: string
  bookingUrl?: string
}

export function LandingHero({ headline, subheadline, businessName, bookingUrl }: LandingHeroProps) {
  return (
    <section
      className="px-4 text-center text-white"
      style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
        padding: 'clamp(4rem, 6vw, 8rem) 0',
      }}
    >
      <div className="mx-auto max-w-2xl" style={{ padding: '0 clamp(1rem, 0.5rem + 2vw, 2rem)' }}>
        <p
          className="mb-3 text-sm font-medium uppercase text-white/80"
          style={{ letterSpacing: '0.08em' }}
        >
          Built for {businessName}
        </p>
        <h1
          className="mb-4 font-bold text-white"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 'clamp(2.2rem, 1.6rem + 3vw, 3rem)',
            lineHeight: 1.15,
          }}
        >
          {headline}
        </h1>
        <p
          className="text-white/85"
          style={{
            fontSize: 'clamp(1.05rem, 1rem + 0.25vw, 1.125rem)',
            lineHeight: 1.65,
          }}
        >
          {subheadline}
        </p>

        {bookingUrl && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-blue-600 shadow-sm transition-all hover:-translate-y-px hover:bg-blue-50 hover:shadow-md"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
              Book a Free Call
            </a>
            <a
              href="#site-preview"
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-6 py-3 font-medium text-white transition-all hover:border-white hover:bg-white/10"
            >
              See Your Site
              <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
