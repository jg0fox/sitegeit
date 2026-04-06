import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const RATE_MAP: Record<string, number> = {
  starter: 25,
  growth: 50,
  pro: 75,
  premium: 100,
}

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout Session for a subscription.
 * Public endpoint — the business owner (prospect) is the one paying.
 */
export async function POST(request: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
    }

    const stripe = new Stripe(stripeKey, {
      timeout: 30000,
    })

    const PRICE_MAP: Record<string, string | undefined> = {
      starter: process.env.STRIPE_PRICE_STARTER,
      growth: process.env.STRIPE_PRICE_GROWTH,
      pro: process.env.STRIPE_PRICE_PRO,
      premium: process.env.STRIPE_PRICE_PREMIUM,
    }

    const { businessId: inputBusinessId, tier, slug } = await request.json()

    if (!tier || !slug) {
      return NextResponse.json({ error: 'Missing tier or slug' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // Resolve businessId from landing page slug if not provided directly
    let businessId = inputBusinessId as string | null
    if (!businessId) {
      const { data: landingPage } = await supabase
        .from('landing_pages')
        .select('business_id')
        .eq('deploy_url', slug)
        .limit(1)
        .single()

      businessId = landingPage?.business_id || null
    }

    if (!businessId) {
      return NextResponse.json({ error: 'Could not resolve business for this page' }, { status: 404 })
    }

    const priceId = PRICE_MAP[tier.toLowerCase()]
    if (!priceId) {
      return NextResponse.json({ error: `Invalid tier: ${tier}` }, { status: 400 })
    }

    // Fetch business for customer creation
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, email, stripe_customer_id')
      .eq('id', businessId)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Reuse or create Stripe Customer
    let customerId = business.stripe_customer_id as string | null
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: business.name,
        email: business.email || undefined,
        metadata: { businessId: business.id },
      })
      customerId = customer.id

      // Store immediately so we don't create duplicates on retry
      await supabase
        .from('businesses')
        .update({ stripe_customer_id: customerId })
        .eq('id', businessId)
    }

    const siteDomain = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'goget.im'
    const baseUrl = `https://go.${siteDomain}`

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/${slug}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${slug}/checkout?tier=${tier}`,
      metadata: {
        businessId,
        tier: tier.toLowerCase(),
        monthlyRate: String(RATE_MAP[tier.toLowerCase()] || 0),
      },
      subscription_data: {
        metadata: {
          businessId,
          tier: tier.toLowerCase(),
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    console.error('[stripe/checkout] Error:', err)

    // Surface Stripe-specific error details
    const stripeErr = err as { type?: string; code?: string; statusCode?: number; message?: string }
    const message = stripeErr.message || 'Failed to create checkout session'
    const details = {
      error: message,
      ...(stripeErr.type ? { type: stripeErr.type } : {}),
      ...(stripeErr.code ? { code: stripeErr.code } : {}),
    }

    return NextResponse.json(details, { status: stripeErr.statusCode || 500 })
  }
}
