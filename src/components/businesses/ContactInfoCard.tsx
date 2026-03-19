'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

interface ContactInfoCardProps {
  businessId: string
  contactEmail: string | null
  phone: string | null
  address: string | null
}

export function ContactInfoCard({ businessId, contactEmail, phone, address }: ContactInfoCardProps) {
  const [email, setEmail] = useState(contactEmail ?? '')
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
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error('Invalid email address')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_email: trimmed || null }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setEmail(trimmed)
      setIsEditing(false)
      toast.success(trimmed ? 'Contact email updated' : 'Contact email removed')
    } catch {
      toast.error('Failed to save contact email')
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

  return (
    <Card className="p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Contact information
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {/* Contact email — editable */}
        <div>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-gray-400">
            Client email
          </p>
          {isEditing ? (
            <input
              ref={inputRef}
              type="email"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={save}
              onKeyDown={handleKeyDown}
              disabled={saving}
              placeholder="email@example.com"
              className="h-7 w-full rounded border border-gray-300 px-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          ) : email ? (
            <button
              type="button"
              onClick={startEdit}
              className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-primary"
              title="Click to edit contact email"
            >
              <span className="material-symbols-outlined text-[16px] text-gray-400">mail</span>
              <span className="truncate">{email}</span>
              <span className="material-symbols-outlined text-[14px] text-gray-300">edit</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startEdit}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add contact email
            </button>
          )}
          <p className="mt-1 text-[10px] text-gray-400">
            Used for booking notifications & contact form
          </p>
        </div>

        {/* Phone — display only */}
        <div>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-gray-400">
            Phone
          </p>
          {phone ? (
            <span className="flex items-center gap-1.5 text-sm text-gray-700">
              <span className="material-symbols-outlined text-[16px] text-gray-400">phone</span>
              {phone}
            </span>
          ) : (
            <span className="text-sm text-gray-400">Not available</span>
          )}
        </div>

        {/* Address — display only */}
        <div>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-gray-400">
            Address
          </p>
          {address ? (
            <span className="flex items-center gap-1.5 text-sm text-gray-700">
              <span className="material-symbols-outlined text-[16px] text-gray-400">location_on</span>
              <span className="truncate">{address}</span>
            </span>
          ) : (
            <span className="text-sm text-gray-400">Not available</span>
          )}
        </div>
      </div>
    </Card>
  )
}
