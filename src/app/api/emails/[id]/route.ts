import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { subject, body: emailBody, review_status } = body

  // Verify the email belongs to the user
  const { data: email } = await supabase
    .from('outreach_emails')
    .select('id, business_id, businesses!inner(user_id)')
    .eq('id', id)
    .single()

  if (!email) {
    return NextResponse.json({ error: 'Email not found' }, { status: 404 })
  }

  const business = email.businesses as unknown as { user_id: string }
  if (business.user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Build update payload
  const update: Record<string, unknown> = {}
  if (subject !== undefined) update.subject = subject
  if (emailBody !== undefined) update.edited_body = emailBody
  if (review_status !== undefined) {
    update.review_status = review_status
    if (review_status === 'approved') {
      update.reviewed_at = new Date().toISOString()
    }
  }

  const { data: updated, error } = await supabase
    .from('outreach_emails')
    .update(update)
    .eq('id', id)
    .select('id, subject, body, edited_body, review_status, reviewed_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(updated)
}
