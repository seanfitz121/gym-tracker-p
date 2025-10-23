import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// DELETE /api/announcement/:id - Delete announcement (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
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

    // Delete announcement
    const { error: deleteError } = await supabase
      .from('announcement')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting announcement:', deleteError)
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500, headers: corsHeaders }
      )
    }

    return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders })
  } catch (error) {
    console.error('Error in DELETE /api/announcement/:id:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}


