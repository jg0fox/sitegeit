'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const PROMPT_TABS = [
  { key: 'enrichment', label: 'Enrichment', description: 'Analyzes raw business data to produce structured profiles.' },
  { key: 'site_generation', label: 'Site generation', description: 'Creates structured JSON content for client websites.' },
  { key: 'email', label: 'Email', description: 'Writes personalized cold outreach emails.' },
  { key: 'landing_page', label: 'Landing page', description: 'Creates sales landing pages for business owners.' },
] as const

type PromptKey = (typeof PROMPT_TABS)[number]['key']

export default function PromptsSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<PromptKey>('enrichment')
  const [defaults, setDefaults] = useState<Record<PromptKey, string>>({
    enrichment: '',
    site_generation: '',
    email: '',
    landing_page: '',
  })
  const [overrides, setOverrides] = useState<Record<PromptKey, string>>({
    enrichment: '',
    site_generation: '',
    email: '',
    landing_page: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const [defaultsRes, overridesRes] = await Promise.all([
          fetch('/api/settings/prompts/defaults'),
          fetch('/api/settings/prompts'),
        ])

        if (defaultsRes.ok) {
          setDefaults(await defaultsRes.json())
        }

        if (overridesRes.ok) {
          const data = await overridesRes.json()
          setOverrides({
            enrichment: data.enrichment || '',
            site_generation: data.site_generation || '',
            email: data.email || '',
            landing_page: data.landing_page || '',
          })
        }
      } catch {
        toast.error('Failed to load prompt settings')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/settings/prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overrides),
      })
      if (res.ok) {
        toast.success('Prompt overrides saved')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save')
      }
    } catch {
      toast.error('Failed to save prompt overrides')
    } finally {
      setSaving(false)
    }
  }

  function resetTab() {
    setOverrides((prev) => ({ ...prev, [activeTab]: '' }))
  }

  const currentTab = PROMPT_TABS.find((t) => t.key === activeTab)!
  const hasOverride = overrides[activeTab].trim().length > 0

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="py-12 text-center text-sm text-gray-400">Loading prompt settings...</p>
      </div>
    )
  }

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
        <h1 className="text-xl font-semibold text-gray-900">System prompts</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and override the AI system prompts used for enrichment, site generation, email drafting, and landing pages.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
        {PROMPT_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {overrides[tab.key].trim() && (
              <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Default prompt (read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-[18px] text-gray-400">description</span>
            Default prompt — {currentTab.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-gray-500">{currentTab.description}</p>
          <pre className="max-h-48 overflow-auto rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600 whitespace-pre-wrap">
            {defaults[activeTab] || 'Loading...'}
          </pre>
        </CardContent>
      </Card>

      {/* Override editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-[18px] text-primary">edit_note</span>
              Override
              {hasOverride && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Active</span>
              )}
            </CardTitle>
            {hasOverride && (
              <button
                onClick={resetTab}
                className="text-xs font-medium text-gray-400 hover:text-red-500"
              >
                Reset to default
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-gray-500">
            {hasOverride
              ? 'This override is used instead of the default prompt above.'
              : 'Paste a custom prompt below to override the default. Leave empty to use the default.'}
          </p>
          <textarea
            value={overrides[activeTab]}
            onChange={(e) => setOverrides((prev) => ({ ...prev, [activeTab]: e.target.value }))}
            rows={12}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Paste your custom system prompt here..."
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save prompt overrides'}
        </Button>
      </div>
    </div>
  )
}
