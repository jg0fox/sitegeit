import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          Manage active clients, track revenue, and monitor their sites.
        </p>
      </div>

      <EmptyState
        icon="group"
        title="No clients yet"
        description="Convert prospects to clients to start managing them here. Clients appear once a deal closes."
        action={
          <Button variant="outline" asChild>
            <Link href="/pipeline">
              <span className="material-symbols-outlined text-[18px]">
                conversion_path
              </span>
              View pipeline
            </Link>
          </Button>
        }
      />
    </div>
  )
}
