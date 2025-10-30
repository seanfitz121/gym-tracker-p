import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { CreateReactionInput } from '@/lib/types/community'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateReactionInput = await request.json()

    // Validate
    if (!body.target_type || !body.target_id) {
      return NextResponse.json(
        { error: 'Invalid reaction data' },
        { status: 400 }
      )
    }

    // Check if reaction already exists
    const { data: existing } = await supabase
      .from('reaction')
      .select('id')
      .eq('target_type', body.target_type)
      .eq('target_id', body.target_id)
      .eq('user_id', user.id)
      .eq('kind', body.kind || 'like')
      .maybeSingle()

    if (existing) {
      // Unlike: delete the reaction
      const { error: deleteError } = await supabase
        .from('reaction')
        .delete()
        .eq('id', existing.id)

      if (deleteError) throw deleteError

      return NextResponse.json({ 
        action: 'unliked',
        success: true 
      })
    } else {
      // Like: create the reaction
      const { data: reaction, error: insertError } = await supabase
        .from('reaction')
        .insert({
          target_type: body.target_type,
          target_id: body.target_id,
          user_id: user.id,
          kind: body.kind || 'like',
        })
        .select()
        .single()

      if (insertError) throw insertError

      return NextResponse.json({ 
        action: 'liked',
        reaction,
        success: true 
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Error toggling reaction:', error)
    return NextResponse.json(
      { error: 'Failed to toggle reaction' },
      { status: 500 }
    )
  }
}

