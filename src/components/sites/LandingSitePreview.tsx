interface LandingSitePreviewProps {
  intro: string
  siteUrl: string
  screenshotAlt: string
  landingSlug?: string
}

export function LandingSitePreview({ intro, siteUrl, screenshotAlt, landingSlug }: LandingSitePreviewProps) {
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

      {/* Edits included reassurance */}
      <p className="mx-auto mt-6 max-w-xl text-center text-sm text-gray-500">
        <span className="material-symbols-outlined mr-1 align-middle text-gray-400" style={{ fontSize: '16px' }}>
          edit_note
        </span>
        Want to change something? Every plan — even Starter at $25/mo —
        includes one round of edits. Sign up, tell us what you&apos;d tweak,
        and we&apos;ll update it for you.
      </p>

      {/* Go live CTA */}
      {landingSlug && (
        <div className="mt-8 rounded-xl bg-blue-50 px-6 py-8 text-center">
          <h3 className="text-xl font-bold text-gray-900">Ready to go live?</h3>
          <p className="mt-2 text-sm text-gray-600">
            Choose a plan and launch your website today.
          </p>
          <a
            href={`/sites/go/${landingSlug}/checkout`}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            Go live now
          </a>
        </div>
      )}
    </section>
  )
}
