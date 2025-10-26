import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET /api/body-metrics - Get user's latest body metrics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: metrics, error } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error fetching body metrics:', error)
      return NextResponse.json({ error: 'Failed to fetch body metrics' }, { status: 500 })
    }

    return NextResponse.json(metrics || null, { headers: corsHeaders })
  } catch (error) {
    console.error('Unexpected error in GET /api/body-metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/body-metrics - Create or update body metrics
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { height_cm, waist_cm, neck_cm, hip_cm, gender, logged_at } = body

    const metricsData: any = {
      user_id: user.id,
      logged_at: logged_at || new Date().toISOString().split('T')[0],
    }

    if (height_cm !== undefined) metricsData.height_cm = height_cm
    if (waist_cm !== undefined) metricsData.waist_cm = waist_cm
    if (neck_cm !== undefined) metricsData.neck_cm = neck_cm
    if (hip_cm !== undefined) metricsData.hip_cm = hip_cm
    if (gender !== undefined) metricsData.gender = gender

    // Upsert (create or update for the date)
    const { data: metrics, error } = await supabase
      .from('body_metrics')
      .upsert(metricsData)
      .select()
      .single()

    if (error) {
      console.error('Error upserting body metrics:', error)
      return NextResponse.json({ error: 'Failed to save body metrics' }, { status: 500 })
    }

    return NextResponse.json(metrics, { headers: corsHeaders })
  } catch (error) {
    console.error('Unexpected error in POST /api/body-metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


