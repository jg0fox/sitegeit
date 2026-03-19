'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

interface ContactInfoCardProps {
  businessId: string
  contactEmail: string | null
  phone: string | null
  addressStreet: string | null
  addressCity: string | null
  addressState: string | null
  addressZip: string | null
}

function useInlineEdit(
  businessId: string,
  initialValue: string,
  patchFields: (value: string) => Record<string, unknown>,
  label: string,
  validate?: (value: string) => string | null,
) {
  const [value, setValue] = useState(initialValue)
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
    setDraft(value)
    setIsEditing(true)
  }

  const save = useCallback(async () => {
    const trimmed = draft.trim()
    if (validate) {
      const err = validate(trimmed)
      if (err) {
        toast.error(err)
        return
      }
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchFields(trimmed)),
      })
      if (!res.ok) throw new Error('Failed to save')
      setValue(trimmed)
      setIsEditing(false)
      toast.success(`${label} updated`)
    } catch {
      toast.error(`Failed to save ${label.toLowerCase()}`)
    } finally {
      setSaving(false)
    }
  }, [draft, businessId, patchFields, label, validate])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      save()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  return { value, isEditing, draft, setDraft, saving, inputRef, startEdit, save, handleKeyDown }
}

export function ContactInfoCard({
  businessId,
  contactEmail,
  phone,
  addressStreet,
  addressCity,
  addressState,
  addressZip,
}: ContactInfoCardProps) {
  const initialAddress = [addressStreet, addressCity, addressState, addressZip]
    .filter(Boolean)
    .join(', ')

  const emailEdit = useInlineEdit(
    businessId,
    contactEmail ?? '',
    useCallback((v: string) => ({ contact_email: v || null }), []),
    'Contact email',
    (v) => (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Invalid email address' : null),
  )

  const phoneEdit = useInlineEdit(
    businessId,
    phone ?? '',
    useCallback((v: string) => ({ phone: v || null }), []),
    'Phone',
  )

  const addressEdit = useInlineEdit(
    businessId,
    initialAddress,
    useCallback((v: string) => {
      // Parse comma-separated address back into fields
      const parts = v.split(',').map((p) => p.trim())
      return {
        address_street: parts[0] || null,
        address_city: parts[1] || null,
        address_state: parts[2] || null,
        address_zip: parts[3] || null,
      }
    }, []),
    'Address',
  )

  return (
    <Card className="p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Contact information
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {/* Contact email */}
        <InlineField
          edit={emailEdit}
          icon="mail"
          placeholder="email@example.com"
          emptyLabel="Add contact email"
          type="email"
          hint="Used for booking notifications & contact form"
        />

        {/* Phone */}
        <InlineField
          edit={phoneEdit}
          icon="phone"
          placeholder="(555) 000-0000"
          emptyLabel="Add phone"
          type="tel"
        />

        {/* Address */}
        <InlineField
          edit={addressEdit}
          icon="location_on"
          placeholder="Street, City, State, Zip"
          emptyLabel="Add address"
          type="text"
        />
      </div>
    </Card>
  )
}

function InlineField({
  edit,
  icon,
  placeholder,
  emptyLabel,
  type,
  hint,
}: {
  edit: ReturnType<typeof useInlineEdit>
  icon: string
  placeholder: string
  emptyLabel: string
  type: string
  hint?: string
}) {
  if (edit.isEditing) {
    return (
      <div>
        <FieldLabel icon={icon} />
        <input
          ref={edit.inputRef}
          type={type}
          value={edit.draft}
          onChange={(e) => edit.setDraft(e.target.value)}
          onBlur={edit.save}
          onKeyDown={edit.handleKeyDown}
          disabled={edit.saving}
          placeholder={placeholder}
          className="h-7 w-full rounded border border-gray-300 px-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {hint && <p className="mt-1 text-[10px] text-gray-400">{hint}</p>}
      </div>
    )
  }

  return (
    <div>
      <FieldLabel icon={icon} />
      {edit.value ? (
        <button
          type="button"
          onClick={edit.startEdit}
          className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-primary"
          title="Click to edit"
        >
          <span className="material-symbols-outlined text-[16px] text-gray-400">{icon}</span>
          <span className="truncate">{edit.value}</span>
          <span className="material-symbols-outlined text-[14px] text-gray-300">edit</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={edit.startEdit}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          {emptyLabel}
        </button>
      )}
      {hint && <p className="mt-1 text-[10px] text-gray-400">{hint}</p>}
    </div>
  )
}

function FieldLabel({ icon }: { icon: string }) {
  const labels: Record<string, string> = {
    mail: 'Client email',
    phone: 'Phone',
    location_on: 'Address',
  }
  return (
    <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-gray-400">
      {labels[icon] || icon}
    </p>
  )
}
