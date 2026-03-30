import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const STAGE_CONFIG = [
  { status: 'discovered', label: 'Discovered', icon: 'search', color: 'text-gray-500', bg: 'bg-gray-50' },
  { status: 'enriching', label: 'Enriching', icon: 'auto_awesome', color: 'text-blue-500', bg: 'bg-blue-50' },
  { status: 'generating', label: 'Generating', icon: 'web', color: 'text-purple-500', bg: 'bg-purple-50' },
  { status: 'review_ready', label: 'Ready for Review', icon: 'rate_review', color: 'text-amber-500', bg: 'bg-amber-50' },
  { status: 'sent', label: 'Sent', icon: 'send', color: 'text-primary', bg: 'bg-primary-light' },
  { status: 'responded', label: 'Responded', icon: 'forum', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { status: 'meeting_scheduled', label: 'Meeting Scheduled', icon: 'event', color: 'text-green-600', bg: 'bg-green-50' },
] as const

export async function PipelineSummary() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const stages = await Promise.all(
    STAGE_CONFIG.map(async (stage) => {
      if (!user) return { ...stage, count: 0 }
      const { count } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', stage.status)
      return { ...stage, count: count ?? 0 }
    })
  )

  const total = stages.reduce((sum, s) => sum + s.count, 0)

  if (total === 0) {
    return null
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-gray-900">Pipeline overview</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {stages.map((stage) => (
          <Link key={stage.label} href={`/businesses?status=${stage.status}`}>
            <Card className="flex cursor-pointer flex-col items-center px-3 py-4 transition-shadow hover:shadow-md">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  stage.bg
                )}
              >
                <span
                  className={cn(
                    'material-symbols-outlined text-[20px]',
                    stage.color
                  )}
                >
                  {stage.icon}
                </span>
              </div>
              <span className="mt-2 text-2xl font-bold text-gray-900">
                {stage.count}
              </span>
              <span className="mt-0.5 text-center text-xs text-gray-500">
                {stage.label}
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
