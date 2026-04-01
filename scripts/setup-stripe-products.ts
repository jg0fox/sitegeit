/**
 * One-time script to create Stripe products and prices for Sitegeit tiers.
 *
 * Usage: npx tsx scripts/setup-stripe-products.ts
 *
 * Outputs the price IDs to add to .env.local and Vercel.
 */

import Stripe from 'stripe'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

if (!STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY not set. Run with: STRIPE_SECRET_KEY=sk_live_... npx tsx scripts/setup-stripe-products.ts')
  process.exit(1)
}

const stripe = new Stripe(STRIPE_SECRET_KEY)

const TIERS = [
  { name: 'Starter', price: 2500, description: 'Everything you need to get online — conversion-optimized website, SEO, mobile responsive, contact form.' },
  { name: 'Growth', price: 5000, description: 'Capture leads and grow your pipeline — custom domain, analytics, scheduling, CTA tracking.' },
  { name: 'Pro', price: 7500, description: 'Automate your customer interactions — AI portal, lead inbox, weekly reports, content updates.' },
  { name: 'Premium', price: 10000, description: 'Full-service growth — managed GBP, competitor monitoring, strategy calls, social content.' },
]

async function main() {
  console.log('Creating Stripe products and prices...\n')

  const results: { tier: string; productId: string; priceId: string }[] = []

  for (const tier of TIERS) {
    // Check if product already exists
    const existing = await stripe.products.search({
      query: `name:"Simple Instant Sites - ${tier.name}"`,
    })

    let product: Stripe.Product
    if (existing.data.length > 0) {
      product = existing.data[0]
      console.log(`  Product "${tier.name}" already exists: ${product.id}`)
    } else {
      product = await stripe.products.create({
        name: `Simple Instant Sites - ${tier.name}`,
        description: tier.description,
        metadata: { tier: tier.name.toLowerCase() },
      })
      console.log(`  Created product "${tier.name}": ${product.id}`)
    }

    // Check if price already exists
    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true,
      type: 'recurring',
    })

    const matchingPrice = existingPrices.data.find(
      (p) => p.unit_amount === tier.price && p.recurring?.interval === 'month'
    )

    let price: Stripe.Price
    if (matchingPrice) {
      price = matchingPrice
      console.log(`  Price $${tier.price / 100}/mo already exists: ${price.id}`)
    } else {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: tier.price,
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { tier: tier.name.toLowerCase() },
      })
      console.log(`  Created price $${tier.price / 100}/mo: ${price.id}`)
    }

    results.push({ tier: tier.name.toLowerCase(), productId: product.id, priceId: price.id })
  }

  console.log('\n✓ All products and prices ready.\n')
  console.log('Add these to .env.local and Vercel:\n')
  for (const r of results) {
    console.log(`STRIPE_PRICE_${r.tier.toUpperCase()}=${r.priceId}`)
  }
  console.log('')
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
