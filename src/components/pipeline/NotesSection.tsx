'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface Note {
  id: string
  content: string
  created_at: string
}

export function NotesSection({
  businessId,
  initialNotes,
}: {
  businessId: string
  initialNotes: Note[]
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  async function addNote() {
    const trimmed = content.trim()
    if (!trimmed) return

    setSaving(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      })
      if (!res.ok) throw new Error('Failed to save note')
      const note = await res.json()
      setNotes((prev) => [note, ...prev])
      setContent('')
      toast.success('Note added')
    } catch {
      toast.error('Failed to add note')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-gray-500">sticky_note_2</span>
          <CardTitle>Notes</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a note..."
            rows={2}
            className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                addNote()
              }
            }}
          />
          <Button
            size="sm"
            onClick={addNote}
            disabled={saving || !content.trim()}
            className="self-end"
          >
            {saving ? 'Saving...' : 'Add note'}
          </Button>
        </div>

        {notes.length > 0 && (
          <div className="mt-4 space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="rounded-lg bg-gray-50 px-4 py-3">
                <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                  {note.content}
                </p>
                <p className="mt-1.5 text-xs text-gray-400">
                  {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        )}

        {notes.length === 0 && (
          <p className="mt-3 text-xs text-gray-400">
            No notes yet. Add one to keep track of conversations or next steps.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
