interface LandingHeroProps {
  headline: string
  subheadline: string
  businessName: string
}

export function LandingHero({ headline, subheadline, businessName }: LandingHeroProps) {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-blue-800 px-4 py-20 text-center text-white">
      <div className="mx-auto max-w-2xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-blue-200">
          Built for {businessName}
        </p>
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
          {headline}
        </h1>
        <p className="text-lg text-blue-100">
          {subheadline}
        </p>
      </div>
    </section>
  )
}
