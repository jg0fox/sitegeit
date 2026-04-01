import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const TIER_FROM_AMOUNT: Record<number, string> = {
  2500: 'starter',
  5000: 'growth',
  7500: 'pro',
  10000: 'premium',
}

/**
 * POST /api/stripe/webhook
 * Handles Stripe subscription lifecycle events.
 */
export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  // Verify webhook signature
  let event: Stripe.Event
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err) {
      console.error('[stripe/webhook] Signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } else {
    // In development or if no webhook secret, parse the event directly
    event = JSON.parse(body) as Stripe.Event
  }

  const supabase = getAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const businessId = session.metadata?.businessId
        const tier = session.metadata?.tier
        const monthlyRate = parseInt(session.metadata?.monthlyRate || '0', 10)

        if (!businessId) {
          console.warn('[stripe/webhook] checkout.session.completed missing businessId metadata')
          break
        }

        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : (session.subscription as Stripe.Subscription)?.id

        // Update business: convert to active client
        await supabase
          .from('businesses')
          .update({
            status: 'active',
            tier: tier || 'starter',
            monthly_rate: monthlyRate || 25,
            converted_at: new Date().toISOString(),
            stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
            stripe_subscription_id: subscriptionId || null,
          })
          .eq('id', businessId)

        // Log activities
        await supabase.from('activity_log').insert([
          {
            business_id: businessId,
            event_type: 'status_changed',
            event_data: { from: 'prospect', to: 'active', source: 'stripe_checkout' },
          },
          {
            business_id: businessId,
            event_type: 'tier_changed',
            event_data: { tier, monthly_rate: monthlyRate, source: 'stripe_checkout' },
          },
        ])

        // Fetch user_id for notification
        const { data: biz } = await supabase
          .from('businesses')
          .select('user_id, name')
          .eq('id', businessId)
          .single()

        if (biz) {
          await supabase.from('notifications').insert({
            user_id: biz.user_id,
            type: 'pipeline',
            title: 'New paying client!',
            body: `${biz.name} subscribed to the ${tier?.charAt(0).toUpperCase()}${tier?.slice(1)} plan ($${monthlyRate}/mo).`,
            business_id: businessId,
            href: `/businesses/${businessId}`,
          })
        }

        console.log(`[stripe/webhook] checkout.session.completed: ${businessId} → ${tier} ($${monthlyRate}/mo)`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const businessId = subscription.metadata?.businessId

        if (!businessId) break

        // Determine new tier from subscription amount
        const amount = subscription.items.data[0]?.price?.unit_amount || 0
        const newTier = TIER_FROM_AMOUNT[amount]
        const newRate = amount / 100

        if (newTier) {
          await supabase
            .from('businesses')
            .update({
              tier: newTier,
              monthly_rate: newRate,
              stripe_subscription_id: subscription.id,
            })
            .eq('id', businessId)

          await supabase.from('activity_log').insert({
            business_id: businessId,
            event_type: 'tier_changed',
            event_data: { tier: newTier, monthly_rate: newRate, source: 'stripe_subscription_updated' },
          })
        }

        console.log(`[stripe/webhook] subscription.updated: ${businessId} → ${newTier} ($${newRate}/mo)`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const businessId = subscription.metadata?.businessId

        if (!businessId) break

        await supabase
          .from('businesses')
          .update({
            status: 'churned',
            stripe_subscription_id: null,
          })
          .eq('id', businessId)

        await supabase.from('activity_log').insert({
          business_id: businessId,
          event_type: 'status_changed',
          event_data: { from: 'active', to: 'churned', source: 'stripe_subscription_deleted' },
        })

        const { data: biz } = await supabase
          .from('businesses')
          .select('user_id, name')
          .eq('id', businessId)
          .single()

        if (biz) {
          await supabase.from('notifications').insert({
            user_id: biz.user_id,
            type: 'pipeline',
            title: 'Subscription cancelled',
            body: `${biz.name} cancelled their subscription.`,
            business_id: businessId,
            href: `/businesses/${businessId}`,
          })
        }

        console.log(`[stripe/webhook] subscription.deleted: ${businessId} → churned`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : null

        if (!customerId) break

        // Find business by stripe_customer_id
        const { data: biz } = await supabase
          .from('businesses')
          .select('id, user_id, name')
          .eq('stripe_customer_id', customerId)
          .single()

        if (biz) {
          await supabase.from('notifications').insert({
            user_id: biz.user_id,
            type: 'system',
            title: 'Payment failed',
            body: `Payment failed for ${biz.name}. Stripe will retry automatically.`,
            business_id: biz.id,
            href: `/businesses/${biz.id}`,
          })
        }

        console.log(`[stripe/webhook] invoice.payment_failed: customer ${customerId}`)
        break
      }

      default:
        console.log(`[stripe/webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[stripe/webhook] Error processing event:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
