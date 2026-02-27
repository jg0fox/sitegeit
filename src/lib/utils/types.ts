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
