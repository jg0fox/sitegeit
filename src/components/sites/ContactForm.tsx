'use client'

import { useState, type FormEvent } from 'react'

const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  phone: 'Phone Number',
  email: 'Email Address',
  message: 'Message',
  preferred_contact: 'Preferred Contact Method',
  details: 'Details',
  comment: 'Comment',
  company: 'Company',
  service: 'Service Needed',
}

function formatFieldLabel(field: string): string {
  const lower = field.toLowerCase().trim()
  if (FIELD_LABELS[lower]) return FIELD_LABELS[lower]
  return field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function ContactForm({
  businessId,
  formFields,
  responseExpectation,
}: {
  businessId: string
  formFields: string[]
  responseExpectation: string
}) {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const message = formData.get('message') as string

    try {
      const res = await fetch('/api/sites/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          name: name || formData.get('name') || '',
          email: email || '',
          phone: phone || '',
          message: message || formData.get('details') || formData.get('comment') || '',
        }),
      })

      if (res.ok) {
        setSuccess(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to send message')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="py-8 text-center">
        <div
          className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}
        >
          <span className="material-symbols-outlined text-[24px]" style={{ color: 'var(--color-primary)' }}>
            check_circle
          </span>
        </div>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Message sent!
        </h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {responseExpectation || "We'll get back to you soon."}
        </p>
      </div>
    )
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {formFields.map((field) => {
        const fieldId = field.toLowerCase().replace(/\s+/g, '-')
        const isTextarea =
          field.toLowerCase().includes('message') ||
          field.toLowerCase().includes('comment') ||
          field.toLowerCase().includes('details')
        const isPreferredContact =
          field.toLowerCase().replace(/[\s_-]+/g, '') === 'preferredcontact'

        const inputStyle = {
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-button, 6px)',
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-text-primary)',
        }

        return (
          <div key={field}>
            <label
              htmlFor={fieldId}
              className="mb-1.5 block text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {formatFieldLabel(field)}
            </label>
            {isPreferredContact ? (
              <select
                id={fieldId}
                name={fieldId}
                defaultValue=""
                className="w-full appearance-none border px-3 py-2 text-sm outline-none transition-colors focus:ring-2"
                style={inputStyle}
              >
                <option value="" disabled>Select one</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="text">Text Message</option>
              </select>
            ) : isTextarea ? (
              <textarea
                id={fieldId}
                name={fieldId}
                rows={4}
                required
                className="w-full border px-3 py-2 text-sm outline-none transition-colors focus:ring-2"
                style={inputStyle}
              />
            ) : (
              <input
                id={fieldId}
                name={fieldId}
                type={
                  field.toLowerCase().includes('email')
                    ? 'email'
                    : field.toLowerCase().includes('phone')
                      ? 'tel'
                      : 'text'
                }
                required={field.toLowerCase() === 'name' || field.toLowerCase() === 'email'}
                className="w-full border px-3 py-2 text-sm outline-none transition-colors focus:ring-2"
                style={inputStyle}
              />
            )}
          </div>
        )
      })}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-6 py-3 text-base font-semibold text-white transition-colors disabled:opacity-50"
        style={{
          backgroundColor: 'var(--color-primary)',
          borderRadius: 'var(--radius-button)',
        }}
      >
        {submitting ? 'Sending...' : 'Send Your Message'}
      </button>

      <p
        className="text-center text-xs"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {responseExpectation}
      </p>
    </form>
  )
}
