// POST /api/prestige/enter - Enter prestige mode (reset XP, increment prestige)

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

type PrestigeResult = {
  success: boolean;
  error?: string;
  prestige_count?: number;
  badge_name?: string;
  next_eligible_at?: string;
};

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
    const { data, error: prestigeError } = await supabase.rpc(
      'enter_prestige',
      { p_user_id: user.id }
    );
    
    const prestigeResult = data as PrestigeResult | null;

    if (prestigeError) {
      console.error('[PRESTIGE] Error entering prestige:', prestigeError);
      return NextResponse.json(
        { error: 'Failed to enter prestige mode' },
        { status: 500 }
      );
    }

    // Check if result is null or prestige was unsuccessful
    if (!prestigeResult || !prestigeResult.success) {
      console.log('[PRESTIGE] Prestige denied:', prestigeResult?.error);
      return NextResponse.json(
        { 
          success: false,
          error: prestigeResult?.error || 'Not eligible for prestige'
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

