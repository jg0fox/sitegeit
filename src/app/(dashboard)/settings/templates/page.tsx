import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { THEMES, CATEGORY_THEME_MAP } from '@/lib/themes'
import { EMAIL_SYSTEM_PROMPT } from '@/lib/ai/prompts/email'
import { LANDING_PAGE_SYSTEM_PROMPT } from '@/lib/ai/prompts/landing-page'

const THEME_DISPLAY_NAMES: Record<string, string> = {
  'bold-trade': 'Bold Trade',
  'soft-care': 'Soft Care',
  'warm-craft': 'Warm Craft',
  'urban-edge': 'Urban Edge',
  'clean-professional': 'Clean Professional',
  'fresh-active': 'Fresh Active',
  'natural-earth': 'Natural Earth',
  'modern-minimal': 'Modern Minimal',
}

function getCategoriesForTheme(themeId: string): string[] {
  return Object.entries(CATEGORY_THEME_MAP)
    .filter(([, t]) => t === themeId)
    .map(([cat]) => cat.replace(/_/g, ' '))
}

export default function TemplatesPage() {
  const emailTemplates = [
    {
      title: 'Initial outreach',
      sequence: 1,
      description: 'First email sent to prospects. Under 100 words, leads with value, includes landing page link.',
      parameters: ['Business name', 'Owner name', 'Category', 'City', 'Unique detail', 'Landing page URL', 'Booking URL'],
    },
    {
      title: 'Follow-up 1',
      sequence: 2,
      description: 'Sent 3 days after initial email if no reply. Different angle, 50-70 words.',
      parameters: ['Business name', 'City', 'Landing page URL'],
    },
    {
      title: 'Follow-up 2',
      sequence: 3,
      description: 'Final follow-up sent 5 days after follow-up 1. Respectful close, 40-60 words.',
      parameters: ['Business name', 'Landing page URL'],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/settings"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to settings
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Templates</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse the templates used for email, landing pages, and client sites.
        </p>
      </div>

      {/* Email templates */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Email templates
        </h2>
        <div className="space-y-3">
          {emailTemplates.map((tpl) => (
            <Card key={tpl.sequence}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
                    {tpl.sequence}
                  </div>
                  <CardTitle>{tpl.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{tpl.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tpl.parameters.map((p) => (
                    <span
                      key={p}
                      className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="mb-1 text-xs font-medium text-gray-500">System prompt summary</p>
          <p className="text-xs leading-relaxed text-gray-400">
            {EMAIL_SYSTEM_PROMPT.slice(0, 300)}
            {EMAIL_SYSTEM_PROMPT.length > 300 ? '...' : ''}
          </p>
        </div>
      </section>

      {/* Landing page template */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Landing page template
        </h2>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                <span className="material-symbols-outlined text-[20px] text-gray-400">
                  web
                </span>
              </div>
              <CardTitle>Prospect landing page</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Sales page pitching the generated website to a business owner. Leads with value,
              shows the actual site preview, explains strategy in plain language, and includes a
              CTA to schedule a meeting.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['Business name', 'Category', 'City/State', 'Rating', 'Preview site URL', 'Theme', 'Booking URL'].map((p) => (
                <span
                  key={p}
                  className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
                >
                  {p}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="mb-1 text-xs font-medium text-gray-500">System prompt summary</p>
          <p className="text-xs leading-relaxed text-gray-400">
            {LANDING_PAGE_SYSTEM_PROMPT.slice(0, 300)}
            {LANDING_PAGE_SYSTEM_PROMPT.length > 300 ? '...' : ''}
          </p>
        </div>
      </section>

      {/* Themes */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Site themes
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(THEMES).map(([themeId, config]) => {
            const categories = getCategoriesForTheme(themeId)
            return (
              <Card key={themeId}>
                <CardContent className="pt-5">
                  {/* Color swatches */}
                  <div className="mb-3 flex gap-1.5">
                    <div
                      className="h-6 w-6 rounded"
                      style={{ backgroundColor: config.colors.primary }}
                      title="Primary"
                    />
                    <div
                      className="h-6 w-6 rounded"
                      style={{ backgroundColor: config.colors.accent }}
                      title="Accent"
                    />
                    <div
                      className="h-6 w-6 rounded border border-gray-200"
                      style={{ backgroundColor: config.colors.background }}
                      title="Background"
                    />
                    <div
                      className="h-6 w-6 rounded border border-gray-200"
                      style={{ backgroundColor: config.colors.surface }}
                      title="Surface"
                    />
                  </div>

                  <p className="text-sm font-semibold text-gray-900">
                    {THEME_DISPLAY_NAMES[themeId] || themeId}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {config.layoutVariant} layout
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {config.typography.headingFont} + {config.typography.bodyFont}
                  </p>

                  {categories.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {categories.map((cat) => (
                        <span
                          key={cat}
                          className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] capitalize text-gray-500"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
