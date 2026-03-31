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
          href="https://fonts.googleapis.com/css2?family=Epilogue:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&family=Source+Sans+3:wght@400;500;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
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
          {children}
        </div>
      </body>
    </html>
  )
}
