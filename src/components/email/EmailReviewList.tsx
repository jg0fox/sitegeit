'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  created_at: string
  business_id: string
}

interface BusinessGroup {
  business: {
    id: string
    name: string
    category: string
    email: string | null
    address_city: string | null
    address_state: string | null
  }
  emails: EmailData[]
}

const SEQUENCE_LABELS: Record<number, string> = {
  1: 'Primary outreach',
  2: 'Follow-up 1',
  3: 'Follow-up 2',
}

const SEQUENCE_DELAY_HINTS: Record<number, string> = {
  2: 'Sends 3 days after primary',
  3: 'Sends 5 days after follow-up 1',
}

export function EmailReviewList({ groups }: { groups: BusinessGroup[] }) {
  const [expandedBusiness, setExpandedBusiness] = useState<string | null>(
    groups[0]?.business.id ?? null
  )
  const [activeEmail, setActiveEmail] = useState<string | null>(
    groups[0]?.emails[0]?.id ?? null
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSubject, setEditSubject] = useState('')
  const [editBody, setEditBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set())
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set())
  // From-address management
  const [sendingAccounts, setSendingAccounts] = useState<{ email: string }[]>([])
  const [selectedFromEmail, setSelectedFromEmail] = useState('')
  // Track editable business emails (keyed by business ID)
  const [businessEmails, setBusinessEmails] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const g of groups) {
      initial[g.business.id] = g.business.email ?? ''
    }
    return initial
  })
  const [editingRecipient, setEditingRecipient] = useState<string | null>(null)
  const [recipientDraft, setRecipientDraft] = useState('')

  // Load sending accounts for from-address selection
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
      } catch {
        // silently fail
      }
    }
    loadAccounts()
  }, [])

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
      // Update local state
      for (const group of groups) {
        const email = group.emails.find((e) => e.id === emailId)
        if (email) {
          email.subject = editSubject
          email.edited_body = editBody
          break
        }
      }
    } catch {
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
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
        }),
      })
      if (!res.ok) throw new Error('Failed to approve')
      setApprovedIds((prev) => new Set(prev).add(emailId))
      toast.success('Email approved')
    } catch {
      toast.error('Failed to approve email')
    } finally {
      setSaving(false)
    }
  }

  async function approveAll(businessEmails: EmailData[]) {
    setSaving(true)
    try {
      await Promise.all(
        businessEmails
          .filter((e) => !approvedIds.has(e.id))
          .map((e) =>
            fetch(`/api/emails/${e.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                review_status: 'approved',
                ...(selectedFromEmail ? { from_email: selectedFromEmail } : {}),
              }),
            })
          )
      )
      const newApproved = new Set(approvedIds)
      businessEmails.forEach((e) => newApproved.add(e.id))
      setApprovedIds(newApproved)
      toast.success(`${businessEmails.length} emails approved`)
    } catch {
      toast.error('Failed to approve emails')
    } finally {
      setSaving(false)
    }
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
      setSkippedIds((prev) => new Set(prev).add(emailId))
      toast.success('Email skipped')
    } catch {
      toast.error('Failed to skip email')
    } finally {
      setSaving(false)
    }
  }

  function startEditingRecipient(businessId: string) {
    setRecipientDraft(businessEmails[businessId] ?? '')
    setEditingRecipient(businessId)
  }

  async function saveRecipientEmail(businessId: string) {
    const trimmed = recipientDraft.trim()
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
      setBusinessEmails((prev) => ({ ...prev, [businessId]: trimmed }))
      setEditingRecipient(null)
      toast.success(trimmed ? 'Recipient email updated' : 'Recipient email removed')
    } catch {
      toast.error('Failed to save recipient email')
    } finally {
      setSaving(false)
    }
  }

  const allEmails = groups.flatMap((g) => g.emails)
  const currentEmail = allEmails.find((e) => e.id === activeEmail)
  const currentBusiness = currentEmail
    ? groups.find((g) => g.emails.some((e) => e.id === currentEmail.id))?.business
    : null
  const currentRecipientEmail = currentBusiness ? businessEmails[currentBusiness.id] : ''
  const hasRecipientEmail = !!currentRecipientEmail
  const reviewedCount = allEmails.filter(
    (e) => approvedIds.has(e.id) || skippedIds.has(e.id)
  ).length
  const totalCount = allEmails.length

  // Navigate to next unreviewed email
  const moveToNext = useCallback(() => {
    const idx = allEmails.findIndex((e) => e.id === activeEmail)
    if (idx === -1) return
    for (let i = 1; i <= allEmails.length; i++) {
      const next = allEmails[(idx + i) % allEmails.length]
      if (!approvedIds.has(next.id) && !skippedIds.has(next.id)) {
        setActiveEmail(next.id)
        // expand the business group containing this email
        const group = groups.find((g) => g.emails.some((e) => e.id === next.id))
        if (group) setExpandedBusiness(group.business.id)
        return
      }
    }
  }, [activeEmail, allEmails, approvedIds, skippedIds, groups])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't fire when editing
      if (editingId || !currentEmail) return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      switch (e.key.toLowerCase()) {
        case 'a':
          if (!approvedIds.has(currentEmail.id) && !skippedIds.has(currentEmail.id) && hasRecipientEmail) {
            approveEmail(currentEmail.id)
          }
          break
        case 's':
          if (!approvedIds.has(currentEmail.id) && !skippedIds.has(currentEmail.id)) {
            skipEmail(currentEmail.id)
          }
          break
        case 'e':
          if (!approvedIds.has(currentEmail.id) && !skippedIds.has(currentEmail.id)) {
            startEditing(currentEmail)
          }
          break
        case 'arrowdown': {
          e.preventDefault()
          const idx = allEmails.findIndex((em) => em.id === activeEmail)
          if (idx < allEmails.length - 1) {
            const next = allEmails[idx + 1]
            setActiveEmail(next.id)
            const group = groups.find((g) => g.emails.some((em) => em.id === next.id))
            if (group) setExpandedBusiness(group.business.id)
          }
          break
        }
        case 'arrowup': {
          e.preventDefault()
          const idx = allEmails.findIndex((em) => em.id === activeEmail)
          if (idx > 0) {
            const prev = allEmails[idx - 1]
            setActiveEmail(prev.id)
            const group = groups.find((g) => g.emails.some((em) => em.id === prev.id))
            if (group) setExpandedBusiness(group.business.id)
          }
          break
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingId, currentEmail, activeEmail, allEmails, approvedIds, skippedIds, groups])

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      {/* Left panel: business groups */}
      <div className="space-y-3">
        {/* Progress bar */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs font-medium text-gray-600">
              {reviewedCount} of {totalCount} reviewed
            </p>
            <p className="text-xs text-gray-400">
              {groups.length} business{groups.length !== 1 ? 'es' : ''}
            </p>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: totalCount > 0 ? `${(reviewedCount / totalCount) * 100}%` : '0%' }}
            />
          </div>
        </div>
        {groups.map((group) => {
          const isExpanded = expandedBusiness === group.business.id
          const allApproved = group.emails.every(
            (e) => approvedIds.has(e.id) || skippedIds.has(e.id)
          )
          return (
            <Card
              key={group.business.id}
              className={cn(isExpanded && 'ring-1 ring-primary')}
            >
              <button
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                onClick={() => {
                  setExpandedBusiness(isExpanded ? null : group.business.id)
                  if (!isExpanded && group.emails[0]) {
                    setActiveEmail(group.emails[0].id)
                    setEditingId(null)
                  }
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {group.business.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {group.business.category}
                    {group.business.address_city &&
                      ` \u00b7 ${group.business.address_city}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {allApproved ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-success">
                      <span className="material-symbols-outlined text-[16px]">
                        check_circle
                      </span>
                      Approved
                    </span>
                  ) : (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-warning px-1.5 text-[10px] font-semibold text-white">
                      {group.emails.filter(
                        (e) => !approvedIds.has(e.id) && !skippedIds.has(e.id)
                      ).length}
                    </span>
                  )}
                  <span
                    className={cn(
                      'material-symbols-outlined text-[18px] text-gray-400 transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                  >
                    expand_more
                  </span>
                </div>
              </button>
              {isExpanded && (
                <div className="border-t border-gray-100 px-2 pb-2">
                  {group.emails.map((email) => (
                    <button
                      key={email.id}
                      className={cn(
                        'mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                        activeEmail === email.id
                          ? 'bg-primary-light text-primary'
                          : 'text-gray-600 hover:bg-gray-50'
                      )}
                      onClick={() => {
                        setActiveEmail(email.id)
                        setEditingId(null)
                      }}
                    >
                      {approvedIds.has(email.id) ? (
                        <span className="material-symbols-outlined text-[16px] text-success">
                          check_circle
                        </span>
                      ) : skippedIds.has(email.id) ? (
                        <span className="material-symbols-outlined text-[16px] text-gray-400">
                          skip_next
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">
                          mail
                        </span>
                      )}
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate">
                          {SEQUENCE_LABELS[email.sequence_position] ??
                            `Email ${email.sequence_position}`}
                        </span>
                        {SEQUENCE_DELAY_HINTS[email.sequence_position] && (
                          <span className="truncate text-[10px] text-gray-400">
                            {SEQUENCE_DELAY_HINTS[email.sequence_position]}
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                  {!allApproved && (
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => approveAll(group.emails.filter((e) => !skippedIds.has(e.id)))}
                      disabled={saving || !businessEmails[group.business.id]}
                      title={!businessEmails[group.business.id] ? 'Add a recipient email before approving' : undefined}
                    >
                      Approve remaining
                    </Button>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Right panel: email preview/editor */}
      <div>
        {currentEmail ? (
          <>
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    {SEQUENCE_LABELS[currentEmail.sequence_position] ??
                      `Email ${currentEmail.sequence_position}`}
                  </p>
                  {SEQUENCE_DELAY_HINTS[currentEmail.sequence_position] && (
                    <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      {SEQUENCE_DELAY_HINTS[currentEmail.sequence_position]}
                    </span>
                  )}
                </div>
                {editingId === currentEmail.id ? (
                  <input
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-1.5 text-base font-semibold text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                  />
                ) : (
                  <CardTitle className="mt-1">
                    {currentEmail.subject}
                  </CardTitle>
                )}
              </div>
              <div className="flex gap-2">
                {editingId === currentEmail.id ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEditing}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveEdit(currentEmail.id)}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save changes'}
                    </Button>
                  </>
                ) : (
                  <>
                    {!approvedIds.has(currentEmail.id) && !skippedIds.has(currentEmail.id) && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(currentEmail)}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            edit
                          </span>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => skipEmail(currentEmail.id)}
                          disabled={saving}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            skip_next
                          </span>
                          Skip
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => approveEmail(currentEmail.id)}
                          disabled={saving || !hasRecipientEmail}
                          title={!hasRecipientEmail ? 'Add a recipient email before approving' : undefined}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            check
                          </span>
                          Approve
                        </Button>
                      </>
                    )}
                    {approvedIds.has(currentEmail.id) && (
                      <span className="flex items-center gap-1 text-sm font-medium text-success">
                        <span className="material-symbols-outlined text-[18px]">
                          check_circle
                        </span>
                        Approved
                      </span>
                    )}
                    {skippedIds.has(currentEmail.id) && !approvedIds.has(currentEmail.id) && (
                      <span className="flex items-center gap-1 text-sm font-medium text-gray-400">
                        <span className="material-symbols-outlined text-[18px]">
                          skip_next
                        </span>
                        Skipped
                      </span>
                    )}
                  </>
                )}
              </div>
            </CardHeader>
            {/* Recipient email bar */}
            {currentBusiness && (
              <div className={cn(
                'mx-6 mb-2 flex items-center gap-2 rounded-lg px-4 py-2.5',
                hasRecipientEmail ? 'bg-gray-50' : 'bg-amber-50 border border-amber-200'
              )}>
                <span className={cn(
                  'material-symbols-outlined text-[18px]',
                  hasRecipientEmail ? 'text-gray-400' : 'text-amber-500'
                )}>
                  {hasRecipientEmail ? 'mail' : 'warning'}
                </span>
                {editingRecipient === currentBusiness.id ? (
                  <input
                    autoFocus
                    type="email"
                    value={recipientDraft}
                    onChange={(e) => setRecipientDraft(e.target.value)}
                    onBlur={() => saveRecipientEmail(currentBusiness.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); saveRecipientEmail(currentBusiness.id) }
                      if (e.key === 'Escape') setEditingRecipient(null)
                    }}
                    placeholder="recipient@example.com"
                    className="h-7 flex-1 rounded border border-gray-300 px-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : hasRecipientEmail ? (
                  <button
                    type="button"
                    onClick={() => startEditingRecipient(currentBusiness.id)}
                    className="flex-1 text-left text-sm text-gray-700 hover:text-primary"
                    title="Click to edit recipient email"
                  >
                    To: {currentRecipientEmail}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEditingRecipient(currentBusiness.id)}
                    className="flex-1 text-left text-sm font-medium text-amber-700 hover:text-amber-900"
                  >
                    No recipient email — click to add
                  </button>
                )}
                {editingRecipient !== currentBusiness.id && (
                  <button
                    type="button"
                    onClick={() => startEditingRecipient(currentBusiness.id)}
                    className="text-gray-400 hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                )}
              </div>
            )}
            {/* From-address selector */}
            {sendingAccounts.length > 0 && (
              <div className="mx-6 mb-2 flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2.5">
                <span className="material-symbols-outlined text-[18px] text-gray-400">outgoing_mail</span>
                <label htmlFor="from-address" className="text-sm text-gray-500">From:</label>
                <select
                  id="from-address"
                  value={selectedFromEmail}
                  onChange={(e) => setSelectedFromEmail(e.target.value)}
                  className="flex-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {sendingAccounts.map((a) => (
                    <option key={a.email} value={a.email}>{a.email}</option>
                  ))}
                </select>
              </div>
            )}
            <CardContent>
              {editingId === currentEmail.id ? (
                <textarea
                  className="h-80 w-full resize-y rounded-md border border-gray-200 px-4 py-3 font-mono text-sm leading-relaxed text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                />
              ) : (
                <div className="rounded-lg bg-gray-50 px-6 py-5">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700">
                    {currentEmail.edited_body || currentEmail.body}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Keyboard shortcut hints */}
          {!editingId && (
            <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-gray-400">
              <span><kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px]">A</kbd> approve</span>
              <span><kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px]">S</kbd> skip</span>
              <span><kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px]">E</kbd> edit</span>
              <span><kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px]">&uarr;&darr;</kbd> navigate</span>
            </div>
          )}
          </>
        ) : (
          <Card className="flex items-center justify-center px-6 py-20">
            <p className="text-sm text-gray-400">
              Select an email to preview
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
