export type NotificationType =
  | 'email_opened'
  | 'email_clicked'
  | 'email_replied'
  | 'email_bounced'
  | 'site_generated'
  | 'email_drafted'
  | 'campaign_launched'
  | 'system_alert'
  | 'lead_imported'

export type NotificationCategory = 'all' | 'emails' | 'pipeline' | 'system'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  businessName?: string
  href: string
  read: boolean
  createdAt: Date
}

export type WebsiteStatus =
  | 'none'
  | 'dead'
  | 'parked'
  | 'social_only'
  | 'outdated'
  | 'active'

export interface ActivityEvent {
  id: string
  type: string
  description: string
  businessName?: string
  href?: string
  createdAt: Date
}

// ============================================================
// Discovery / Google Places types
// ============================================================

export interface PlaceReview {
  author_name: string
  rating: number
  text: string
  time: number
  language?: string
}

export interface PlaceResult {
  place_id: string
  name: string
  formatted_address: string
  geometry: { lat: number; lng: number }
  rating?: number
  user_ratings_total?: number
  business_status?: string
  types: string[]
  formatted_phone_number?: string
  website?: string
  opening_hours?: { open_now?: boolean; weekday_text?: string[] }
  photos?: { photo_reference: string; width: number; height: number }[]
  reviews?: PlaceReview[]
}

export interface DiscoveryResult extends PlaceResult {
  website_status: WebsiteStatus
  already_in_pipeline: boolean
  emails?: string[]
}

export interface SearchFilters {
  min_rating?: number
  min_reviews?: number
  website_status?: WebsiteStatus[]
  has_phone?: boolean
}

export interface SearchParams {
  region: string
  category: string
  radius_km: number
  filters?: SearchFilters
}

export interface DiscoveryResponse {
  results: DiscoveryResult[]
  totalFound: number
  totalGoogleResults: number
  totalWithActiveSites: number
}

export interface SavedSearch {
  id: string
  region: string
  category: string
  radius_km: number | null
  filters: SearchFilters | null
  result_count: number | null
  results: DiscoveryResult[] | null
  saved: boolean
  last_run_at: string | null
  created_at: string
}
