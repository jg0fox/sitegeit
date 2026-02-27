import { EmptyState } from '@/components/shared/EmptyState'

export default function ProspectDetailPage() {
  return (
    <div className="space-y-6">
      <EmptyState
        icon="business"
        title="Prospect details"
        description="Full prospect detail view with CRM record, generated site preview, email drafts, and activity timeline will be available in Phase 4."
      />
    </div>
  )
}
