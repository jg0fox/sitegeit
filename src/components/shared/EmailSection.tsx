'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmailThread } from './EmailThread'
import { EmailComposeDialog } from './EmailComposeDialog'

interface EmailSectionProps {
  businessId: string
  recipientEmail?: string | null
  recipientName: string
}

export function EmailSection({ businessId, recipientEmail, recipientName }: EmailSectionProps) {
  const [composing, setComposing] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">forum</span>
            <CardTitle>Email correspondence</CardTitle>
          </div>
          {recipientEmail && (
            <button
              onClick={() => setComposing(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              Send email
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {recipientEmail ? (
          <EmailThread
            businessId={businessId}
            recipientEmail={recipientEmail}
            recipientName={recipientName}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 py-6">
            <span className="material-symbols-outlined text-[32px] text-gray-300">mail</span>
            <p className="text-sm text-gray-400">
              Add an email address to start correspondence
            </p>
          </div>
        )}
      </CardContent>

      {composing && recipientEmail && (
        <EmailComposeDialog
          recipientEmail={recipientEmail}
          recipientName={recipientName}
          businessId={businessId}
          onClose={() => setComposing(false)}
        />
      )}
    </Card>
  )
}
