import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

export async function MRRSnapshot() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let activeClients = 0
  let monthlyRevenue = 0

  if (user) {
    const { count: clientCount } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active')

    activeClients = clientCount ?? 0

    const { data: clients } = await supabase
      .from('businesses')
      .select('monthly_rate')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .not('monthly_rate', 'is', null)

    monthlyRevenue = (clients ?? []).reduce(
      (sum, c) => sum + ((c.monthly_rate as number) ?? 0),
      0
    )
  }

  const avgDeal = activeClients > 0 ? Math.round(monthlyRevenue / activeClients) : 0

  const metrics = [
    {
      label: 'Active clients',
      value: String(activeClients),
      icon: 'group',
    },
    {
      label: 'Monthly revenue',
      value: monthlyRevenue > 0 ? `$${monthlyRevenue.toLocaleString()}` : '$0',
      icon: 'payments',
    },
    {
      label: 'Avg deal size',
      value: avgDeal > 0 ? `$${avgDeal}` : '—',
      icon: 'trending_up',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue snapshot</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {metrics.map((metric) => (
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
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
