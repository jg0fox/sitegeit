import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addToPipelineSchema } from '@/lib/utils/schemas'
import { publishToWorker } from '@/lib/qstash/client'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user profile exists in public.users (FK target for businesses)
    await supabase.from('users').upsert(
      { id: user.id, email: user.email ?? '' },
      { onConflict: 'id', ignoreDuplicates: true }
    )

    const body = await request.json()
    const parsed = addToPipelineSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { results, category, skipEmailSearch } = parsed.data
    let added = 0
    let skipped = 0

    for (const result of results) {
      // Check for duplicate by google_place_id
      const { data: existing } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .eq('google_place_id', result.place_id)
        .maybeSingle()

      if (existing) {
        skipped++
        continue
      }

      // Parse address components from formatted_address
      const addressParts = result.formatted_address.split(',').map((p: string) => p.trim())

      // Insert business record
      const { data: inserted, error: insertError } = await supabase.from('businesses').insert({
        user_id: user.id,
        name: result.name,
        category,
        category_slug: category.toLowerCase().replace(/\s+/g, '_'),
        phone: result.formatted_phone_number || null,
        address_street: addressParts[0] || null,
        address_city: addressParts[1] || null,
        address_state: addressParts[2]?.split(' ')[0] || null,
        address_zip: addressParts[2]?.split(' ')[1] || null,
        address_lat: result.geometry.lat,
        address_lng: result.geometry.lng,
        google_place_id: result.place_id,
        google_rating: result.rating || null,
        google_review_count: result.user_ratings_total || null,
        website_url: result.website || null,
        website_status: result.website_status,
        email: result.email || null,
        skip_email_search: skipEmailSearch || false,
        status: 'discovered',
      }).select('id').single()

      if (insertError || !inserted) {
        console.error(`Failed to insert business ${result.name}:`, insertError)
        continue
      }

      // Store ALL discovered emails as candidates (fix data loss — previously only saved emails[0])
      const allEmails = result.emails || (result.email ? [result.email] : [])
      if (allEmails.length > 0) {
        const candidateRows = allEmails.map((email: string) => ({
          business_id: inserted.id,
          email: email.toLowerCase().trim(),
          source: 'website_scrape',
          confidence: 'high',
          source_url: result.website || null,
          source_context: 'Found during discovery search',
          is_selected: email === (result.email || allEmails[0]),
        }))

        await supabase
          .from('email_candidates')
          .upsert(candidateRows, { onConflict: 'business_id,email', ignoreDuplicates: true })
          .then(({ error }) => {
            if (error) console.error(`Failed to insert email candidates for ${inserted.id}:`, error)
          })
      }

      // Log the activity
      await supabase.from('activity_log').insert({
        user_id: user.id,
        business_id: inserted.id,
        event_type: 'lead_discovered',
        event_data: { business_name: result.name, category },
      })

      // Auto-queue enrichment via QStash
      await publishToWorker('enrich', { businessId: inserted.id }).catch(err => {
        console.error(`Failed to queue enrichment for ${inserted.id}:`, err)
      })

      added++
    }

    return NextResponse.json({ added, skipped })
  } catch (err) {
    console.error('Add to pipeline error:', err)
    const message = err instanceof Error ? err.message : 'Failed to add to pipeline'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
