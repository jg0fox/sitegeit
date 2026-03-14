import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a Call — Sitegeit',
  description: 'Schedule a time to discuss your business website.',
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
