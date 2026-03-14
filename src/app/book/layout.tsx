import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a Call — Simple Instant Sites',
  description: 'Schedule a free 15-minute call to discuss your business website.',
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          :focus-visible {
            outline: 2px solid #2563eb;
            outline-offset: 2px;
          }
          a:focus:not(:focus-visible),
          button:focus:not(:focus-visible) {
            outline: none;
          }
        ` }} />

        <div className="min-h-screen bg-white">
          {/* Header */}
          <header
            className="text-white"
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' }}
          >
            <div
              className="mx-auto flex items-center justify-between"
              style={{ maxWidth: '1120px', padding: '1rem clamp(1rem, 0.5rem + 2vw, 2rem)' }}
            >
              <span
                className="font-bold text-white"
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 'clamp(1.15rem, 1.05rem + 0.5vw, 1.25rem)',
                }}
              >
                Simple Instant Sites
              </span>
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span className="hidden items-center gap-1.5 sm:flex">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  15 min
                </span>
                <span className="hidden items-center gap-1.5 sm:flex">
                  <span className="material-symbols-outlined text-[16px]">videocam</span>
                  Zoom
                </span>
                <span className="hidden items-center gap-1.5 sm:flex">
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  Phone
                </span>
              </div>
            </div>
          </header>

          {children}

          {/* Footer */}
          <footer className="border-t border-slate-100 py-6 text-center">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} Simple Instant Sites
            </p>
          </footer>
        </div>
      </body>
    </html>
  )
}
