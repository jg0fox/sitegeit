import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

type ChangeType = 'positive' | 'negative' | 'neutral'

const METRICS: { label: string; value: string; change: string; changeType: ChangeType; icon: string }[] = [
  {
    label: 'Active clients',
    value: '7',
    change: '+2',
    changeType: 'positive',
    icon: 'group',
  },
  {
    label: 'Monthly revenue',
    value: '$425',
    change: '+$100',
    changeType: 'positive',
    icon: 'payments',
  },
  {
    label: 'Avg deal size',
    value: '$61',
    change: '',
    changeType: 'neutral',
    icon: 'trending_up',
  },
  {
    label: 'Churn rate',
    value: '0%',
    change: '',
    changeType: 'neutral',
    icon: 'sync_alt',
  },
]

export function MRRSnapshot() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue snapshot</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {METRICS.map((metric) => (
            <div key={metric.label} className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                <span className="material-symbols-outlined text-[18px] text-gray-400">
                  {metric.icon}
                </span>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {metric.value}
                </p>
                <p className="text-xs text-gray-500">{metric.label}</p>
                {metric.change && (
                  <p
                    className={cn(
                      'mt-0.5 text-xs font-medium',
                      metric.changeType === 'positive'
                        ? 'text-success'
                        : metric.changeType === 'negative'
                          ? 'text-error'
                          : 'text-gray-400'
                    )}
                  >
                    {metric.change} this month
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
