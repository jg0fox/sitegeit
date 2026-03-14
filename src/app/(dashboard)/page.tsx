import { PipelineSummary } from '@/components/dashboard/PipelineSummary'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { MRRSnapshot } from '@/components/dashboard/MRRSnapshot'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { UpcomingBookings } from '@/components/dashboard/UpcomingBookings'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Pipeline overview cards */}
      <PipelineSummary />

      {/* Quick action buttons */}
      <QuickActions />

      {/* Two-column layout: activity + metrics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="space-y-6">
          <UpcomingBookings />
          <MRRSnapshot />
        </div>
      </div>
    </div>
  )
}
