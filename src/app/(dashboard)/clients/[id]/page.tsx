import { EmptyState } from '@/components/shared/EmptyState'

export default function ClientDetailPage() {
  return (
    <div className="space-y-6">
      <EmptyState
        icon="person"
        title="Client details"
        description="Client detail view with tier management, site analytics, billing history, and reports will be available in Phase 6."
      />
    </div>
  )
}
