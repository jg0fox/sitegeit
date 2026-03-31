import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { manualBusinessSchema } from '@/lib/utils/schemas'
import { publishToWorker } from '@/lib/qstash/client'

/** POST /api/businesses — manually add a business to the pipeline */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user profile exists in public.users (FK target for businesses)
    await supabase.from('users').upsert(
      { id: user.id, email: user.email ?? '' },
      { onConflict: 'id', ignoreDuplicates: true }
    )

    const body = await request.json()
    const parsed = manualBusinessSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const categorySlug = data.category.toLowerCase().replace(/\s+/g, '_')

    // Deduplication: check by name + city for same user
    if (data.name && data.address_city) {
      const { data: existing } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .ilike('name', data.name)
        .ilike('address_city', data.address_city)
        .maybeSingle()

      if (existing) {
        return NextResponse.json(
          { error: 'A business with this name and city already exists in your pipeline' },
          { status: 409 }
        )
      }
    }

    // Insert business record
    const { data: inserted, error: insertError } = await supabase
      .from('businesses')
      .insert({
        user_id: user.id,
        name: data.name,
        category: data.category,
        category_slug: categorySlug,
        phone: data.phone || null,
        email: data.email || null,
        address_street: data.address_street || null,
        address_city: data.address_city || null,
        address_state: data.address_state || null,
        address_zip: data.address_zip || null,
        owner_name: data.owner_name || null,
        website_url: data.website_url || null,
        website_status: 'none',
        google_place_id: null,
        source: 'manual',
        status: 'discovered',
      })
      .select('id')
      .single()

    if (insertError || !inserted) {
      console.error('Failed to insert manual business:', insertError)
      return NextResponse.json(
        { error: insertError?.message || 'Failed to create business' },
        { status: 500 }
      )
    }

    // Store email as candidate if provided
    if (data.email) {
      await supabase
        .from('email_candidates')
        .upsert(
          {
            business_id: inserted.id,
            email: data.email.toLowerCase().trim(),
            source: 'manual',
            confidence: 'high',
            source_context: 'Manually entered during business creation',
            is_selected: true,
          },
          { onConflict: 'business_id,email', ignoreDuplicates: true }
        )
        .then(({ error }) => {
          if (error) console.error(`Failed to insert email candidate for ${inserted.id}:`, error)
        })
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      business_id: inserted.id,
      event_type: 'lead_discovered',
      event_data: { business_name: data.name, category: data.category, source: 'manual' },
    })

    // Auto-queue enrichment
    await publishToWorker('enrich', { businessId: inserted.id }).catch((err) => {
      console.error(`Failed to queue enrichment for ${inserted.id}:`, err)
    })

    return NextResponse.json({ id: inserted.id, name: data.name })
  } catch (err) {
    console.error('Manual business add error:', err)
    const message = err instanceof Error ? err.message : 'Failed to add business'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
