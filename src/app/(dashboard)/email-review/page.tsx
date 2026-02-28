import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { EmailReviewList } from '@/components/email/EmailReviewList'

interface EmailRow {
  id: string
  subject: string
  body: string
  edited_body: string | null
  review_status: string
  sequence_position: number
  created_at: string
  business_id: string
  businesses: {
    id: string
    name: string
    category: string
    address_city: string | null
    address_state: string | null
  }
}

export default async function EmailReviewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in to review emails.</div>
  }

  const { data: emails } = await supabase
    .from('outreach_emails')
    .select(
      'id, subject, body, edited_body, review_status, sequence_position, created_at, business_id, businesses!inner(id, name, category, address_city, address_state)'
    )
    .eq('businesses.user_id', user.id)
    .eq('review_status', 'draft')
    .order('created_at', { ascending: true })

  const typedEmails = (emails ?? []) as unknown as EmailRow[]

  // Group emails by business
  const grouped = new Map<
    string,
    { business: EmailRow['businesses']; emails: EmailRow[] }
  >()
  for (const email of typedEmails) {
    const key = email.business_id
    if (!grouped.has(key)) {
      grouped.set(key, { business: email.businesses, emails: [] })
    }
    grouped.get(key)!.emails.push(email)
  }

  const groups = Array.from(grouped.values())

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          Review, edit, and approve outreach emails before they send.
        </p>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon="rate_review"
          title="No emails to review"
          description="When the pipeline generates outreach emails, they'll appear here for your review before sending."
          action={
            <Button asChild variant="outline">
              <Link href="/pipeline">View pipeline</Link>
            </Button>
          }
        />
      ) : (
        <EmailReviewList groups={groups} />
      )}
    </div>
  )
}
