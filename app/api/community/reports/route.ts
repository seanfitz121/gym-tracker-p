import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { CreateReportInput } from '@/lib/types/community'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateReportInput = await request.json()

    // Validate
    if (!body.target_type || !body.target_id || !body.reason) {
      return NextResponse.json(
        { error: 'Invalid report data' },
        { status: 400 }
      )
    }

    // Check if user already reported this item
    const { data: existing } = await supabase
      .from('community_report')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('target_type', body.target_type)
      .eq('target_id', body.target_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'You have already reported this content' },
        { status: 400 }
      )
    }

    // Create report
    const { data: report, error } = await supabase
      .from('community_report')
      .insert({
        reporter_id: user.id,
        target_type: body.target_type,
        target_id: body.target_id,
        reason: body.reason,
        details: body.details || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      report,
      success: true,
      message: 'Report submitted successfully. Our team will review it soon.'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    )
  }
}

