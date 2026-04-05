'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'

interface EmailData {
  id: string
  subject: string
  body: string
  edited_body: string | null
  review_status: string
  sequence_position: number
  template_variant?: string | null
}

interface EmailCandidate {
  id: string
  email: string
  source: string
  confidence: string
  is_selected: boolean
}

interface Props {
  businessId: string
  businessEmail: string | null
  emails: EmailData[]
}

const SEQUENCE_LABELS: Record<number, string> = {
  1: 'Primary',
  2: 'Follow-up 1',
  3: 'Follow-up 2',
}

const SEQUENCE_DELAY_HINTS: Record<number, string> = {
  2: '3 days after primary',
  3: '5 days after follow-up 1',
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'text-emerald-600 bg-emerald-50',
  medium: 'text-amber-600 bg-amber-50',
  low: 'text-gray-500 bg-gray-100',
}

const SOURCE_LABELS: Record<string, string> = {
  website_scrape: 'Website',
  web_search: 'Web search',
  mx_pattern: 'Pattern',
  hunter: 'Hunter.io',
  manual: 'Manual',
}

export function BusinessEmailReview({ businessId, businessEmail, emails: initialEmails }: Props) {
  const [emails, setEmails] = useState(initialEmails)
  const [activePosition, setActivePosition] = useState(
    // Default to first draft email, or first email
    () => {
      const firstDraft = initialEmails.find((e) => e.review_status === 'draft')
      return firstDraft?.sequence_position ?? initialEmails[0]?.sequence_position ?? 1
    }
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSubject, setEditSubject] = useState('')
  const [editBody, setEditBody] = useState('')
  const [saving, setSaving] = useState(false)

  // Sending config
  const [sendingAccounts, setSendingAccounts] = useState<{ email: string }[]>([])
  const [selectedFromEmail, setSelectedFromEmail] = useState('')
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>(
    businessEmail ? [businessEmail] : []
  )
  const [candidates, setCandidates] = useState<EmailCandidate[]>([])
  const [loadingCandidates, setLoadingCandidates] = useState(false)
  const [showCandidates, setShowCandidates] = useState(false)
  const [primaryEmail, setPrimaryEmailState] = useState(businessEmail ?? '')

  const currentEmail = emails.find((e) => e.sequence_position === activePosition)
  const isDraft = currentEmail?.review_status === 'draft'
  const hasRecipient = selectedRecipients.length > 0
  const allReviewed = emails.every((e) => e.review_status !== 'draft')
  const draftCount = emails.filter((e) => e.review_status === 'draft').length

  useEffect(() => {
    async function loadAccounts() {
      try {
        const res = await fetch('/api/settings/domains')
        if (res.ok) {
          const data = await res.json()
          const accts = (Array.isArray(data) ? data : []).map(
            (d: { email_address: string }) => ({ email: d.email_address })
          )
          setSendingAccounts(accts)
          if (accts.length > 0) setSelectedFromEmail(accts[0].email)
        }
      } catch { /* silently fail */ }
    }
    loadAccounts()
  }, [])

  async function loadCandidates() {
    if (candidates.length > 0) return
    setLoadingCandidates(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}/email-candidates`)
      if (res.ok) {
        const data = await res.json()
        setCandidates(data || [])
      }
    } catch { /* silently fail */ }
    finally { setLoadingCandidates(false) }
  }

  function toggleRecipient(email: string) {
    setSelectedRecipients((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    )
  }

  async function setPrimaryEmail(email: string) {
    setSaving(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setPrimaryEmailState(email)
        setSelectedRecipients((prev) =>
          prev.includes(email) ? prev : [email, ...prev]
        )
        toast.success('Primary email updated')
      }
    } catch { toast.error('Failed to update email') }
    finally { setSaving(false) }
  }

  function startEditing(email: EmailData) {
    setEditingId(email.id)
    setEditSubject(email.subject)
    setEditBody(email.edited_body || email.body)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditSubject('')
    setEditBody('')
  }

  async function saveEdit(emailId: string) {
    setSaving(true)
    try {
      const res = await fetch(`/api/emails/${emailId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: editSubject, body: editBody }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Email updated')
      setEditingId(null)
      setEmails((prev) =>
        prev.map((e) =>
          e.id === emailId ? { ...e, subject: editSubject, edited_body: editBody } : e
        )
      )
    } catch { toast.error('Failed to save changes') }
    finally { setSaving(false) }
  }

  async function approveEmail(emailId: string) {
    setSaving(true)
    try {
      const res = await fetch(`/api/emails/${emailId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_status: 'approved',
          ...(selectedFromEmail ? { from_email: selectedFromEmail } : {}),
          ...(selectedRecipients.length > 0 ? { to_emails: selectedRecipients } : {}),
        }),
      })
      if (!res.ok) throw new Error('Failed to approve')
      setEmails((prev) =>
        prev.map((e) => (e.id === emailId ? { ...e, review_status: 'approved' } : e))
      )
      toast.success('Email approved')
      // Auto-advance to next draft
      const nextDraft = emails.find(
        (e) => e.id !== emailId && e.review_status === 'draft'
      )
      if (nextDraft) setActivePosition(nextDraft.sequence_position)
    } catch { toast.error('Failed to approve email') }
    finally { setSaving(false) }
  }

  async function skipEmail(emailId: string) {
    setSaving(true)
    try {
      const res = await fetch(`/api/emails/${emailId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_status: 'skipped' }),
      })
      if (!res.ok) throw new Error('Failed to skip')
      setEmails((prev) =>
        prev.map((e) => (e.id === emailId ? { ...e, review_status: 'skipped' } : e))
      )
      toast.success('Email skipped')
      const nextDraft = emails.find(
        (e) => e.id !== emailId && e.review_status === 'draft'
      )
      if (nextDraft) setActivePosition(nextDraft.sequence_position)
    } catch { toast.error('Failed to skip email') }
    finally { setSaving(false) }
  }

  async function approveAll() {
    setSaving(true)
    try {
      const drafts = emails.filter((e) => e.review_status === 'draft')
      await Promise.all(
        drafts.map((e) =>
          fetch(`/api/emails/${e.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              review_status: 'approved',
              ...(selectedFromEmail ? { from_email: selectedFromEmail } : {}),
              ...(selectedRecipients.length > 0 ? { to_emails: selectedRecipients } : {}),
            }),
          })
        )
      )
      setEmails((prev) =>
        prev.map((e) =>
          e.review_status === 'draft' ? { ...e, review_status: 'approved' } : e
        )
      )
      toast.success(`${drafts.length} emails approved`)
    } catch { toast.error('Failed to approve emails') }
    finally { setSaving(false) }
  }

  if (emails.length === 0) {
    return null
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-amber-500">mail</span>
          <h3 className="text-sm font-semibold text-gray-900">Email outreach</h3>
          {allReviewed ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              <span className="material-symbols-outlined text-[12px]">check_circle</span>
              All reviewed
            </span>
          ) : (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
              {draftCount} to review
            </span>
          )}
        </div>
        {draftCount > 1 && hasRecipient && (
          <button
            className="text-xs font-medium text-primary hover:underline disabled:opacity-40"
            onClick={approveAll}
            disabled={saving}
          >
            Approve all
          </button>
        )}
      </div>

      {/* Sequence tabs */}
      <div className="flex border-b border-gray-100">
        {emails.map((email) => {
          const isActive = email.sequence_position === activePosition
          const status = email.review_status
          return (
            <button
              key={email.id}
              className={cn(
                'relative flex items-center gap-2 px-5 py-3 text-sm transition-colors',
                isActive
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
                status !== 'draft' && !isActive && 'opacity-60'
              )}
              onClick={() => {
                setActivePosition(email.sequence_position)
                setEditingId(null)
              }}
            >
              {status === 'approved' ? (
                <span className="material-symbols-outlined text-[14px] text-emerald-500">check_circle</span>
              ) : status === 'skipped' ? (
                <span className="material-symbols-outlined text-[14px] text-gray-400">skip_next</span>
              ) : (
                <span className="material-symbols-outlined text-[14px] text-gray-400">circle</span>
              )}
              <span>{SEQUENCE_LABELS[email.sequence_position] ?? `Email ${email.sequence_position}`}</span>
              {SEQUENCE_DELAY_HINTS[email.sequence_position] && (
                <span className="hidden text-[11px] text-gray-400 sm:inline">
                  {SEQUENCE_DELAY_HINTS[email.sequence_position]}
                </span>
              )}
              {/* Active indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          )
        })}
      </div>

      {/* Email content */}
      {currentEmail && (
        <div>
          {/* Action bar */}
          <div className="flex items-center justify-between border-b border-gray-50 px-5 py-2.5">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {currentEmail.template_variant && currentEmail.sequence_position === 1 && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                  {currentEmail.template_variant}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {editingId === currentEmail.id ? (
                <>
                  <Button variant="ghost" size="sm" onClick={cancelEditing} disabled={saving}>Cancel</Button>
                  <Button size="sm" onClick={() => saveEdit(currentEmail.id)} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : isDraft ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => startEditing(currentEmail)} className="text-gray-500 h-8 px-2.5 text-xs">
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => skipEmail(currentEmail.id)} disabled={saving} className="text-gray-500 h-8 px-2.5 text-xs">
                    <span className="material-symbols-outlined text-[14px]">skip_next</span>
                    Skip
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => approveEmail(currentEmail.id)}
                    disabled={saving || !hasRecipient}
                    title={!hasRecipient ? 'Select at least one recipient' : ''}
                    className="h-8 px-3 text-xs"
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    Approve
                  </Button>
                </>
              ) : (
                <span className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  currentEmail.review_status === 'approved' ? 'text-emerald-600' : 'text-gray-400'
                )}>
                  <span className="material-symbols-outlined text-[16px]">
                    {currentEmail.review_status === 'approved' ? 'check_circle' : 'skip_next'}
                  </span>
                  {currentEmail.review_status === 'approved' ? 'Approved' : 'Skipped'}
                </span>
              )}
            </div>
          </div>

          {/* To / From */}
          <div className="space-y-1.5 px-5 pt-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="w-9 shrink-0 pt-0.5 text-right text-xs font-medium text-gray-400">To</span>
              <div className="flex-1">
                {selectedRecipients.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectedRecipients.map((r) => (
                      <span key={r} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{r}</span>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setShowCandidates(!showCandidates)
                        if (!showCandidates) loadCandidates()
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCandidates(true)
                      loadCandidates()
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700"
                  >
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    Select recipient
                  </button>
                )}
              </div>
            </div>

            {/* Candidates picker */}
            {showCandidates && (
              <div className="ml-12 rounded-lg border border-gray-200 bg-white p-3">
                {loadingCandidates ? (
                  <p className="text-xs text-gray-400">Loading candidates...</p>
                ) : candidates.length === 0 ? (
                  <p className="text-xs text-gray-400">No email candidates found. Add one using the email candidates section above.</p>
                ) : (
                  <div className="space-y-1">
                    {candidates.map((c) => {
                      const isSelected = selectedRecipients.includes(c.email)
                      const isPrimary = primaryEmail === c.email
                      return (
                        <label
                          key={c.id}
                          className={cn(
                            'flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-gray-50',
                            isSelected && 'bg-primary/5'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRecipient(c.email)}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-primary"
                          />
                          <span className="flex-1 text-sm text-gray-800">
                            {c.email}
                            {isPrimary && (
                              <span className="ml-1.5 text-[10px] font-medium text-primary">primary</span>
                            )}
                          </span>
                          <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-medium', CONFIDENCE_COLORS[c.confidence] || 'text-gray-500 bg-gray-100')}>
                            {c.confidence}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {SOURCE_LABELS[c.source] || c.source}
                          </span>
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                setPrimaryEmail(c.email)
                              }}
                              className="text-[10px] font-medium text-gray-400 hover:text-primary"
                            >
                              Set primary
                            </button>
                          )}
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* From field */}
            {sendingAccounts.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="w-9 shrink-0 text-right text-xs font-medium text-gray-400">From</span>
                <select
                  value={selectedFromEmail}
                  onChange={(e) => setSelectedFromEmail(e.target.value)}
                  className="rounded-md border-0 bg-transparent py-0.5 text-sm text-gray-700 focus:outline-none focus:ring-0"
                >
                  {sendingAccounts.map((a) => (
                    <option key={a.email} value={a.email}>{a.email}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="mx-5 mt-3 border-b border-gray-100" />

          {/* Subject + body */}
          <div className="px-5 py-5 sm:px-8">
            {editingId === currentEmail.id ? (
              <>
                <input
                  className="mb-3 w-full border-0 bg-transparent text-lg font-semibold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-0"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  placeholder="Subject line..."
                />
                <textarea
                  className="min-h-[240px] w-full resize-y border-0 bg-transparent font-mono text-sm leading-relaxed text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-0"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  placeholder="Email body..."
                />
              </>
            ) : (
              <>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  {currentEmail.subject}
                </h3>
                <div
                  className="prose prose-sm max-w-none text-gray-700 [&_a]:text-primary [&_a]:underline [&_p]:my-2.5 [&_p]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: currentEmail.edited_body || currentEmail.body }}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
