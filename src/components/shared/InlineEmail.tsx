'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'

interface InlineEmailProps {
  businessId: string
  initialEmail: string | null
}

export function InlineEmail({ businessId, initialEmail }: InlineEmailProps) {
  const [email, setEmail] = useState(initialEmail ?? '')
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  function startEdit() {
    setDraft(email)
    setIsEditing(true)
  }

  async function save() {
    const trimmed = draft.trim()
    // Basic validation
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error('Invalid email address')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed || null }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setEmail(trimmed)
      setIsEditing(false)
      toast.success(trimmed ? 'Email updated' : 'Email removed')
    } catch {
      toast.error('Failed to save email')
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      save()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="material-symbols-outlined text-[16px]">mail</span>
        <input
          ref={inputRef}
          type="email"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
          disabled={saving}
          placeholder="email@example.com"
          className="h-6 w-48 rounded border border-gray-300 px-1.5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </span>
    )
  }

  if (email) {
    return (
      <button
        type="button"
        onClick={startEdit}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary"
        title="Click to edit email"
      >
        <span className="material-symbols-outlined text-[16px]">mail</span>
        {email}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary"
    >
      <span className="material-symbols-outlined text-[16px]">add</span>
      Add email
    </button>
  )
}
