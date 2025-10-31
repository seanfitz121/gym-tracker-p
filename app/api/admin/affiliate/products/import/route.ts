import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { parse } from 'csv-parse/sync'

// POST bulk import products from CSV - admin only
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_user')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'CSV file is required' },
        { status: 400 }
      )
    }

    // Read and parse CSV
    const text = await file.text()
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty or invalid' },
        { status: 400 }
      )
    }

    const results = {
      success: 0,
      errors: 0,
      errors_detail: [] as Array<{ row: number; error: string }>
    }

    // Process each row
    for (let i = 0; i < records.length; i++) {
      const row = records[i] as Record<string, string>
      const rowNum = i + 2 // +2 because CSV has header and is 1-indexed

      try {
        // Validate required fields
        if (!row.title || !row.origin || !row.affiliate_url) {
          results.errors++
          results.errors_detail.push({
            row: rowNum,
            error: 'Missing required field: title, origin, or affiliate_url'
          })
          continue
        }

        // Validate URL
        try {
          new URL(row.affiliate_url)
        } catch {
          results.errors++
          results.errors_detail.push({
            row: rowNum,
            error: 'Invalid affiliate_url format'
          })
          continue
        }

        // Parse tags (comma-separated string or JSON array)
        let tags: string[] = []
        if (row.tags) {
          try {
            tags = JSON.parse(row.tags)
          } catch {
            tags = row.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          }
        }

        // Insert product
        const { error: insertError } = await supabase
          .from('affiliate_product' as any)
          .insert({
            title: row.title.trim(),
            subtitle: row.subtitle?.trim() || null,
            image_url: row.image_url?.trim() || null,
            price_hint: row.price_hint?.trim() || null,
            origin: row.origin.trim(),
            partner_id: row.partner_id?.trim() || null,
            affiliate_url: row.affiliate_url.trim(),
            tags: tags,
            active: row.active !== undefined ? row.active === 'true' : true,
            rating: row.rating ? parseFloat(row.rating) : null,
            description: row.description?.trim() || null,
            shipping_note: row.shipping_note?.trim() || null
          })

        if (insertError) {
          results.errors++
          results.errors_detail.push({
            row: rowNum,
            error: insertError.message
          })
        } else {
          results.success++
        }
      } catch (error: any) {
        results.errors++
        results.errors_detail.push({
          row: rowNum,
          error: error.message || 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: `Import completed: ${results.success} succeeded, ${results.errors} failed`,
      results
    })
  } catch (error: any) {
    console.error('Error in POST /api/admin/affiliate/products/import:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

