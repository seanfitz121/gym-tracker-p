import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET all published patch notes (or all for admins)
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      )
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_user')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let query = supabase
      .from('patch_notes')
      .select('*')
      .order('created_at', { ascending: false })

    // If not admin, only show published notes
    if (!adminUser) {
      query = query.eq('published', true)
    }

    const { data: notes, error } = await query

    if (error) {
      console.error('Error fetching patch notes:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: corsHeaders }
      )
    }

    // Fetch author profiles separately
    const authorIds = [...new Set(notes?.map(n => n.author_id) || [])]
    const { data: profiles } = await supabase
      .from('profile')
      .select('id, display_name, avatar_url')
      .in('id', authorIds)

    // Map profiles to notes
    const notesWithAuthors = notes?.map(note => ({
      ...note,
      author: profiles?.find(p => p.id === note.author_id) || null
    }))

    return NextResponse.json(notesWithAuthors || [], { headers: corsHeaders })
  } catch (error) {
    console.error('Error in GET /api/patch-notes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// POST create a new patch note (admin only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      )
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_user')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403, headers: corsHeaders }
      )
    }

    const body = await request.json()
    const { version, title, content, published } = body

    if (!version || !title || !content) {
      return NextResponse.json(
        { error: 'Version, title, and content are required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const { data: note, error } = await supabase
      .from('patch_notes')
      .insert({
        author_id: user.id,
        version,
        title,
        content,
        published: published ?? false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating patch note:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: corsHeaders }
      )
    }

    return NextResponse.json(note, { headers: corsHeaders })
  } catch (error) {
    console.error('Error in POST /api/patch-notes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

