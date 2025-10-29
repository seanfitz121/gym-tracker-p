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

// GET all published blog posts (or all posts for admins)
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user is admin (only if authenticated)
    let isAdmin = false
    if (user) {
      const { data: adminUser } = await supabase
        .from('admin_user')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      
      isAdmin = !!adminUser
    }

    let query = supabase
      .from('blog_post')
      .select('*')
      .order('created_at', { ascending: false })

    // If not admin, only show published posts
    if (!isAdmin) {
      query = query.eq('published', true)
    }

    const { data: posts, error } = await query

    if (error) {
      console.error('Error fetching blog posts:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: corsHeaders }
      )
    }

    // Fetch author profiles separately
    const authorIds = [...new Set(posts?.map(p => p.author_id) || [])]
    const { data: profiles } = await supabase
      .from('profile')
      .select('id, display_name, avatar_url')
      .in('id', authorIds)

    // Map profiles to posts
    const postsWithAuthors = posts?.map(post => ({
      ...post,
      author: profiles?.find(p => p.id === post.author_id) || null
    }))

    return NextResponse.json(postsWithAuthors || [], { headers: corsHeaders })
  } catch (error) {
    console.error('Error in GET /api/blog:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// POST create a new blog post (admin only)
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
    const { title, subtitle, cover_image_url, body: postBody, published } = body

    if (!title || !postBody) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const { data: post, error } = await supabase
      .from('blog_post')
      .insert({
        author_id: user.id,
        title,
        subtitle: subtitle || null,
        cover_image_url: cover_image_url || null,
        body: postBody,
        published: published ?? false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating blog post:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: corsHeaders }
      )
    }

    return NextResponse.json(post, { headers: corsHeaders })
  } catch (error) {
    console.error('Error in POST /api/blog:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

