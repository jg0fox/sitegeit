'use client'

import { useRef, useState, useEffect } from 'react'

interface LandingSitePreviewProps {
  intro: string
  siteUrl: string
  screenshotAlt: string
  landingSlug?: string
}

export function LandingSitePreview({ intro, siteUrl, screenshotAlt, landingSlug }: LandingSitePreviewProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const iframeWidth = 1400
  const iframeHeight = 900

  useEffect(() => {
    function updateScale() {
      if (wrapRef.current) {
        const containerWidth = wrapRef.current.offsetWidth
        setScale(containerWidth / iframeWidth)
      }
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  const displayUrl = siteUrl.replace(/^https?:\/\//, '')

  return (
    <section id="site-preview" className="px-4" style={{ padding: 'clamp(3rem, 2rem + 5vw, 5rem) 1rem' }}>
      <div className="mx-auto" style={{ maxWidth: '1120px' }}>
        <p
          className="mx-auto mb-8 max-w-2xl text-center text-slate-600"
          style={{
            fontSize: 'clamp(1.05rem, 1rem + 0.25vw, 1.125rem)',
            lineHeight: 1.65,
          }}
        >
          {intro}
        </p>

        {/* Browser chrome card */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl transition-shadow hover:shadow-2xl">
          {/* Chrome bar */}
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#ff5f57' }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#febc2e' }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#28c840' }} />
            </div>
            <div className="flex-1 truncate rounded bg-white px-3 py-0.5 text-center text-xs text-slate-400" style={{ border: '1px solid #e2e8f0' }}>
              {displayUrl}
            </div>
          </div>

          {/* Scaled iframe viewport */}
          <div ref={wrapRef} className="relative overflow-hidden" style={{ height: scale * iframeHeight }}>
            <div
              style={{
                width: `${iframeWidth}px`,
                height: `${iframeHeight}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <iframe
                src={siteUrl}
                title={screenshotAlt}
                className="block border-0"
                style={{ width: `${iframeWidth}px`, height: `${iframeHeight}px`, pointerEvents: 'none' }}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>

          {/* Footer bar */}
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <span
              className="font-semibold text-slate-800"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Your new website
            </span>
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition-all hover:gap-2"
            >
              View full site
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
          </div>
        </div>

        {/* Edits reassurance */}
        <p className="mx-auto mt-6 max-w-xl text-center text-sm text-slate-500">
          <span className="material-symbols-outlined mr-1 align-middle text-slate-400" style={{ fontSize: '16px' }}>
            edit_note
          </span>
          Want to change something? Every plan — even Starter at $25/mo —
          includes one round of edits. Sign up, tell us what you&apos;d tweak,
          and we&apos;ll update it for you.
        </p>

        {/* Go live CTA */}
        {landingSlug && (
          <div className="mt-8 rounded-xl bg-blue-50 px-6 py-8 text-center" style={{ border: '1px solid #dbeafe' }}>
            <h3
              className="text-xl font-bold text-slate-900"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Ready to go live?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Choose a plan and launch your website today.
            </p>
            <a
              href={`/${landingSlug}/checkout`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:bg-blue-700 hover:shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              Go live now
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
