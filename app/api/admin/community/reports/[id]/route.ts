import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: reportId } = await params
    
    // Check auth and admin status
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: isAdmin } = await supabase
      .from('admin_user')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action, status } = body // action: 'hide' | 'delete' | 'dismiss'

    // Get the report
    const { data: report } = await supabase
      .from('community_report')
      .select('*')
      .eq('id', reportId)
      .single()

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Perform the action
    if (action === 'hide') {
      // Hide the content
      if (report.target_type === 'post') {
        await supabase
          .from('post')
          .update({ is_hidden: true })
          .eq('id', report.target_id)
      } else if (report.target_type === 'comment') {
        await supabase
          .from('comment')
          .update({ is_hidden: true })
          .eq('id', report.target_id)
      }

      // Update report status
      await supabase
        .from('community_report')
        .update({
          status: 'actioned',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId)

    } else if (action === 'delete') {
      // Delete the content
      if (report.target_type === 'post') {
        await supabase
          .from('post')
          .delete()
          .eq('id', report.target_id)
      } else if (report.target_type === 'comment') {
        await supabase
          .from('comment')
          .delete()
          .eq('id', report.target_id)
      }

      // Update report status
      await supabase
        .from('community_report')
        .update({
          status: 'actioned',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId)

    } else if (action === 'dismiss') {
      // Just dismiss the report
      await supabase
        .from('community_report')
        .update({
          status: 'dismissed',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId)
    } else if (status) {
      // Manual status update
      await supabase
        .from('community_report')
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling report action:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}

