'use client'

import { useSidebar } from './SidebarContext'
import { cn } from '@/lib/utils/cn'

export function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <main
      className={cn(
        'min-h-[calc(100vh-3.5rem)] transition-all duration-200',
        collapsed ? 'lg:ml-16' : 'lg:ml-60'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  )
}
