'use client'

import { usePathname } from 'next/navigation'
import { useSidebar } from './SidebarContext'
import { NotificationBell } from './NotificationBell'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { useUser } from '@/lib/hooks/useUser'
import { cn } from '@/lib/utils/cn'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/discover': 'Discover',
  '/businesses': 'Businesses',
  '/settings': 'Settings',
  '/notifications': 'Notifications',
  '/email-review': 'Email Review',
}

export function Header() {
  const pathname = usePathname()
  const { toggle, toggleMobile, collapsed } = useSidebar()
  const { user } = useUser()

  const title =
    PAGE_TITLES[pathname] ??
    (pathname.startsWith('/businesses/') ? 'Business Detail' :
     pathname.startsWith('/settings/') ? 'Settings' : 'Simple Instant Site')

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 transition-all duration-200',
        collapsed ? 'lg:pl-20' : 'lg:pl-64'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={toggleMobile}
          className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Open navigation"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={toggle}
          className="hidden h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {collapsed ? 'menu_open' : 'menu'}
          </span>
        </button>

        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />

        {/* User avatar (desktop) */}
        <div className="hidden lg:flex">
          <UserAvatar fullName={user?.full_name} avatarUrl={user?.avatar_url} size="md" />
        </div>
      </div>
    </header>
  )
}
