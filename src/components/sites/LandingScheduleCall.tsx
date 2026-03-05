interface LandingScheduleCallProps {
  businessName: string
  buttonUrl: string
}

export function LandingScheduleCall({ businessName, buttonUrl }: LandingScheduleCallProps) {
  return (
    <section className="bg-blue-600 px-4 py-14 text-white">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Let&apos;s talk about your website
        </h2>
        <p className="mt-3 text-blue-100">
          Have questions about {businessName}&apos;s new site? Schedule a free
          15-minute call — by phone or Zoom, whatever works for you.
        </p>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href={buttonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            Schedule a call
          </a>
        </div>

        <div className="mt-5 flex items-center justify-center gap-6 text-sm text-blue-200">
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
