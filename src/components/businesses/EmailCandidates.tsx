'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface EmailCandidate {
  id: string
  email: string
  source: string
  confidence: string
  source_url: string | null
  source_context: string | null
  is_selected: boolean
  created_at: string
}

interface EmailCandidatesProps {
  businessId: string
  initialCandidates: EmailCandidate[]
  primaryEmail: string | null
}

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  website_scrape: { label: 'Website', color: 'bg-emerald-50 text-emerald-700' },
  web_search: { label: 'Web search', color: 'bg-blue-50 text-blue-700' },
  hunter: { label: 'Hunter.io', color: 'bg-purple-50 text-purple-700' },
  mx_pattern: { label: 'Pattern', color: 'bg-gray-100 text-gray-600' },
  manual: { label: 'Manual', color: 'bg-amber-50 text-amber-700' },
}

const CONFIDENCE_STYLES: Record<string, string> = {
  high: 'text-emerald-600',
  medium: 'text-amber-600',
  low: 'text-gray-400',
}

export function EmailCandidates({ businessId, initialCandidates, primaryEmail }: EmailCandidatesProps) {
  const [candidates, setCandidates] = useState<EmailCandidate[]>(initialCandidates)
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [addEmail, setAddEmail] = useState('')
  const addInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isAdding) {
      addInputRef.current?.focus()
    }
  }, [isAdding])

  const handleSearch = async () => {
    setIsSearching(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}/email-search`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setCandidates(data.candidates)
      if (data.new_candidates > 0) {
        toast.success(`Found ${data.new_candidates} new email candidate${data.new_candidates !== 1 ? 's' : ''}`)
      } else {
        toast.info('No new email candidates found')
      }
    } catch {
      toast.error('Email search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const handleToggleSelect = async (candidate: EmailCandidate) => {
    const newSelected = !candidate.is_selected

    // Optimistic update
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidate.id ? { ...c, is_selected: newSelected } : c))
    )

    try {
      const res = await fetch(`/api/businesses/${businessId}/email-candidates`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: candidate.id, is_selected: newSelected }),
      })
      if (!res.ok) throw new Error('Failed to update')
    } catch {
      // Revert on failure
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidate.id ? { ...c, is_selected: !newSelected } : c))
      )
      toast.error('Failed to update selection')
    }
  }

  const handleSetPrimary = async (candidate: EmailCandidate) => {
    try {
      const res = await fetch(`/api/businesses/${businessId}/email-candidates`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: candidate.id, set_primary: true }),
      })
      if (!res.ok) throw new Error('Failed to update')
      toast.success(`${candidate.email} set as primary email`)

      // Mark as selected too
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidate.id ? { ...c, is_selected: true } : c))
      )
    } catch {
      toast.error('Failed to set primary email')
    }
  }

  const handleDelete = async (candidate: EmailCandidate) => {
    // Optimistic removal
    setCandidates((prev) => prev.filter((c) => c.id !== candidate.id))

    try {
      const res = await fetch(
        `/api/businesses/${businessId}/email-candidates?candidateId=${candidate.id}`,
        { method: 'DELETE' }
      )
      if (!res.ok) throw new Error('Failed to delete')
    } catch {
      // Revert
      setCandidates((prev) => [...prev, candidate].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ))
      toast.error('Failed to remove email')
    }
  }

  const handleAddManual = async () => {
    const email = addEmail.trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Enter a valid email address')
      return
    }

    try {
      const res = await fetch(`/api/businesses/${businessId}/email-candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to add')
      }
      const candidate = await res.json()
      setCandidates((prev) => {
        if (prev.some((c) => c.email === candidate.email)) return prev
        return [...prev, candidate]
      })
      setAddEmail('')
      setIsAdding(false)
      toast.success('Email added')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add email')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-blue-500">contact_mail</span>
            <CardTitle>
              Email candidates
              {candidates.length > 0 && (
                <span className="ml-1.5 text-sm font-normal text-gray-400">
                  ({candidates.length})
                </span>
              )}
            </CardTitle>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                Searching...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">search</span>
                Search again
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {candidates.length === 0 && !isSearching ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <span className="material-symbols-outlined text-[32px] text-gray-300">mail_lock</span>
            <p className="text-sm text-gray-500">No email candidates found yet.</p>
            <p className="text-xs text-gray-400">Click &quot;Search again&quot; to scan the web, or add one manually.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {candidates.map((candidate) => {
              const sourceInfo = SOURCE_LABELS[candidate.source] || { label: candidate.source, color: 'bg-gray-100 text-gray-600' }
              const isPrimary = primaryEmail === candidate.email

              return (
                <div
                  key={candidate.id}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
                >
                  {/* Selection checkbox */}
                  <input
                    type="checkbox"
                    checked={candidate.is_selected}
                    onChange={() => handleToggleSelect(candidate)}
                    className="h-3.5 w-3.5 shrink-0 rounded border-gray-300 text-primary focus:ring-primary"
                  />

                  {/* Email address */}
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
                    {candidate.email}
                    {isPrimary && (
                      <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        Primary
                      </span>
                    )}
                  </span>

                  {/* Source badge */}
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${sourceInfo.color}`}>
                    {sourceInfo.label}
                  </span>

                  {/* Confidence */}
                  <span className={`shrink-0 text-[10px] font-medium uppercase ${CONFIDENCE_STYLES[candidate.confidence] || 'text-gray-400'}`}>
                    {candidate.confidence}
                  </span>

                  {/* Actions (visible on hover) */}
                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(candidate)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-primary"
                        title="Set as primary email"
                      >
                        <span className="material-symbols-outlined text-[16px]">star</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(candidate)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      title="Remove"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Add manually */}
        <div className="mt-3 border-t border-gray-100 pt-3">
          {isAdding ? (
            <div className="flex items-center gap-2">
              <input
                ref={addInputRef}
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddManual()
                  if (e.key === 'Escape') { setIsAdding(false); setAddEmail('') }
                }}
                placeholder="email@example.com"
                className="h-8 flex-1 rounded-md border border-gray-300 px-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button size="sm" onClick={handleAddManual}>
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setIsAdding(false); setAddEmail('') }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add email manually
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
