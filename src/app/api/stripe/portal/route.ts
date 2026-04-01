import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

/**
 * POST /api/stripe/portal
 * Creates a Stripe Customer Portal session for managing billing.
 * Requires auth — only the operator can access this.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { businessId } = await request.json()
    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 })
    }

    // Verify ownership
    const { data: business } = await supabase
      .from('businesses')
      .select('user_id, stripe_customer_id')
      .eq('id', businessId)
      .single()

    if (!business || business.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!business.stripe_customer_id) {
      return NextResponse.json({ error: 'No Stripe customer for this business' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://goget.im'

    const session = await stripe.billingPortal.sessions.create({
      customer: business.stripe_customer_id,
      return_url: `${appUrl}/businesses/${businessId}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe/portal] Error:', err)
    const message = err instanceof Error ? err.message : 'Failed to create portal session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
