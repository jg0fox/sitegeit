'use client'

import { useState } from 'react'

const OPTIONS = [
  {
    label: 'Web Agency',
    icon: 'corporate_fare',
    cost: '$8,000–$15,000',
    costNote: 'Year 1 total',
    time: '4–12 weeks',
    timeNote: 'of back-and-forth',
    ongoing: 'Pay $100+/hr',
    ongoingNote: 'for every change',
    highlighted: false,
  },
  {
    label: 'Freelancer',
    icon: 'person',
    cost: '$3,000–$6,000',
    costNote: 'Year 1 total',
    time: '2–6 weeks',
    timeNote: 'of project management',
    ongoing: "Hope they're available",
    ongoingNote: 'when you need changes',
    highlighted: false,
  },
  {
    label: 'WordPress DIY',
    icon: 'code',
    cost: '$2,000–$4,500',
    costNote: 'incl. your time*',
    time: '40–80 hours',
    timeNote: 'of your time',
    ongoing: 'You maintain it',
    ongoingNote: '+ security updates',
    highlighted: false,
  },
  {
    label: 'Squarespace DIY',
    icon: 'web',
    cost: '$1,500–$3,000',
    costNote: 'incl. your time*',
    time: '20–40 hours',
    timeNote: 'of your time',
    ongoing: 'You maintain it',
    ongoingNote: 'every month',
    highlighted: false,
  },
  {
    label: 'Sitegeit',
    icon: 'bolt',
    cost: '$300–$600',
    costNote: 'Year 1 total',
    time: 'Zero hours',
    timeNote: 'Ready in minutes',
    ongoing: 'We handle everything',
    ongoingNote: 'updates included',
    highlighted: true,
  },
]

// Max Year 1 cost for bar width calculation (Agency high end)
const MAX_COST = 15000

function parseCostMidpoint(cost: string): number {
  const nums = cost.match(/[\d,]+/g)?.map((n) => parseInt(n.replace(/,/g, ''), 10)) || [0]
  return nums.length > 1 ? (nums[0] + nums[1]) / 2 : nums[0]
}

export function LandingCostComparison() {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-5xl">
        {/* Headline */}
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            What getting online actually costs
          </h2>
          <p className="mt-2 text-gray-600">
            Most business owners think a website is expensive. It doesn&apos;t have to be.
          </p>
        </div>

        {/* Cost bar chart — always visible */}
        <div className="space-y-3">
          {OPTIONS.map((opt) => {
            const midpoint = parseCostMidpoint(opt.cost)
            const barPct = Math.max((midpoint / MAX_COST) * 100, 4)

            return (
              <div
                key={opt.label}
                className={`flex items-center gap-4 rounded-lg px-4 py-3 ${
                  opt.highlighted ? 'bg-blue-50 ring-2 ring-blue-600' : 'bg-white'
                }`}
              >
                {/* Label */}
                <div className="flex w-36 shrink-0 items-center gap-2 sm:w-44">
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      opt.highlighted ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    {opt.icon}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      opt.highlighted ? 'text-blue-900' : 'text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </span>
                </div>

                {/* Bar */}
                <div className="flex-1">
                  <div
                    className={`h-7 rounded-md ${
                      opt.highlighted ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    style={{ width: `${barPct}%`, minWidth: '40px' }}
                  />
                </div>

                {/* Cost */}
                <div className="w-36 shrink-0 text-right sm:w-44">
                  <span
                    className={`text-sm font-bold ${
                      opt.highlighted ? 'text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    {opt.cost}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-2 text-right text-xs text-gray-400">
          *includes estimated value of owner&apos;s time
        </p>

        {/* Expandable detail cards */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {expanded ? 'Hide details' : 'See the full breakdown'}
            <span
              className={`material-symbols-outlined text-[18px] transition-transform ${
                expanded ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>
        </div>

        {expanded && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {OPTIONS.map((opt) => (
              <div
                key={opt.label}
                className={`rounded-xl border-2 p-4 ${
                  opt.highlighted
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      opt.highlighted ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    {opt.icon}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      opt.highlighted ? 'text-blue-900' : 'text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                      Year 1 cost
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        opt.highlighted ? 'text-blue-600' : 'text-gray-900'
                      }`}
                    >
                      {opt.cost}
                    </p>
                    <p className="text-xs text-gray-500">{opt.costNote}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                      Your time
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        opt.highlighted ? 'text-blue-900' : 'text-gray-800'
                      }`}
                    >
                      {opt.time}
                    </p>
                    <p className="text-xs text-gray-500">{opt.timeNote}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                      Ongoing work
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        opt.highlighted ? 'text-blue-900' : 'text-gray-800'
                      }`}
                    >
                      {opt.ongoing}
                    </p>
                    <p className="text-xs text-gray-500">{opt.ongoingNote}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Time value callout */}
        <div className="mt-8 rounded-xl bg-white px-6 py-6 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            The hidden cost of &ldquo;doing it yourself&rdquo;
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-600">
            The average business owner&apos;s time is worth $50–60/hour.
            Building your own website takes 20–40 hours. That&apos;s{' '}
            <span className="text-xl font-bold text-gray-900">$1,000–$2,400</span>{' '}
            of your time — time you could spend on the work that actually grows
            your business.
          </p>
        </div>
      </div>
    </section>
  )
}
