import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const SECTIONS = [
  {
    title: 'Email accounts',
    description: 'Manage sending domains, warmup status, and health scores.',
    icon: 'mail',
    href: '/settings/domains',
  },
  {
    title: 'Templates',
    description: 'Browse email, landing page, and site theme templates.',
    icon: 'description',
    href: '/settings/templates',
  },
  {
    title: 'Scheduling',
    description: 'Availability, booking preferences, and meeting defaults.',
    icon: 'event',
    href: '/settings/scheduling',
  },
  {
    title: 'Bookings',
    description: 'View and manage upcoming and past bookings.',
    icon: 'calendar_month',
    href: '/settings/bookings',
  },
  {
    title: 'Integrations',
    description: 'Connection status for Instantly.ai, Google Places, Vercel, and more.',
    icon: 'extension',
    href: '/settings/integrations',
  },
  {
    title: 'Notifications',
    description: 'Choose which events trigger push notifications or emails.',
    icon: 'notifications',
    href: '/settings/notifications',
  },
  {
    title: 'Profile',
    description: 'Your business info, email signature, and avatar.',
    icon: 'person',
    href: '/settings/profile',
  },
  {
    title: 'System prompts',
    description: 'View and override AI prompts for enrichment, sites, emails, and landing pages.',
    icon: 'edit_note',
    href: '/settings/prompts',
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          Configure your pipeline, integrations, and preferences.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => {
          const card = (
            <Card
              key={section.title}
              className="cursor-pointer transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                    <span className="material-symbols-outlined text-[20px] text-gray-400">
                      {section.icon}
                    </span>
                  </div>
                  <CardTitle>{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{section.description}</p>
              </CardContent>
            </Card>
          )
          return section.href ? (
            <Link key={section.title} href={section.href}>
              {card}
            </Link>
          ) : (
            <div key={section.title}>{card}</div>
          )
        })}
      </div>
    </div>
  )
}
