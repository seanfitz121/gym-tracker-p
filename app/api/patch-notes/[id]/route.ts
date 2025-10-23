import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET single patch note
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      )
    }

    const { data: note, error } = await supabase
      .from('patch_notes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 404, headers: corsHeaders }
      )
    }

    // Fetch author profile
    const { data: profile } = await supabase
      .from('profile')
      .select('id, display_name, avatar_url')
      .eq('id', note.author_id)
      .single()

    return NextResponse.json(
      { ...note, author: profile },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Error in GET /api/patch-notes/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// PUT update patch note (admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const updates: any = {}
    if (version !== undefined) updates.version = version
    if (title !== undefined) updates.title = title
    if (content !== undefined) updates.content = content
    if (published !== undefined) updates.published = published

    const { data: note, error } = await supabase
      .from('patch_notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating patch note:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: corsHeaders }
      )
    }

    return NextResponse.json(note, { headers: corsHeaders })
  } catch (error) {
    console.error('Error in PUT /api/patch-notes/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// DELETE patch note (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const { error } = await supabase
      .from('patch_notes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting patch note:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { success: true },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Error in DELETE /api/patch-notes/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

