import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// DELETE /api/hydration/[id] - Delete a hydration log entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('hydration_log')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting hydration log:', error)
      return NextResponse.json({ error: 'Failed to delete hydration log' }, { status: 500 })
    }

    return NextResponse.json(
      { message: 'Hydration log deleted successfully' },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Unexpected error in DELETE /api/hydration/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


