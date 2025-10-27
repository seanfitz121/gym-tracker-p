import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Debug endpoint to check what usernames exist and test search
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const testQuery = searchParams.get('test')

    // Get all profiles with their usernames
    const { data: profiles, error } = await supabase
      .from('profile')
      .select('id, username, display_name')
      .limit(100)

    if (error) throw error

    let searchTest = null
    if (testQuery) {
      // Test the exact search query
      const { data: searchResults, error: searchError } = await supabase
        .from('profile')
        .select('id, username, display_name, avatar_url')
        .ilike('username', `%${testQuery.trim()}%`)
        .neq('id', user.id)
        .limit(10)

      searchTest = {
        query: testQuery,
        results: searchResults,
        error: searchError?.message,
        currentUserId: user.id
      }
    }

    return NextResponse.json({ 
      currentUser: {
        id: user.id,
        email: user.email
      },
      allProfiles: profiles,
      searchTest
    })
  } catch (error) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

