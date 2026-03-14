'use client'

import { useState } from 'react'

const OPTIONS = [
  {
    label: 'Web Agency',
    range: '$8,000–$15,000/yr',
    midpoint: 11500,
    time: '4–12 weeks',
    hidden: 'Hourly fees for every update, hosting costs, annual redesign',
    highlighted: false,
  },
  {
    label: 'Freelancer',
    range: '$3,000–$6,000/yr',
    midpoint: 4500,
    time: '2–6 weeks',
    hidden: 'Availability gaps, no support guarantee, rebuild risk if they disappear',
    highlighted: false,
  },
  {
    label: 'WordPress DIY',
    range: '$2,000–$4,500/yr',
    midpoint: 3250,
    time: '40–80 hours of your time',
    hidden: 'Plugin conflicts, security updates, hosting fees, learning curve',
    highlighted: false,
  },
  {
    label: 'Squarespace DIY',
    range: '$1,500–$3,000/yr',
    midpoint: 2250,
    time: '20–40 hours of your time',
    hidden: 'Template limitations, monthly subscription, SEO constraints',
    highlighted: false,
  },
  {
    label: 'Simple Instant Sites',
    range: '$300–$600/yr',
    midpoint: 450,
    time: 'Ready in minutes',
    hidden: 'None — everything is included',
    highlighted: true,
  },
]

const MAX_COST = 15000

export function LandingCostComparison() {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="bg-slate-50" style={{ padding: 'clamp(3rem, 2rem + 5vw, 5rem) 0' }}>
      <div className="mx-auto" style={{ maxWidth: '1120px', padding: '0 clamp(1rem, 0.5rem + 2vw, 2rem)' }}>
        {/* Heading */}
        <h2
          className="mb-3 text-center font-bold text-slate-900"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 'clamp(1.9rem, 1.5rem + 2vw, 2.25rem)',
            lineHeight: 1.15,
          }}
        >
          What getting online actually costs
        </h2>
        <p
          className="mx-auto mb-10 max-w-xl text-center text-slate-600"
          style={{
            fontSize: 'clamp(0.95rem, 0.9rem + 0.25vw, 1.0625rem)',
            lineHeight: 1.65,
          }}
        >
          Most business owners think a website is expensive. It doesn&apos;t have to be.
        </p>

        {/* Bars label */}
        <p
          className="mb-4 text-xs font-semibold uppercase text-slate-400"
          style={{ letterSpacing: '0.05em' }}
        >
          Estimated first-year cost
        </p>

        {/* Cost bar chart */}
        <div className="space-y-2.5">
          {OPTIONS.map((opt) => {
            const barPct = Math.max((opt.midpoint / MAX_COST) * 100, 4)

            return (
              <div
                key={opt.label}
                className="items-center gap-4"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr 130px',
                }}
              >
                <span
                  className={`text-sm font-medium ${opt.highlighted ? 'font-semibold text-blue-700' : 'text-slate-700'}`}
                >
                  {opt.label}
                </span>

                <div className="h-9 overflow-hidden rounded" style={{ background: '#f1f5f9' }}>
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${barPct}%`,
                      minWidth: '24px',
                      background: opt.highlighted ? '#2563eb' : '#cbd5e1',
                      transition: 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </div>

                <span
                  className={`text-right text-sm font-bold ${opt.highlighted ? 'text-blue-600' : 'text-slate-900'}`}
                >
                  {opt.range}
                </span>
              </div>
            )
          })}
        </div>

        {/* Mobile-friendly bar chart (stacked on small screens) */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media (max-width: 640px) {
            .cost-bar-row {
              grid-template-columns: 1fr !important;
              gap: 0.25rem !important;
            }
            .cost-bar-price {
              text-align: left !important;
            }
          }
        ` }} />

        {/* Toggle button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-600 transition-all hover:border-blue-600 hover:text-blue-600"
          >
            {expanded ? 'Hide details' : 'See the full breakdown'}
            <span
              className={`material-symbols-outlined text-[18px] transition-transform ${expanded ? 'rotate-180' : ''}`}
            >
              expand_more
            </span>
          </button>
        </div>

        {/* Expandable detail cards */}
        {expanded && (
          <div
            className="mt-6 grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
          >
            {OPTIONS.map((opt) => (
              <div
                key={opt.label}
                className={`rounded-lg p-5 ${
                  opt.highlighted
                    ? 'border border-blue-600 bg-blue-50'
                    : 'border border-slate-200 bg-slate-50'
                }`}
              >
                <h3 className="mb-1 text-sm font-semibold text-slate-800">{opt.label}</h3>
                <p
                  className={`text-lg font-bold ${opt.highlighted ? 'text-blue-600' : 'text-slate-900'}`}
                  style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: 'clamp(1.35rem, 1.15rem + 1vw, 1.5rem)',
                  }}
                >
                  {opt.range}
                </p>
                <div className="mt-3 space-y-1.5">
                  <p className="text-sm text-slate-600" style={{ lineHeight: 1.65 }}>
                    <strong>Timeline:</strong> {opt.time}
                  </p>
                  <p className="text-sm text-slate-600" style={{ lineHeight: 1.65 }}>
                    <strong>Hidden costs:</strong> {opt.hidden}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Amber callout box */}
        <div
          className="mt-8 flex items-start gap-4 rounded-lg border px-6 py-5"
          style={{
            background: '#fffbeb',
            borderColor: '#f59e0b',
          }}
        >
          <span
            className="material-symbols-outlined mt-0.5 shrink-0 text-[24px]"
            style={{ color: '#f59e0b' }}
          >
            schedule
          </span>
          <p className="text-slate-700" style={{ fontSize: 'clamp(0.95rem, 0.9rem + 0.25vw, 1.0625rem)', lineHeight: 1.65 }}>
            <strong className="text-slate-900">
              The average business owner&apos;s time is worth $50–60/hour.
            </strong>{' '}
            Building your own website takes 20–40 hours. That&apos;s{' '}
            <strong className="text-slate-900">$1,000–$2,400 of your time</strong> — before you even
            factor in the learning curve, plugin conflicts, and ongoing maintenance.
          </p>
        </div>
      </div>
    </section>
  )
}
