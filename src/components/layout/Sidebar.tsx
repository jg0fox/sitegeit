'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { NAV_ITEMS } from '@/lib/utils/constants'
import { useSidebar } from './SidebarContext'
import { createBrowserClient } from '@supabase/ssr'

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, mobileOpen, closeMobile } = useSidebar()
  const [pipelineCount, setPipelineCount] = useState(0)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    async function fetchCount() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { count } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'review_ready')
      setPipelineCount(count ?? 0)
    }
    fetchCount()
  }, [pathname])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-200',
          // Desktop
          collapsed ? 'lg:w-16' : 'lg:w-60',
          // Mobile: slide from left
          mobileOpen ? 'w-60 translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex h-14 items-center border-b border-gray-200 px-4',
            collapsed && 'lg:justify-center lg:px-0'
          )}
        >
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={closeMobile}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <span className="text-sm font-bold">S</span>
            </div>
            <span
              className={cn(
                'text-lg font-bold text-gray-900 transition-opacity',
                collapsed && 'lg:hidden'
              )}
            >
              Sitegeit
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={closeMobile}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-primary-light text-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                collapsed && 'lg:justify-center lg:px-0'
              )}
            >
              <span
                className={cn(
                  'material-symbols-outlined text-[20px]',
                  isActive(item.href) && 'filled'
                )}
              >
                {item.icon}
              </span>
              <span
                className={cn(
                  'transition-opacity',
                  collapsed && 'lg:hidden'
                )}
              >
                {item.label}
              </span>
              {/* Pipeline badge */}
              {item.key === 'pipeline' && pipelineCount > 0 && (
                <span
                  className={cn(
                    'ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-warning px-1.5 text-[10px] font-semibold text-white',
                    collapsed && 'lg:absolute lg:right-1 lg:top-1 lg:ml-0'
                  )}
                >
                  {pipelineCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div
          className={cn(
            'border-t border-gray-200 p-3',
            collapsed && 'lg:px-2'
          )}
        >
          <div
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2',
              collapsed && 'lg:justify-center lg:px-0'
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
              JF
            </div>
            <div className={cn('min-w-0', collapsed && 'lg:hidden')}>
              <p className="truncate text-sm font-medium text-gray-900">
                Jason Fox
              </p>
              <p className="truncate text-xs text-gray-500">
                jason@sitegeit.com
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
