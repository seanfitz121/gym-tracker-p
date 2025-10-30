import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// DELETE /api/one-rm/lifts/[id] - Delete a 1RM lift
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { error } = await supabase
      .from('one_rm_lift')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting 1RM lift:', error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/one-rm/lifts/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete 1RM lift' },
      { status: 500 }
    )
  }
}

