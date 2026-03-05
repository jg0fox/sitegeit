import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { ActivityTimeline } from '@/components/shared/ActivityTimeline'

export async function RecentActivity() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: activities } = await supabase
    .from('activity_log')
    .select('id, event_type, event_data, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!activities || activities.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="material-symbols-outlined mb-2 text-[32px] text-gray-300">
              history
            </span>
            <p className="text-sm text-gray-500">No activity yet</p>
            <p className="mt-1 text-xs text-gray-400">
              Activity will appear here as you use the pipeline.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <ActivityTimeline
          activities={activities as { id: string; event_type: string; event_data: Record<string, unknown> | null; created_at: string }[]}
          showBusinessName
        />
      </CardContent>
    </Card>
  )
}
