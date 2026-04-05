'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
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
  template_variant?: string | null
  to_emails?: string[] | null
}

interface EmailCandidate {
  id: string
  email: string
  source: string
  confidence: string
  is_selected: boolean
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

export function EmailReviewList({ groups, focusBusinessId }: { groups: BusinessGroup[]; focusBusinessId?: string | null }) {
  // Sort groups: focused business first, then alphabetical by name
  const sortedGroups = [...groups].sort((a, b) => {
    if (focusBusinessId) {
      if (a.business.id === focusBusinessId) return -1
      if (b.business.id === focusBusinessId) return 1
    }
    return a.business.name.localeCompare(b.business.name)
  })

  const initialBusiness = focusBusinessId
    ? sortedGroups.find((g) => g.business.id === focusBusinessId)?.business.id ?? sortedGroups[0]?.business.id ?? null
    : sortedGroups[0]?.business.id ?? null
  const initialEmail = sortedGroups.find((g) => g.business.id === initialBusiness)?.emails[0]?.id ?? null

  const [expandedBusiness, setExpandedBusiness] = useState<string | null>(initialBusiness)
  const [activeEmail, setActiveEmail] = useState<string | null>(initialEmail)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSubject, setEditSubject] = useState('')
  const [editBody, setEditBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set())
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set())
  const [sendingAccounts, setSendingAccounts] = useState<{ email: string }[]>([])
  const [selectedFromEmail, setSelectedFromEmail] = useState('')
  const [businessEmails, setBusinessEmails] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const g of groups) {
      initial[g.business.id] = g.business.email ?? ''
    }
    return initial
  })
  const [selectedRecipients, setSelectedRecipients] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {}
    for (const g of groups) {
      if (g.business.email) initial[g.business.id] = [g.business.email]
    }
    return initial
  })
  const [candidates, setCandidates] = useState<Record<string, EmailCandidate[]>>({})
  const [loadingCandidates, setLoadingCandidates] = useState<string | null>(null)
  const [showCandidates, setShowCandidates] = useState<string | null>(null)

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

  async function loadCandidatesForBusiness(businessId: string) {
    if (candidates[businessId]) return
    setLoadingCandidates(businessId)
    try {
      const res = await fetch(`/api/businesses/${businessId}/email-candidates`)
      if (res.ok) {
        const data = await res.json()
        setCandidates((prev) => ({ ...prev, [businessId]: data || [] }))
      }
    } catch {
      // silently fail
    } finally {
      setLoadingCandidates(null)
    }
  }

  function toggleRecipient(businessId: string, email: string) {
    setSelectedRecipients((prev) => {
      const current = prev[businessId] || []
      if (current.includes(email)) {
        return { ...prev, [businessId]: current.filter((e) => e !== email) }
      } else {
        return { ...prev, [businessId]: [...current, email] }
      }
    })
  }

  async function setPrimaryEmail(businessId: string, email: string) {
    setSaving(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setBusinessEmails((prev) => ({ ...prev, [businessId]: email }))
        setSelectedRecipients((prev) => {
          const current = prev[businessId] || []
          if (!current.includes(email)) return { ...prev, [businessId]: [email, ...current] }
          return prev
        })
        toast.success('Primary email updated')
      }
    } catch {
      toast.error('Failed to update email')
    } finally {
      setSaving(false)
    }
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
      for (const group of sortedGroups) {
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

  async function approveEmail(emailId: string, businessId?: string) {
    setSaving(true)
    try {
      const toEmails = businessId ? selectedRecipients[businessId] : undefined
      const res = await fetch(`/api/emails/${emailId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_status: 'approved',
          ...(selectedFromEmail ? { from_email: selectedFromEmail } : {}),
          ...(toEmails && toEmails.length > 0 ? { to_emails: toEmails } : {}),
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

  async function approveAll(businessEmails: EmailData[], businessId: string) {
    setSaving(true)
    try {
      const toEmails = selectedRecipients[businessId]
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
                ...(toEmails && toEmails.length > 0 ? { to_emails: toEmails } : {}),
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

  const allEmails = sortedGroups.flatMap((g) => g.emails)
  const currentEmail = allEmails.find((e) => e.id === activeEmail)
  const currentGroup = currentEmail
    ? sortedGroups.find((g) => g.emails.some((e) => e.id === currentEmail.id))
    : null
  const currentBusiness = currentGroup?.business ?? null
  const currentRecipients = currentBusiness ? (selectedRecipients[currentBusiness.id] || []) : []
  const hasRecipientEmail = currentRecipients.length > 0
  const reviewedCount = allEmails.filter(
    (e) => approvedIds.has(e.id) || skippedIds.has(e.id)
  ).length
  const totalCount = allEmails.length
  const isCurrentDraft = currentEmail && !approvedIds.has(currentEmail.id) && !skippedIds.has(currentEmail.id)

  const moveToNext = useCallback(() => {
    const idx = allEmails.findIndex((e) => e.id === activeEmail)
    if (idx === -1) return
    for (let i = 1; i <= allEmails.length; i++) {
      const next = allEmails[(idx + i) % allEmails.length]
      if (!approvedIds.has(next.id) && !skippedIds.has(next.id)) {
        setActiveEmail(next.id)
        const group = sortedGroups.find((g) => g.emails.some((e) => e.id === next.id))
        if (group) setExpandedBusiness(group.business.id)
        return
      }
    }
  }, [activeEmail, allEmails, approvedIds, skippedIds, sortedGroups])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (editingId || !currentEmail) return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      switch (e.key.toLowerCase()) {
        case 'a':
          if (isCurrentDraft && hasRecipientEmail) {
            approveEmail(currentEmail.id, currentBusiness?.id)
          }
          break
        case 's':
          if (isCurrentDraft) skipEmail(currentEmail.id)
          break
        case 'e':
          if (isCurrentDraft) startEditing(currentEmail)
          break
        case 'arrowdown': {
          e.preventDefault()
          const idx = allEmails.findIndex((em) => em.id === activeEmail)
          if (idx < allEmails.length - 1) {
            const next = allEmails[idx + 1]
            setActiveEmail(next.id)
            const group = sortedGroups.find((g) => g.emails.some((em) => em.id === next.id))
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
            const group = sortedGroups.find((g) => g.emails.some((em) => em.id === prev.id))
            if (group) setExpandedBusiness(group.business.id)
          }
          break
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingId, currentEmail, activeEmail, allEmails, approvedIds, skippedIds, sortedGroups, hasRecipientEmail, currentBusiness, isCurrentDraft, moveToNext])

  const focusedBusiness = focusBusinessId
    ? sortedGroups.find((g) => g.business.id === focusBusinessId)?.business
    : null

  return (
    <div className="flex flex-col gap-4 lg:gap-0">
      {/* Top bar: back link + progress */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {focusedBusiness && (
            <Link
              href={`/businesses/${focusedBusiness.id}`}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              {focusedBusiness.name}
            </Link>
          )}
          {focusedBusiness && <span className="text-gray-300">|</span>}
          <p className="text-sm text-gray-500">
            {reviewedCount} of {totalCount} reviewed
          </p>
        </div>
        {!editingId && (
          <div className="hidden items-center gap-3 text-[11px] text-gray-400 sm:flex">
            <span><kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono text-[10px]">A</kbd> approve</span>
            <span><kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono text-[10px]">S</kbd> skip</span>
            <span><kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono text-[10px]">E</kbd> edit</span>
            <span><kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono text-[10px]">&uarr;&darr;</kbd> nav</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200 lg:mb-4">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: totalCount > 0 ? `${(reviewedCount / totalCount) * 100}%` : '0%' }}
        />
      </div>

      {/* Main layout */}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-0 lg:rounded-xl lg:border lg:border-gray-200 lg:bg-white lg:shadow-sm" style={{ minHeight: 'calc(100vh - 12rem)' }}>

        {/* Left panel: flat inbox list */}
        <div className="lg:w-80 lg:shrink-0 lg:border-r lg:border-gray-200 lg:overflow-y-auto" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
          {sortedGroups.map((group) => {
            const isExpanded = expandedBusiness === group.business.id
            const pendingCount = group.emails.filter(
              (e) => !approvedIds.has(e.id) && !skippedIds.has(e.id)
            ).length
            const allDone = pendingCount === 0

            return (
              <div key={group.business.id}>
                {/* Business section header */}
                <button
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50',
                    isExpanded && 'bg-gray-50'
                  )}
                  onClick={() => {
                    setExpandedBusiness(isExpanded ? null : group.business.id)
                    if (!isExpanded && group.emails[0]) {
                      setActiveEmail(group.emails[0].id)
                      setEditingId(null)
                      loadCandidatesForBusiness(group.business.id)
                    }
                  }}
                >
                  <span
                    className={cn(
                      'material-symbols-outlined text-[18px] text-gray-400 transition-transform',
                      isExpanded && 'rotate-90'
                    )}
                  >
                    chevron_right
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {group.business.name}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {group.business.category}
                      {group.business.address_city && ` \u00b7 ${group.business.address_city}`}
                    </p>
                  </div>
                  {allDone ? (
                    <span className="material-symbols-outlined text-[18px] text-emerald-500">check_circle</span>
                  ) : (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-200 px-1.5 text-[10px] font-semibold text-gray-600">
                      {pendingCount}
                    </span>
                  )}
                </button>

                {/* Email rows within this business */}
                {isExpanded && (
                  <div className="pb-1">
                    {group.emails.map((email) => {
                      const isActive = activeEmail === email.id
                      const isApproved = approvedIds.has(email.id)
                      const isSkipped = skippedIds.has(email.id)
                      return (
                        <button
                          key={email.id}
                          className={cn(
                            'flex w-full items-center gap-3 py-2 pl-11 pr-4 text-left text-sm transition-colors',
                            isActive
                              ? 'bg-primary/5 text-gray-900 border-l-2 border-primary'
                              : 'text-gray-600 hover:bg-gray-50 border-l-2 border-transparent',
                            (isApproved || isSkipped) && 'opacity-50'
                          )}
                          onClick={() => {
                            setActiveEmail(email.id)
                            setEditingId(null)
                          }}
                        >
                          {isApproved ? (
                            <span className="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
                          ) : isSkipped ? (
                            <span className="material-symbols-outlined text-[16px] text-gray-400">skip_next</span>
                          ) : (
                            <span className="material-symbols-outlined text-[16px] text-gray-400">mail</span>
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="block truncate text-[13px]">
                              {SEQUENCE_LABELS[email.sequence_position] ?? `Email ${email.sequence_position}`}
                            </span>
                            {SEQUENCE_DELAY_HINTS[email.sequence_position] && (
                              <span className="block truncate text-[11px] text-gray-400">
                                {SEQUENCE_DELAY_HINTS[email.sequence_position]}
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                    {!allDone && (
                      <div className="px-4 pb-2 pl-11">
                        <button
                          className="w-full rounded-md py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors disabled:opacity-40"
                          onClick={() => approveAll(group.emails.filter((e) => !skippedIds.has(e.id)), group.business.id)}
                          disabled={saving || (selectedRecipients[group.business.id] || []).length === 0}
                        >
                          Approve all remaining
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Divider between groups */}
                <div className="border-b border-gray-100" />
              </div>
            )
          })}
        </div>

        {/* Right panel: reading pane */}
        <div className="flex-1 lg:overflow-y-auto" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
          {currentEmail && currentBusiness ? (
            <div className="flex flex-col">
              {/* Action toolbar */}
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-100 bg-white/95 px-6 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Link href={`/businesses/${currentBusiness.id}`} className="font-medium text-gray-700 hover:text-primary transition-colors">
                    {currentBusiness.name}
                  </Link>
                  <span className="text-gray-300">/</span>
                  <span>{SEQUENCE_LABELS[currentEmail.sequence_position] ?? `Email ${currentEmail.sequence_position}`}</span>
                  {SEQUENCE_DELAY_HINTS[currentEmail.sequence_position] && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      {SEQUENCE_DELAY_HINTS[currentEmail.sequence_position]}
                    </span>
                  )}
                  {currentEmail.template_variant && currentEmail.sequence_position === 1 && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      {currentEmail.template_variant}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {editingId === currentEmail.id ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={cancelEditing} disabled={saving}>Cancel</Button>
                      <Button size="sm" onClick={() => saveEdit(currentEmail.id)} disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                    </>
                  ) : isCurrentDraft ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => startEditing(currentEmail)} className="text-gray-500">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => skipEmail(currentEmail.id)} disabled={saving} className="text-gray-500">
                        <span className="material-symbols-outlined text-[16px]">skip_next</span>
                        Skip
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => approveEmail(currentEmail.id, currentBusiness.id)}
                        disabled={saving || !hasRecipientEmail}
                        title={!hasRecipientEmail ? 'Select at least one recipient email' : ''}
                      >
                        <span className="material-symbols-outlined text-[16px]">check</span>
                        Approve
                      </Button>
                    </>
                  ) : (
                    <span className={cn(
                      'flex items-center gap-1.5 text-sm font-medium',
                      approvedIds.has(currentEmail.id) ? 'text-emerald-600' : 'text-gray-400'
                    )}>
                      <span className="material-symbols-outlined text-[18px]">
                        {approvedIds.has(currentEmail.id) ? 'check_circle' : 'skip_next'}
                      </span>
                      {approvedIds.has(currentEmail.id) ? 'Approved' : 'Skipped'}
                    </span>
                  )}
                </div>
              </div>

              {/* Email content */}
              <div className="px-6 py-6 lg:px-10 lg:py-8">
                {/* To / From fields */}
                <div className="mb-6 space-y-2 text-sm">
                  {/* To field */}
                  <div className="flex items-start gap-3">
                    <span className="w-10 shrink-0 pt-0.5 text-right text-xs font-medium text-gray-400">To</span>
                    <div className="flex-1">
                      {currentRecipients.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {currentRecipients.map((r) => (
                            <span key={r} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{r}</span>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              if (showCandidates === currentBusiness.id) {
                                setShowCandidates(null)
                              } else {
                                setShowCandidates(currentBusiness.id)
                                loadCandidatesForBusiness(currentBusiness.id)
                              }
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
                            setShowCandidates(currentBusiness.id)
                            loadCandidatesForBusiness(currentBusiness.id)
                          }}
                          className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700"
                        >
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                          Select recipient
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Candidates picker (inline) */}
                  {showCandidates === currentBusiness.id && (
                    <div className="ml-[52px] rounded-lg border border-gray-200 bg-white p-3">
                      {loadingCandidates === currentBusiness.id ? (
                        <p className="text-xs text-gray-400">Loading candidates...</p>
                      ) : (candidates[currentBusiness.id] || []).length === 0 ? (
                        <p className="text-xs text-gray-400">No email candidates found. Add one manually on the business detail page.</p>
                      ) : (
                        <div className="space-y-1">
                          {(candidates[currentBusiness.id] || []).map((c) => {
                            const isSelected = currentRecipients.includes(c.email)
                            const isPrimary = businessEmails[currentBusiness.id] === c.email
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
                                  onChange={() => toggleRecipient(currentBusiness.id, c.email)}
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
                                      setPrimaryEmail(currentBusiness.id, c.email)
                                    }}
                                    className="text-[10px] font-medium text-gray-400 hover:text-primary"
                                    title="Set as primary email"
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
                      <span className="w-10 shrink-0 text-right text-xs font-medium text-gray-400">From</span>
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
                <div className="border-b border-gray-100 mb-6" />

                {/* Subject */}
                {editingId === currentEmail.id ? (
                  <input
                    className="mb-4 w-full border-0 bg-transparent text-xl font-semibold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-0"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    placeholder="Subject line..."
                  />
                ) : (
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">
                    {currentEmail.subject}
                  </h2>
                )}

                {/* Body */}
                {editingId === currentEmail.id ? (
                  <textarea
                    className="min-h-[320px] w-full resize-y border-0 bg-transparent font-mono text-sm leading-relaxed text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-0"
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    placeholder="Email body..."
                  />
                ) : (
                  <div
                    className="prose prose-sm max-w-none text-gray-700 [&_a]:text-primary [&_a]:underline [&_p]:my-3 [&_p]:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: currentEmail.edited_body || currentEmail.body }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              <div className="text-center">
                <span className="material-symbols-outlined mb-2 text-[32px] text-gray-300">mail</span>
                <p>Select an email to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
