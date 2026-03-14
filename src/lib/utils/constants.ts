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
  { key: 'email-review', label: 'Email Review', href: '/email-review', icon: 'rate_review' },
  { key: 'bookings', label: 'Bookings', href: '/bookings', icon: 'calendar_month' },
  { key: 'clients', label: 'Clients', href: '/clients', icon: 'group' },
  { key: 'settings', label: 'Settings', href: '/settings', icon: 'settings' },
] as const

export const BUSINESS_CATEGORIES = [
  { label: 'Plumber', value: 'plumber', type: 'plumber' },
  { label: 'Electrician', value: 'electrician', type: 'electrician' },
  { label: 'HVAC', value: 'hvac', type: 'hvac' },
  { label: 'Roofer', value: 'roofer', type: 'roofing_contractor' },
  { label: 'Landscaper', value: 'landscaper', type: 'landscaping' },
  { label: 'Painter', value: 'painter', type: 'painter' },
  { label: 'General Contractor', value: 'general_contractor', type: 'general_contractor' },
  { label: 'Handyman', value: 'handyman', type: 'handyman' },
  { label: 'Locksmith', value: 'locksmith', type: 'locksmith' },
  { label: 'Pest Control', value: 'pest_control', type: 'pest_control' },
  { label: 'Cleaning Service', value: 'cleaning', type: 'cleaning' },
  { label: 'Moving Company', value: 'moving', type: 'moving_company' },
  { label: 'Auto Repair', value: 'auto_repair', type: 'car_repair' },
  { label: 'Auto Detailing', value: 'auto_detailing', type: 'car_wash' },
  { label: 'Towing Service', value: 'towing', type: 'towing' },
  { label: 'Bakery', value: 'bakery', type: 'bakery' },
  { label: 'Restaurant', value: 'restaurant', type: 'restaurant' },
  { label: 'Cafe', value: 'cafe', type: 'cafe' },
  { label: 'Bar', value: 'bar', type: 'bar' },
  { label: 'Hair Salon', value: 'hair_salon', type: 'hair_care' },
  { label: 'Barber', value: 'barber', type: 'barber' },
  { label: 'Nail Salon', value: 'nail_salon', type: 'nail_salon' },
  { label: 'Spa', value: 'spa', type: 'spa' },
  { label: 'Gym / Fitness', value: 'gym', type: 'gym' },
  { label: 'Yoga Studio', value: 'yoga', type: 'yoga' },
  { label: 'Dentist', value: 'dentist', type: 'dentist' },
  { label: 'Chiropractor', value: 'chiropractor', type: 'chiropractor' },
  { label: 'Veterinarian', value: 'veterinarian', type: 'veterinary_care' },
  { label: 'Pet Groomer', value: 'pet_groomer', type: 'pet_grooming' },
  { label: 'Florist', value: 'florist', type: 'florist' },
  { label: 'Photography', value: 'photography', type: 'photographer' },
  { label: 'Accounting', value: 'accounting', type: 'accounting' },
  { label: 'Law Office', value: 'lawyer', type: 'lawyer' },
  { label: 'Real Estate', value: 'real_estate', type: 'real_estate_agency' },
  { label: 'Insurance', value: 'insurance', type: 'insurance_agency' },
] as const

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number]['value']

export const WEB_STATUS_CONFIG = {
  none: { label: 'No website', color: 'error' as const, icon: 'language_off' },
  dead: { label: 'Dead link', color: 'error' as const, icon: 'link_off' },
  parked: { label: 'Parked domain', color: 'warning' as const, icon: 'domain_disabled' },
  social_only: { label: 'Social only', color: 'warning' as const, icon: 'share' },
  outdated: { label: 'Outdated site', color: 'info' as const, icon: 'history' },
  active: { label: 'Active site', color: 'success' as const, icon: 'check_circle' },
} as const
