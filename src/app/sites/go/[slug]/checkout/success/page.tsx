import Link from 'next/link'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CheckoutSuccessPage({ params }: Props) {
  const { slug } = await params

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header
        className="text-white"
        style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' }}
      >
        <div
          className="mx-auto flex items-center justify-between"
          style={{ maxWidth: '960px', padding: '1rem clamp(1rem, 0.5rem + 2vw, 2rem)' }}
        >
          <span
            className="font-bold text-white"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.15rem' }}
          >
            Simple Instant Sites
          </span>
          <span className="flex items-center gap-1.5 text-sm text-white/80">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Payment confirmed
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mb-6 flex justify-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <span
              className="material-symbols-outlined text-[40px] text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
        </div>

        <h1
          className="text-slate-900"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 'clamp(1.75rem, 1.5rem + 1.5vw, 2.25rem)',
            fontWeight: 700,
          }}
        >
          You&apos;re all set!
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Your website is being activated. We&apos;ll have everything live shortly.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          A confirmation email has been sent to your inbox with your subscription details.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3">
          <Link
            href={`/${slug}`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:bg-blue-700 hover:shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            View your website preview
          </Link>
          <p className="text-xs text-slate-400">
            Questions? Reply to the confirmation email and we&apos;ll get right back to you.
          </p>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-6 text-center">
        <p className="text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Simple Instant Sites
        </p>
      </footer>
    </div>
  )
}
