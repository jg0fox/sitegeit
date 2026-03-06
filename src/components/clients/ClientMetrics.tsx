import { createClient } from '@/lib/supabase/server'

export async function ClientMetrics() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: activeClients } = await supabase
    .from('businesses')
    .select('monthly_rate')
    .eq('user_id', user.id)
    .eq('status', 'active')

  const { count: churnedCount } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'churned')

  const active = activeClients ?? []
  const activeCount = active.length
  const mrr = active.reduce((sum, c) => sum + ((c.monthly_rate as number) ?? 0), 0)
  const avgDeal = activeCount > 0 ? Math.round(mrr / activeCount) : 0
  const churned = churnedCount ?? 0
  const retention =
    activeCount + churned > 0
      ? Math.round((activeCount / (activeCount + churned)) * 100)
      : 100

  const metrics = [
    { label: 'Active clients', value: String(activeCount), icon: 'group' },
    { label: 'MRR', value: mrr > 0 ? `$${mrr.toLocaleString()}` : '$0', icon: 'payments' },
    { label: 'Avg deal size', value: avgDeal > 0 ? `$${avgDeal}` : '—', icon: 'trending_up' },
    { label: 'Retention', value: `${retention}%`, icon: 'loyalty' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50">
              <span className="material-symbols-outlined text-[16px] text-gray-400">
                {m.icon}
              </span>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{m.value}</p>
              <p className="text-[11px] text-gray-500">{m.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
