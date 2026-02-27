import Link from 'next/link'
import { Button } from '@/components/ui/button'

const ACTIONS = [
  {
    label: 'New search',
    href: '/discover',
    icon: 'travel_explore',
    variant: 'default' as const,
  },
  {
    label: 'Review drafts',
    href: '/email-review',
    icon: 'rate_review',
    badge: 3,
    variant: 'outline' as const,
  },
  {
    label: 'View responses',
    href: '/pipeline',
    icon: 'forum',
    badge: 2,
    variant: 'outline' as const,
  },
]

export function QuickActions() {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-gray-900">
        Quick actions
      </h2>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((action) => (
          <Button key={action.label} variant={action.variant} asChild>
            <Link href={action.href} className="relative">
              <span className="material-symbols-outlined text-[18px]">
                {action.icon}
              </span>
              {action.label}
              {action.badge && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-white">
                  {action.badge}
                </span>
              )}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}
