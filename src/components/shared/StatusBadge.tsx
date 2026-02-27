import { Badge } from '@/components/ui/badge'
import { PIPELINE_STAGES } from '@/lib/utils/constants'
import type { BadgeProps } from '@/components/ui/badge'

const STAGE_VARIANT_MAP: Record<string, BadgeProps['variant']> = {
  discovered: 'secondary',
  enriching: 'info',
  enriched: 'info',
  generating: 'default',
  review_ready: 'warning',
  sent: 'default',
  opened: 'info',
  clicked: 'info',
  responded: 'success',
  meeting_scheduled: 'success',
  closed_won: 'success',
  active: 'success',
  churned: 'error',
  closed_lost: 'error',
  archived: 'secondary',
}

export function StatusBadge({ status }: { status: string }) {
  const stage = PIPELINE_STAGES.find((s) => s.key === status)
  const label = stage?.label ?? status
  const variant = STAGE_VARIANT_MAP[status] ?? 'secondary'

  return <Badge variant={variant}>{label}</Badge>
}
