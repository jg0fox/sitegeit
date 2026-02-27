import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'

export default function DiscoverPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          Find local businesses without websites and add them to your pipeline.
        </p>
      </div>

      <EmptyState
        icon="travel_explore"
        title="No search results yet"
        description="Search for businesses by region and category to discover leads without websites."
        action={
          <Button disabled>
            <span className="material-symbols-outlined text-[18px]">
              search
            </span>
            Start your first search
          </Button>
        }
      />
    </div>
  )
}
