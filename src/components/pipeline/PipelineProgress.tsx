import { cn } from '@/lib/utils/cn'

const STEPS = [
  { key: 'discovered', label: 'Discovered', icon: 'search' },
  { key: 'enriched', label: 'Enriched', icon: 'auto_awesome', includes: ['enriching', 'enriched'] },
  { key: 'generated', label: 'Generated', icon: 'web', includes: ['generating'] },
  { key: 'review_ready', label: 'Review', icon: 'rate_review' },
  { key: 'sent', label: 'Sent', icon: 'send' },
  { key: 'responded', label: 'Responded', icon: 'forum', includes: ['responded', 'meeting_scheduled', 'closed_won'] },
] as const

// Map every status to which step index it corresponds to
function getStepIndex(status: string): number {
  for (let i = STEPS.length - 1; i >= 0; i--) {
    const step = STEPS[i]
    if (step.key === status) return i
    if ('includes' in step && step.includes.includes(status as never)) return i
  }
  return 0
}

function isActive(status: string): boolean {
  return ['enriching', 'generating'].includes(status)
}

export function PipelineProgress({ status }: { status: string }) {
  const currentIndex = getStepIndex(status)
  const animating = isActive(status)

  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, i) => {
        const completed = i < currentIndex
        const current = i === currentIndex
        const future = i > currentIndex

        return (
          <div key={step.key} className="flex items-center gap-1">
            {i > 0 && (
              <div
                className={cn(
                  'h-0.5 w-4 rounded-full transition-colors sm:w-6',
                  completed ? 'bg-primary' : 'bg-gray-200'
                )}
              />
            )}
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors',
                completed && 'bg-primary/10 text-primary',
                current && !animating && 'bg-primary text-white',
                current && animating && 'animate-pulse bg-blue-100 text-blue-600',
                future && 'text-gray-300'
              )}
              title={step.label}
            >
              <span className={cn('material-symbols-outlined text-[14px]', completed && 'filled')}>
                {completed ? 'check_circle' : step.icon}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
