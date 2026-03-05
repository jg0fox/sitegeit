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
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <span className="material-symbols-outlined text-[20px]">calendar_month</span>
          {buttonLabel}
        </a>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">videocam</span>
            Zoom
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">call</span>
            Phone
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            15 min
          </span>
        </div>
      </div>
    </section>
  )
}
