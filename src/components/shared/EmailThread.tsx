'use client'

import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils/cn'
import { EmailComposeDialog } from './EmailComposeDialog'

interface EmailMessage {
  id: string
  direction: 'outbound' | 'inbound'
  from_email: string
  to_email: string
  subject: string | null
  body_html: string | null
  body_text: string | null
  sent_at: string
}

interface EmailThreadProps {
  businessId?: string
  bookingId?: string
  recipientEmail?: string
  recipientName?: string
  defaultSubject?: string
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  if (diffDays === 0) return `Today at ${time}`
  if (diffDays === 1) return `Yesterday at ${time}`
  if (diffDays < 7) return `${d.toLocaleDateString('en-US', { weekday: 'short' })} at ${time}`
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${time}`
}

export function EmailThread({
  businessId,
  bookingId,
  recipientEmail,
  recipientName = 'Contact',
  defaultSubject,
}: EmailThreadProps) {
  const [messages, setMessages] = useState<EmailMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [composing, setComposing] = useState(false)

  const loadMessages = useCallback(async () => {
    const params = new URLSearchParams()
    if (businessId) params.set('business_id', businessId)
    if (bookingId) params.set('booking_id', bookingId)

    if (!params.toString()) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/emails/thread?${params}`)
      if (res.ok) {
        setMessages(await res.json())
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [businessId, bookingId])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  if (loading) {
    return (
      <div className="py-6 text-center text-sm text-gray-400">Loading messages...</div>
    )
  }

  return (
    <div className="space-y-3">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6">
          <span className="material-symbols-outlined text-[32px] text-gray-300">forum</span>
          <p className="text-sm text-gray-400">No emails yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg, i) => {
            const isOutbound = msg.direction === 'outbound'
            const showSubject = i === 0 || msg.subject !== messages[i - 1]?.subject

            return (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  isOutbound ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-xl px-4 py-3',
                    isOutbound
                      ? 'bg-primary/10 text-gray-900'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  {/* Sender + time */}
                  <div className="mb-1 flex items-center gap-2 text-[11px] text-gray-500">
                    <span className="font-medium">
                      {isOutbound ? 'You' : (msg.from_email || recipientName)}
                    </span>
                    <span>{formatTime(msg.sent_at)}</span>
                  </div>

                  {/* Subject (show on first message or when changed) */}
                  {showSubject && msg.subject && (
                    <p className="mb-1 text-xs font-semibold text-gray-700">
                      {msg.subject}
                    </p>
                  )}

                  {/* Body */}
                  {msg.body_html ? (
                    <div
                      className="prose prose-sm max-w-none text-sm leading-relaxed [&_a]:text-primary"
                      dangerouslySetInnerHTML={{ __html: msg.body_html }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.body_text || ''}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Compose button */}
      {recipientEmail && (
        <button
          onClick={() => setComposing(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          {messages.length > 0 ? 'Send another email' : 'Send an email'}
        </button>
      )}

      {/* Compose dialog */}
      {composing && recipientEmail && (
        <EmailComposeDialog
          recipientEmail={recipientEmail}
          recipientName={recipientName}
          businessId={businessId}
          bookingId={bookingId}
          defaultSubject={defaultSubject}
          onClose={() => setComposing(false)}
          onSent={loadMessages}
        />
      )}
    </div>
  )
}
