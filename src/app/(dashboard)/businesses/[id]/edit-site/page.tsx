'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getSiteUrl } from '@/lib/utils/site-urls'

type SiteData = {
  id: string
  business_id: string
  business_name: string
  deploy_url: string
  deploy_status: string
  custom_domain: string | null
  homepage_content: Record<string, unknown>
  service_pages: Record<string, unknown>[]
  about_content: Record<string, unknown>
  contact_content: Record<string, unknown>
  faq_content: Record<string, unknown>
  seo_meta: Record<string, unknown>
  hero_image_url: string | null
  about_image_url: string | null
}

const SECTIONS = [
  { key: 'hero', label: 'Hero', icon: 'image' },
  { key: 'services', label: 'Services', icon: 'construction' },
  { key: 'process', label: 'Process', icon: 'route' },
  { key: 'about', label: 'About', icon: 'info' },
  { key: 'cta', label: 'CTA', icon: 'ads_click' },
  { key: 'faq', label: 'FAQ', icon: 'help' },
  { key: 'contact', label: 'Contact', icon: 'call' },
  { key: 'seo', label: 'SEO', icon: 'search' },
  { key: 'global', label: 'Global', icon: 'settings' },
] as const

type SectionKey = (typeof SECTIONS)[number]['key']

function AIRewriteButton({ text, onRewrite }: { text: string; onRewrite: (result: string) => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function rewrite(instruction: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, instruction }),
      })
      if (res.ok) {
        const { result } = await res.json()
        onRewrite(result)
        setOpen(false)
      } else {
        toast.error('Rewrite failed')
      }
    } catch {
      toast.error('Rewrite failed')
    } finally {
      setLoading(false)
    }
  }

  const presets = [
    { label: 'Shorter', instruction: 'Make this shorter and more concise' },
    { label: 'Professional', instruction: 'Make this more professional in tone' },
    { label: 'Friendly', instruction: 'Make this warmer and more friendly' },
    { label: 'Compelling', instruction: 'Make this more compelling and action-oriented' },
  ]

  if (!text.trim()) return null

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium text-primary/60 hover:bg-primary/5 hover:text-primary"
        title="AI rewrite"
      >
        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
        AI
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => rewrite(p.instruction)}
              disabled={loading}
              className="block w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? 'Rewriting...' : p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  multiline,
  showAI,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  showAI?: boolean
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-gray-600">{label}</label>
        {showAI && <AIRewriteButton text={value} onRewrite={onChange} />}
      </div>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      )}
    </div>
  )
}

