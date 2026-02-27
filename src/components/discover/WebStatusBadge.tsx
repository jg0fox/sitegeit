import { Badge } from '@/components/ui/badge'
import { WEB_STATUS_CONFIG } from '@/lib/utils/constants'
import type { WebsiteStatus } from '@/lib/utils/types'

interface WebStatusBadgeProps {
  status: WebsiteStatus
  className?: string
}

export function WebStatusBadge({ status, className }: WebStatusBadgeProps) {
  const config = WEB_STATUS_CONFIG[status]

  return (
    <Badge variant={config.color} className={className}>
      <span className="material-symbols-outlined text-[14px]">
        {config.icon}
      </span>
      {config.label}
    </Badge>
  )
}
