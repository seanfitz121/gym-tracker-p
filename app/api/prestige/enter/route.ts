// POST /api/prestige/enter - Enter prestige mode (reset XP, increment prestige)

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[PRESTIGE] User attempting to prestige:', user.id);

    // Call the enter_prestige function
    const { data: prestigeResult, error: prestigeError } = await supabase.rpc(
      'enter_prestige',
      { p_user_id: user.id }
    );

    if (prestigeError) {
      console.error('[PRESTIGE] Error entering prestige:', prestigeError);
      return NextResponse.json(
        { error: 'Failed to enter prestige mode' },
        { status: 500 }
      );
    }

    // Check if prestige was successful
    if (!prestigeResult.success) {
      console.log('[PRESTIGE] Prestige denied:', prestigeResult.error);
      return NextResponse.json(
        { 
          success: false,
          error: prestigeResult.error || 'Not eligible for prestige'
        },
        { status: 403 }
      );
    }

    console.log('[PRESTIGE] Prestige successful:', {
      user_id: user.id,
      prestige_count: prestigeResult.prestige_count,
      badge: prestigeResult.badge_name,
    });

    return NextResponse.json({
      success: true,
      prestige_count: prestigeResult.prestige_count,
      badge_name: prestigeResult.badge_name,
      next_eligible_at: prestigeResult.next_eligible_at,
    });
  } catch (error) {
    console.error('[PRESTIGE] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

