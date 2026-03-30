'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'goget.im'

interface SlugEditorProps {
  businessId: string
  deployUrl: string
  customDomain: string | null
}

export function SlugEditor({ businessId, deployUrl, customDomain }: SlugEditorProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [slug, setSlug] = useState(deployUrl)
  const [saving, setSaving] = useState(false)

  const displayDomain = customDomain || `${deployUrl}.${SITE_DOMAIN}`

  if (!editing) {
    return (
      <div className="flex items-center gap-1.5">
        <a href={`https://${displayDomain}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:text-primary-hover hover:underline">{displayDomain}</a>
        {!customDomain && (
          <button
            onClick={() => setEditing(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Edit slug"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
          </button>
        )}
      </div>
    )
  }

  async function handleSave() {
    const cleaned = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-|-$/g, '')
    if (!cleaned) {
      toast.error('Slug cannot be empty')
      return
    }
    if (cleaned === deployUrl) {
      setEditing(false)
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}/slug`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: cleaned }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update slug')
      }

      toast.success(`Slug updated to ${cleaned}`)
      setSlug(cleaned)
      setEditing(false)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update slug')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-400">{SITE_DOMAIN}/</span>
      <input
        type="text"
        value={slug}
        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') { setSlug(deployUrl); setEditing(false) }
        }}
        autoFocus
        maxLength={48}
        className="w-40 rounded border border-gray-200 px-1.5 py-0.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="text-emerald-600 hover:text-emerald-700 disabled:text-gray-300 transition-colors"
        title="Save"
      >
        <span className="material-symbols-outlined text-[14px]">check</span>
      </button>
      <button
        onClick={() => { setSlug(deployUrl); setEditing(false) }}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        title="Cancel"
      >
        <span className="material-symbols-outlined text-[14px]">close</span>
      </button>
    </div>
  )
}
