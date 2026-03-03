'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface RegenerateSiteButtonProps {
  businessId: string
}

export function RegenerateSiteButton({ businessId }: RegenerateSiteButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRegenerate() {
    setLoading(true)
    try {
      const res = await fetch('/api/pipeline/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessIds: [businessId], regenerate: true }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to queue regeneration')
      }

      toast.success('Site regeneration queued')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to regenerate site')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="w-full"
      onClick={handleRegenerate}
      disabled={loading}
    >
      <span className="material-symbols-outlined text-[16px]">
        refresh
      </span>
      {loading ? 'Regenerating...' : 'Regenerate site'}
    </Button>
  )
}
