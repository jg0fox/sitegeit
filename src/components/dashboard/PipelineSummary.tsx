import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

const STAGES = [
  { label: 'Discovered', count: 24, icon: 'search', color: 'text-gray-500', bg: 'bg-gray-50' },
  { label: 'Enriching', count: 5, icon: 'auto_awesome', color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Generating', count: 3, icon: 'web', color: 'text-purple-500', bg: 'bg-purple-50' },
  { label: 'Ready for Review', count: 8, icon: 'rate_review', color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Sent', count: 12, icon: 'send', color: 'text-primary', bg: 'bg-primary-light' },
  { label: 'Responded', count: 4, icon: 'forum', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { label: 'Meeting Scheduled', count: 2, icon: 'event', color: 'text-green-600', bg: 'bg-green-50' },
]

export function PipelineSummary() {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-gray-900">Pipeline overview</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {STAGES.map((stage) => (
          <Card
            key={stage.label}
            className="flex cursor-pointer flex-col items-center px-3 py-4 transition-shadow hover:shadow-md"
          >
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
        ))}
      </div>
    </div>
  )
}
