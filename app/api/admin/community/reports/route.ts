import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'open'

    // Get reports with related data
    const { data: reports, error } = await supabase
      .from('community_report')
      .select(`
        *,
        reporter:profile!community_report_reporter_id_fkey(
          id,
          username,
          avatar_url
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Enrich reports with target content
    const enrichedReports = await Promise.all(
      (reports || []).map(async (report) => {
        let target = null
        let targetAuthor = null

        if (report.target_type === 'post') {
          const { data: post } = await supabase
            .from('post')
            .select(`
              *,
              author:profile!post_user_id_fkey(
                id,
                username,
                avatar_url
              )
            `)
            .eq('id', report.target_id)
            .maybeSingle()

          target = post
          targetAuthor = post?.author
        } else if (report.target_type === 'comment') {
          const { data: comment } = await supabase
            .from('comment')
            .select(`
              *,
              author:profile!comment_user_id_fkey(
                id,
                username,
                avatar_url
              )
            `)
            .eq('id', report.target_id)
            .maybeSingle()

          target = comment
          targetAuthor = comment?.author
        }

        return {
          report,
          target,
          reporter: report.reporter,
          target_author: targetAuthor
        }
      })
    )

    return NextResponse.json({ reports: enrichedReports })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

