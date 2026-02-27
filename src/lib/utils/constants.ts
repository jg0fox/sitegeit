export const PIPELINE_STAGES = [
  { key: 'discovered', label: 'Discovered', color: 'bg-gray-400' },
  { key: 'enriching', label: 'Enriching', color: 'bg-info' },
  { key: 'enriched', label: 'Enriched', color: 'bg-blue-400' },
  { key: 'generating', label: 'Generating', color: 'bg-purple-400' },
  { key: 'review_ready', label: 'Ready for Review', color: 'bg-warning' },
  { key: 'sent', label: 'Sent', color: 'bg-primary' },
  { key: 'opened', label: 'Opened', color: 'bg-cyan-500' },
  { key: 'clicked', label: 'Clicked', color: 'bg-teal-500' },
  { key: 'responded', label: 'Responded', color: 'bg-success' },
  { key: 'meeting_scheduled', label: 'Meeting Scheduled', color: 'bg-emerald-600' },
  { key: 'closed_won', label: 'Closed Won', color: 'bg-green-700' },
  { key: 'active', label: 'Active', color: 'bg-green-500' },
  { key: 'churned', label: 'Churned', color: 'bg-error' },
  { key: 'closed_lost', label: 'Closed Lost', color: 'bg-red-400' },
  { key: 'archived', label: 'Archived', color: 'bg-gray-300' },
] as const

export type PipelineStage = (typeof PIPELINE_STAGES)[number]['key']

export const DASHBOARD_STAGES = PIPELINE_STAGES.filter((s) =>
  ['discovered', 'enriching', 'generating', 'review_ready', 'sent', 'responded', 'meeting_scheduled'].includes(s.key)
)

export const SERVICE_TIERS = [
  { key: 'starter', label: 'Starter', price: 2500, priceDisplay: '$25/mo' },
  { key: 'growth', label: 'Growth', price: 5000, priceDisplay: '$50/mo' },
  { key: 'pro', label: 'Pro', price: 7500, priceDisplay: '$75/mo' },
  { key: 'premium', label: 'Premium', price: 10000, priceDisplay: '$100/mo' },
] as const

export type ServiceTier = (typeof SERVICE_TIERS)[number]['key']

export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', href: '/', icon: 'dashboard' },
  { key: 'discover', label: 'Discover', href: '/discover', icon: 'travel_explore' },
  { key: 'pipeline', label: 'Pipeline', href: '/pipeline', icon: 'conversion_path' },
  { key: 'clients', label: 'Clients', href: '/clients', icon: 'group' },
  { key: 'settings', label: 'Settings', href: '/settings', icon: 'settings' },
] as const
