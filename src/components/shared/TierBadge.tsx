const TIER_STYLES: Record<string, string> = {
  starter: 'bg-gray-100 text-gray-700',
  growth: 'bg-blue-50 text-blue-700',
  pro: 'bg-purple-50 text-purple-700',
  premium: 'bg-amber-50 text-amber-700',
}

interface TierBadgeProps {
  tier: string
  className?: string
}

export function TierBadge({ tier, className = '' }: TierBadgeProps) {
  const style = TIER_STYLES[tier] || TIER_STYLES.starter

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${style} ${className}`}
    >
      {tier}
    </span>
  )
}
