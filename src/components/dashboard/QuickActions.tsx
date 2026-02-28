import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

export async function QuickActions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let reviewCount = 0
  let respondedCount = 0

  if (user) {
    const { count: rc } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'review_ready')
    reviewCount = rc ?? 0

    const { count: rsc } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'responded')
    respondedCount = rsc ?? 0
  }

  const actions = [
    {
      label: 'New search',
      href: '/discover',
      icon: 'travel_explore',
      variant: 'default' as const,
      badge: 0,
    },
    {
      label: 'Review drafts',
      href: '/email-review',
      icon: 'rate_review',
      badge: reviewCount,
      variant: 'outline' as const,
    },
    {
      label: 'View responses',
      href: '/pipeline',
      icon: 'forum',
      badge: respondedCount,
      variant: 'outline' as const,
    },
  ]

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-gray-900">
        Quick actions
      </h2>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button key={action.label} variant={action.variant} asChild>
            <Link href={action.href} className="relative">
              <span className="material-symbols-outlined text-[18px]">
                {action.icon}
              </span>
              {action.label}
              {action.badge > 0 && (
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
