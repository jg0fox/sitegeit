interface LandingCTAProps {
  heading: string
  body: string
  buttonLabel: string
  buttonUrl: string
}

export function LandingCTA({ heading, body, buttonLabel, buttonUrl }: LandingCTAProps) {
  return (
    <section className="px-4 py-20 text-center">
      <div className="mx-auto max-w-xl">
        <h2 className="mb-3 text-2xl font-bold sm:text-3xl">{heading}</h2>
        <p className="mb-6 text-gray-600">{body}</p>
        <a
          href={buttonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
        >
          {buttonLabel}
        </a>
      </div>
    </section>
  )
}
