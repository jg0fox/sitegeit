interface LandingSitePreviewProps {
  intro: string
  siteUrl: string
  screenshotAlt: string
}

export function LandingSitePreview({ intro, siteUrl, screenshotAlt }: LandingSitePreviewProps) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <p className="mb-6 text-center text-lg text-gray-600">{intro}</p>

      {/* Site preview iframe */}
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 rounded bg-white px-3 py-1 text-center text-xs text-gray-500">
            {siteUrl}
          </div>
        </div>

        {/* Iframe preview */}
        <iframe
          src={siteUrl}
          title={screenshotAlt}
          className="h-[500px] w-full border-0"
          loading="lazy"
        />
      </div>

      <div className="mt-4 text-center">
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
        >
          View full site
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            open_in_new
          </span>
        </a>
      </div>
    </section>
  )
}
