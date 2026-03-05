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
    description: 'Browse and edit email, landing page, and site templates.',
    icon: 'description',
    href: null,
  },
  {
    title: 'Integrations',
    description: 'Connect Instantly.ai, Calendly, Google Places, and analytics.',
    icon: 'extension',
    href: null,
  },
  {
    title: 'Notifications',
    description: 'Choose which events trigger push notifications or emails.',
    icon: 'notifications',
    href: null,
  },
  {
    title: 'Profile',
    description: 'Your business info, Calendly link, email signature, and avatar.',
    icon: 'person',
    href: null,
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
