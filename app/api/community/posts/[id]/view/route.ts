import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: postId } = await params
    
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id

    // Get IP address for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown'

    // Check if this user/IP viewed this post recently (within 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    
    let existingView
    if (userId) {
      const { data } = await supabase
        .from('post_view')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .gte('viewed_at', tenMinutesAgo)
        .maybeSingle()
      
      existingView = data
    } else {
      // For anonymous users, check by IP
      const { data } = await supabase
        .from('post_view')
        .select('id')
        .eq('post_id', postId)
        .eq('ip_address', ip)
        .gte('viewed_at', tenMinutesAgo)
        .maybeSingle()
      
      existingView = data
    }

    // If recently viewed, don't count again
    if (existingView) {
      return NextResponse.json({ 
        success: true,
        counted: false,
        message: 'View already counted recently'
      })
    }

    // Record the view
    const { error } = await supabase
      .from('post_view')
      .insert({
        post_id: postId,
        user_id: userId || null,
        ip_address: userId ? null : ip, // Only store IP for anonymous users
      })

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      counted: true 
    })
  } catch (error) {
    console.error('Error recording view:', error)
    return NextResponse.json(
      { error: 'Failed to record view' },
      { status: 500 }
    )
  }
}

