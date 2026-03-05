const OPTIONS = [
  {
    label: 'Web Agency',
    icon: 'corporate_fare',
    cost: '~$10,000',
    costNote: 'Year 1',
    time: '4–12 weeks',
    timeNote: 'of back-and-forth',
    ongoing: 'Pay $100+/hr',
    ongoingNote: 'for every change',
    highlighted: false,
  },
  {
    label: 'Freelancer',
    icon: 'person',
    cost: '~$3,500',
    costNote: 'Year 1',
    time: '2–6 weeks',
    timeNote: 'of project management',
    ongoing: "Hope they're available",
    ongoingNote: 'when you need changes',
    highlighted: false,
  },
  {
    label: 'DIY Website Builder',
    icon: 'web',
    cost: '~$350',
    costNote: '+ your time',
    time: '20–40 hours',
    timeNote: 'of your time',
    ongoing: 'You maintain it',
    ongoingNote: 'every month',
    highlighted: false,
  },
  {
    label: 'DIY WordPress',
    icon: 'code',
    cost: '~$300',
    costNote: '+ your time',
    time: '40–80 hours',
    timeNote: 'of your time',
    ongoing: 'You maintain it',
    ongoingNote: '+ security updates',
    highlighted: false,
  },
  {
    label: 'Sitegeit',
    icon: 'bolt',
    cost: '$300/yr',
    costNote: 'just $25/mo',
    time: 'Zero hours',
    timeNote: 'Ready in minutes',
    ongoing: 'We handle everything',
    ongoingNote: 'updates included',
    highlighted: true,
  },
]

export function LandingCostComparison() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        {/* Headline */}
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            What getting online actually costs
          </h2>
          <p className="mt-2 text-gray-600">
            Most business owners think a website is expensive. It doesn&apos;t have to be.
          </p>
        </div>

        {/* Desktop: 5-column comparison */}
        <div className="hidden lg:grid lg:grid-cols-5 lg:gap-3">
          {OPTIONS.map((opt) => (
            <div
              key={opt.label}
              className={`rounded-xl border-2 p-5 ${
                opt.highlighted
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              {/* Header */}
              <div className="mb-4 flex items-center gap-2">
                <span
                  className={`material-symbols-outlined text-[20px] ${
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

              {/* Year 1 cost */}
              <div className="mb-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Year 1 cost
                </p>
                <p
                  className={`mt-1 text-xl font-bold ${
                    opt.highlighted ? 'text-blue-600' : 'text-gray-900'
                  }`}
                >
                  {opt.cost}
                </p>
                <p className="text-xs text-gray-500">{opt.costNote}</p>
              </div>

              {/* Time investment */}
              <div className="mb-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Your time
                </p>
                <p
                  className={`mt-1 text-sm font-semibold ${
                    opt.highlighted ? 'text-blue-900' : 'text-gray-800'
                  }`}
                >
                  {opt.time}
                </p>
                <p className="text-xs text-gray-500">{opt.timeNote}</p>
              </div>

              {/* Ongoing */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Ongoing work
                </p>
                <p
                  className={`mt-1 text-sm font-semibold ${
                    opt.highlighted ? 'text-blue-900' : 'text-gray-800'
                  }`}
                >
                  {opt.ongoing}
                </p>
                <p className="text-xs text-gray-500">{opt.ongoingNote}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: stacked cards */}
        <div className="space-y-3 lg:hidden">
          {OPTIONS.map((opt) => (
            <div
              key={opt.label}
              className={`rounded-xl border-2 p-4 ${
                opt.highlighted
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              {/* Header row */}
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`material-symbols-outlined text-[20px] ${
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

              {/* 3 data points in a row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                    Year 1 cost
                  </p>
                  <p
                    className={`text-base font-bold ${
                      opt.highlighted ? 'text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    {opt.cost}
                  </p>
                  <p className="text-[11px] text-gray-500">{opt.costNote}</p>
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
                  <p className="text-[11px] text-gray-500">{opt.timeNote}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                    Ongoing
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      opt.highlighted ? 'text-blue-900' : 'text-gray-800'
                    }`}
                  >
                    {opt.ongoing}
                  </p>
                  <p className="text-[11px] text-gray-500">{opt.ongoingNote}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Time value callout */}
        <div className="mt-8 rounded-xl bg-gray-50 px-6 py-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            The hidden cost of &ldquo;doing it yourself&rdquo;
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-600">
            The average business owner&apos;s time is worth $50–60/hour.
            Building your own website takes 20–40 hours. That&apos;s{' '}
            <span className="text-lg font-bold text-gray-900">$1,000–$2,400</span>{' '}
            of your time — time you could spend on the work that actually grows
            your business.
          </p>
        </div>
      </div>
    </section>
  )
}
