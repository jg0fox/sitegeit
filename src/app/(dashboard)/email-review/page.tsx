import { EmptyState } from '@/components/shared/EmptyState'

export default function EmailReviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          Review, edit, and approve outreach emails before they send.
        </p>
      </div>

      <EmptyState
        icon="rate_review"
        title="No emails to review"
        description="When the pipeline generates outreach emails, they'll appear here for your review before sending."
      />
    </div>
  )
}
