import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string }>
}

/**
 * GET /api/businesses/[id]/email-candidates
 * Fetch all email candidates for a business, ordered by confidence.
 */
export async function GET(_request: Request, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify business ownership
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: candidates, error } = await supabase
    .from('email_candidates')
    .select('*')
    .eq('business_id', id)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Sort: high > medium > low confidence, then by created_at
  const order: Record<string, number> = { high: 0, medium: 1, low: 2 }
  const sorted = (candidates || []).sort(
    (a, b) => (order[a.confidence] ?? 3) - (order[b.confidence] ?? 3)
  )

  return NextResponse.json(sorted)
}

/**
 * POST /api/businesses/[id]/email-candidates
 * Add a manual email candidate.
 */
export async function POST(request: Request, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const email = body.email?.trim()?.toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  // Verify business ownership
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: candidate, error } = await supabase
    .from('email_candidates')
    .upsert(
      {
        business_id: id,
        email,
        source: 'manual',
        confidence: 'medium',
        is_selected: true,
        source_context: 'Manually added',
      },
      { onConflict: 'business_id,email' }
    )
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(candidate, { status: 201 })
}

/**
 * PATCH /api/businesses/[id]/email-candidates
 * Update a candidate (toggle selection, set as primary).
 * Body: { candidateId, is_selected?, set_primary? }
 */
export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { candidateId, is_selected, set_primary } = body

  if (!candidateId) {
    return NextResponse.json({ error: 'candidateId is required' }, { status: 400 })
  }

  // Verify business ownership
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Update selection status
  if (typeof is_selected === 'boolean') {
    const { error } = await supabase
      .from('email_candidates')
      .update({ is_selected })
      .eq('id', candidateId)
      .eq('business_id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Set as primary email on the business record
  if (set_primary) {
    const { data: candidate } = await supabase
      .from('email_candidates')
      .select('email')
      .eq('id', candidateId)
      .eq('business_id', id)
      .single()

    if (candidate) {
      await supabase
        .from('businesses')
        .update({ email: candidate.email })
        .eq('id', id)

      // Also mark this candidate as selected
      await supabase
        .from('email_candidates')
        .update({ is_selected: true })
        .eq('id', candidateId)
        .eq('business_id', id)
    }
  }

  return NextResponse.json({ success: true })
}

/**
 * DELETE /api/businesses/[id]/email-candidates
 * Remove a candidate. Body: { candidateId }
 */
export async function DELETE(request: Request, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const candidateId = searchParams.get('candidateId')

  if (!candidateId) {
    return NextResponse.json({ error: 'candidateId is required' }, { status: 400 })
  }

  // Verify business ownership
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('email_candidates')
    .delete()
    .eq('id', candidateId)
    .eq('business_id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
