interface LandingScheduleCallProps {
  businessName: string
  buttonUrl: string
}

export function LandingScheduleCall({ businessName, buttonUrl }: LandingScheduleCallProps) {
  return (
    <section
      className="text-center text-white"
      style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
        padding: 'clamp(3rem, 2rem + 5vw, 5rem) 0',
      }}
    >
      <div className="mx-auto max-w-xl" style={{ padding: '0 clamp(1rem, 0.5rem + 2vw, 2rem)' }}>
        <h2
          className="mb-3 font-bold text-white"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 'clamp(1.9rem, 1.5rem + 2vw, 2.25rem)',
            lineHeight: 1.15,
          }}
        >
          Let&apos;s talk about your website
        </h2>
        <p
          className="mb-8 text-white/85"
          style={{
            fontSize: 'clamp(1.05rem, 1rem + 0.25vw, 1.125rem)',
            lineHeight: 1.65,
          }}
        >
          Have questions about {businessName}&apos;s new site? There&apos;s no pitch,
          no pressure — just a quick 15-minute call to see if we&apos;re a good fit.
        </p>

        <a
          href={buttonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 font-bold text-blue-600 shadow-sm transition-all hover:-translate-y-px hover:bg-blue-50 hover:shadow-lg"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 'clamp(1.05rem, 1rem + 0.25vw, 1.125rem)',
          }}
        >
          <span className="material-symbols-outlined text-[22px]">calendar_month</span>
          Schedule a Free Call
        </a>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
          {[
            { icon: 'videocam', label: 'Zoom' },
            { icon: 'call', label: 'Phone' },
            { icon: 'schedule', label: '15 min' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                <span className="material-symbols-outlined text-[24px] text-white">{icon}</span>
              </div>
              <span className="text-sm font-medium text-white/80">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
