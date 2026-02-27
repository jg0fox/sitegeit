import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          Track prospects as they move through discovery, enrichment, site
          generation, and outreach.
        </p>
      </div>

      <EmptyState
        icon="conversion_path"
        title="No prospects in pipeline"
        description="Discover leads to fill your pipeline. Prospects will appear here as they move through each stage."
        action={
          <Button asChild>
            <Link href="/discover">
              <span className="material-symbols-outlined text-[18px]">
                travel_explore
              </span>
              Discover leads
            </Link>
          </Button>
        }
      />
    </div>
  )
}