export default function EditSitePage() {
  const { id: businessId } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [site, setSite] = useState<SiteData | null>(null)
  const [activeSection, setActiveSection] = useState<SectionKey>('hero')

  const loadSite = useCallback(async () => {
    const res = await fetch(`/api/sites/by-business/${businessId}`)
    if (res.ok) {
      setSite(await res.json())
    } else if (res.status !== 404) {
      toast.error('Failed to load site content')
    }
    setLoading(false)
  }, [businessId])

  useEffect(() => {
    loadSite()
  }, [loadSite])

  async function handleSave() {
    if (!site) return
    setSaving(true)
    try {
      const res = await fetch(`/api/sites/${site.id}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homepage_content: site.homepage_content,
          service_pages: site.service_pages,
          about_content: site.about_content,
          contact_content: site.contact_content,
          faq_content: site.faq_content,
          seo_meta: site.seo_meta,
          hero_image_url: site.hero_image_url,
          about_image_url: site.about_image_url,
        }),
      })
      if (res.ok) {
        toast.success('Site content saved')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save')
      }
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  // Helper to update nested homepage_content
  function updateHomepage(path: string, value: unknown) {
    if (!site) return
    const content = { ...site.homepage_content } as Record<string, unknown>
    const keys = path.split('.')
    let obj = content as Record<string, unknown>
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]] || typeof obj[keys[i]] !== 'object') {
        obj[keys[i]] = {}
      }
      obj[keys[i]] = { ...(obj[keys[i]] as Record<string, unknown>) }
      obj = obj[keys[i]] as Record<string, unknown>
    }
    obj[keys[keys.length - 1]] = value
    setSite({ ...site, homepage_content: content })
  }

  function getHomepage(path: string): string {
    if (!site) return ''
    const keys = path.split('.')
    let obj: unknown = site.homepage_content
    for (const key of keys) {
      if (obj && typeof obj === 'object' && key in (obj as Record<string, unknown>)) {
        obj = (obj as Record<string, unknown>)[key]
      } else {
        return ''
      }
    }
    return String(obj ?? '')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="py-12 text-center text-sm text-gray-400">Loading site content...</p>
      </div>
    )
  }

  if (!site) {
    return (
      <div className="space-y-6">
        <Link
          href={`/businesses/${businessId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to business
        </Link>
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <span className="material-symbols-outlined text-[32px] text-gray-300">web</span>
          <p className="mt-2 text-sm text-gray-500">No generated site found for this business.</p>
        </div>
      </div>
    )
  }

  const homepage = site.homepage_content as Record<string, unknown>
  const hero = (homepage?.hero || {}) as Record<string, unknown>
  const services = (homepage?.services_section || {}) as Record<string, unknown>
  const aboutSnippet = (homepage?.about_snippet || {}) as Record<string, unknown>
  const ctaSection = (homepage?.cta_section || {}) as Record<string, unknown>
  const globalContent = (homepage?.global || {}) as Record<string, unknown>
  const aboutPage = (site.about_content || {}) as Record<string, unknown>
  const contactPage = (site.contact_content || {}) as Record<string, unknown>
  const faqPage = (site.faq_content || {}) as Record<string, unknown>
  const seoMeta = (site.seo_meta || {}) as Record<string, unknown>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/businesses/${businessId}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to business
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Edit site content</h1>
            <p className="mt-1 text-sm text-gray-500">{site.business_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={getSiteUrl(site.deploy_url, site.custom_domain)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              Preview
            </a>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-1">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeSection === s.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      {activeSection === 'hero' && (
        <Card>
          <CardHeader><CardTitle>Hero section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Headline" value={String(hero.headline || '')} onChange={(v) => updateHomepage('hero.headline', v)} showAI />
            <TextField label="Subheadline" value={String(hero.subheadline || '')} onChange={(v) => updateHomepage('hero.subheadline', v)} showAI multiline />
            <div className="grid grid-cols-2 gap-4">
              <TextField label="Primary CTA label" value={String((hero.primary_cta as Record<string, unknown>)?.label || '')} onChange={(v) => updateHomepage('hero.primary_cta.label', v)} />
              <TextField label="Secondary CTA label" value={String((hero.secondary_cta as Record<string, unknown>)?.label || '')} onChange={(v) => updateHomepage('hero.secondary_cta.label', v)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Hero image</label>
              {site.hero_image_url && (
                <img src={site.hero_image_url} alt="Hero" className="mt-1 h-32 w-full rounded-lg object-cover" />
              )}
              <input
                type="file"
                accept="image/*"
                className="mt-2 text-sm text-gray-500"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const formData = new FormData()
                  formData.append('file', file)
                  const res = await fetch('/api/uploads', { method: 'POST', body: formData })
                  if (res.ok) {
                    const { url } = await res.json()
                    setSite({ ...site, hero_image_url: url })
                    toast.success('Image uploaded')
                  } else {
                    toast.error('Upload failed')
                  }
                }}
              />
            </div>
            {/* Editorial: sparkle tags */}
            {Array.isArray((hero as Record<string, unknown>).sparkle_tags) && (
              <div>
                <label className="block text-xs font-medium text-gray-600">Sparkle Tags (editorial)</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {((hero as Record<string, unknown>).sparkle_tags as string[]).map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                      {tag}
                      <button
                        onClick={() => {
                          const tags = [...((hero as Record<string, unknown>).sparkle_tags as string[])]
                          tags.splice(i, 1)
                          updateHomepage('hero.sparkle_tags', tags)
                        }}
                        className="ml-1 text-amber-500 hover:text-amber-700"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => {
                      const newTag = prompt('Enter a new sparkle tag:')
                      if (newTag?.trim()) {
                        const tags = [...((hero as Record<string, unknown>).sparkle_tags as string[] || []), newTag.trim()]
                        updateHomepage('hero.sparkle_tags', tags)
                      }
                    }}
                    className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs text-gray-500 hover:border-gray-400 hover:text-gray-700"
                  >
                    + Add tag
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeSection === 'services' && (
        <Card>
          <CardHeader><CardTitle>Services section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Section heading" value={String(services.heading || '')} onChange={(v) => updateHomepage('services_section.heading', v)} />
            {((services.services as Record<string, unknown>[]) || []).map((svc, i) => (
              <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Service {i + 1}</span>
                  <button
                    onClick={() => {
                      const svcs = [...((services.services as Record<string, unknown>[]) || [])]
                      svcs.splice(i, 1)
                      updateHomepage('services_section.services', svcs)
                    }}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
                <TextField label="Name" value={String(svc.name || '')} onChange={(v) => {
                  const svcs = [...((services.services as Record<string, unknown>[]) || [])]
                  svcs[i] = { ...svcs[i], name: v }
                  updateHomepage('services_section.services', svcs)
                }} />
                <TextField label="Description" value={String(svc.description || '')} onChange={(v) => {
                  const svcs = [...((services.services as Record<string, unknown>[]) || [])]
                  svcs[i] = { ...svcs[i], description: v }
                  updateHomepage('services_section.services', svcs)
                }} multiline showAI />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeSection === 'process' && (() => {
        const processSteps = (site.homepage_content as Record<string, unknown>)?.process_steps as { heading?: string; steps?: Record<string, unknown>[] } | undefined
        if (!processSteps) return (
          <Card>
            <CardHeader><CardTitle>Process Steps</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">No process steps generated for this site. Process steps are generated for editorial design system sites with service-oriented businesses.</p>
            </CardContent>
          </Card>
        )
        return (
          <Card>
            <CardHeader><CardTitle>Process Steps (How it works)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <TextField label="Section heading" value={String(processSteps.heading || '')} onChange={(v) => updateHomepage('process_steps.heading', v)} />
              {(processSteps.steps || []).map((step, i) => (
                <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Step {String(step.number || i + 1)}</span>
                  <TextField label="Title" value={String(step.title || '')} onChange={(v) => {
                    const steps = [...(processSteps.steps || [])]
                    steps[i] = { ...steps[i], title: v }
                    updateHomepage('process_steps.steps', steps)
                  }} />
                  <TextField label="Description" value={String(step.description || '')} onChange={(v) => {
                    const steps = [...(processSteps.steps || [])]
                    steps[i] = { ...steps[i], description: v }
                    updateHomepage('process_steps.steps', steps)
                  }} multiline showAI />
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })()}

      {activeSection === 'about' && (
        <Card>
          <CardHeader><CardTitle>About section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Heading" value={String(aboutSnippet.heading || '')} onChange={(v) => updateHomepage('about_snippet.heading', v)} />
            <TextField label="Body" value={String(aboutSnippet.body || '')} onChange={(v) => updateHomepage('about_snippet.body', v)} multiline showAI />
            <TextField label="Owner name" value={String(aboutSnippet.owner_name || '')} onChange={(v) => updateHomepage('about_snippet.owner_name', v)} />
            <hr className="border-gray-100" />
            <h3 className="text-sm font-semibold text-gray-700">About page (full page)</h3>
            <TextField label="Page heading" value={String(aboutPage.h1 || '')} onChange={(v) => setSite({ ...site, about_content: { ...aboutPage, h1: v } })} />
            <TextField label="Story" value={String(aboutPage.story || '')} onChange={(v) => setSite({ ...site, about_content: { ...aboutPage, story: v } })} multiline showAI />
            <TextField label="Team" value={String(aboutPage.team || '')} onChange={(v) => setSite({ ...site, about_content: { ...aboutPage, team: v } })} multiline />
            <div>
              <label className="block text-xs font-medium text-gray-600">About image</label>
              {site.about_image_url && (
                <img src={site.about_image_url} alt="About" className="mt-1 h-32 w-full rounded-lg object-cover" />
              )}
              <input
                type="file"
                accept="image/*"
                className="mt-2 text-sm text-gray-500"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const formData = new FormData()
                  formData.append('file', file)
                  const res = await fetch('/api/uploads', { method: 'POST', body: formData })
                  if (res.ok) {
                    const { url } = await res.json()
                    setSite({ ...site, about_image_url: url })
                    toast.success('Image uploaded')
                  } else {
                    toast.error('Upload failed')
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === 'cta' && (
        <Card>
          <CardHeader><CardTitle>Call-to-action section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Heading" value={String(ctaSection.heading || '')} onChange={(v) => updateHomepage('cta_section.heading', v)} showAI />
            <TextField label="Body" value={String(ctaSection.body || '')} onChange={(v) => updateHomepage('cta_section.body', v)} multiline showAI />
            <TextField label="CTA button label" value={String((ctaSection.primary_cta as Record<string, unknown>)?.label || '')} onChange={(v) => updateHomepage('cta_section.primary_cta.label', v)} />
          </CardContent>
        </Card>
      )}

      {activeSection === 'faq' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>FAQ</CardTitle>
              <button
                onClick={() => {
                  const questions = [...((faqPage.questions as Record<string, unknown>[]) || [])]
                  questions.push({ question: '', answer: '' })
                  setSite({ ...site, faq_content: { ...faqPage, questions } })
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add question
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Page heading" value={String(faqPage.h1 || '')} onChange={(v) => setSite({ ...site, faq_content: { ...faqPage, h1: v } })} />
            {((faqPage.questions as Record<string, unknown>[]) || []).map((q, i) => (
              <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Question {i + 1}</span>
                  <button
                    onClick={() => {
                      const questions = [...((faqPage.questions as Record<string, unknown>[]) || [])]
                      questions.splice(i, 1)
                      setSite({ ...site, faq_content: { ...faqPage, questions } })
                    }}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
                <TextField label="Question" value={String(q.question || '')} onChange={(v) => {
                  const questions = [...((faqPage.questions as Record<string, unknown>[]) || [])]
                  questions[i] = { ...questions[i], question: v }
                  setSite({ ...site, faq_content: { ...faqPage, questions } })
                }} />
                <TextField label="Answer" value={String(q.answer || '')} onChange={(v) => {
                  const questions = [...((faqPage.questions as Record<string, unknown>[]) || [])]
                  questions[i] = { ...questions[i], answer: v }
                  setSite({ ...site, faq_content: { ...faqPage, questions } })
                }} multiline showAI />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeSection === 'contact' && (
        <Card>
          <CardHeader><CardTitle>Contact page</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Page heading" value={String(contactPage.h1 || '')} onChange={(v) => setSite({ ...site, contact_content: { ...contactPage, h1: v } })} />
            <TextField label="Phone" value={String(contactPage.phone || '')} onChange={(v) => setSite({ ...site, contact_content: { ...contactPage, phone: v } })} />
            <TextField label="Address" value={String(contactPage.address || '')} onChange={(v) => setSite({ ...site, contact_content: { ...contactPage, address: v } })} />
            <TextField label="Response expectation" value={String(contactPage.response_expectation || '')} onChange={(v) => setSite({ ...site, contact_content: { ...contactPage, response_expectation: v } })} showAI />
          </CardContent>
        </Card>
      )}

      {activeSection === 'seo' && (
        <Card>
          <CardHeader><CardTitle>SEO metadata</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Homepage title (max 60 chars)" value={String(seoMeta.homepage_title || '')} onChange={(v) => setSite({ ...site, seo_meta: { ...seoMeta, homepage_title: v } })} />
            <TextField label="Homepage description (150-160 chars)" value={String(seoMeta.homepage_description || '')} onChange={(v) => setSite({ ...site, seo_meta: { ...seoMeta, homepage_description: v } })} multiline />
            <TextField label="OG image text" value={String(seoMeta.og_image_text || '')} onChange={(v) => setSite({ ...site, seo_meta: { ...seoMeta, og_image_text: v } })} />
          </CardContent>
        </Card>
      )}

      {activeSection === 'global' && (
        <Card>
          <CardHeader><CardTitle>Global settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Phone display" value={String(globalContent.phone_display || '')} onChange={(v) => updateHomepage('global.phone_display', v)} />
            <TextField label="Phone tel (for links)" value={String(globalContent.phone_tel || '')} onChange={(v) => updateHomepage('global.phone_tel', v)} />
            <div className="grid grid-cols-2 gap-4">
              <TextField label="Services nav label" value={String((globalContent.nav_labels as Record<string, unknown>)?.services || '')} onChange={(v) => updateHomepage('global.nav_labels.services', v)} />
              <TextField label="FAQ nav label" value={String((globalContent.nav_labels as Record<string, unknown>)?.faq || '')} onChange={(v) => updateHomepage('global.nav_labels.faq', v)} />
            </div>
            <TextField label="Sticky CTA button label" value={String((globalContent.sticky_cta as Record<string, unknown>)?.button_label || '')} onChange={(v) => updateHomepage('global.sticky_cta.button_label', v)} />
          </CardContent>
        </Card>
      )}

      {/* Bottom save bar */}
      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="shadow-lg">
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </div>
  )
}
