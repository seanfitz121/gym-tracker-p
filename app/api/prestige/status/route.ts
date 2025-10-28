// GET /api/prestige/status - Check prestige eligibility and status

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

type EligibilityData = {
  eligible: boolean;
  prestige_count?: number;
  last_prestige_at?: string;
  next_eligible_at?: string;
  reason?: string;
  current_xp?: number;
  required_xp?: number;
  days_remaining?: number;
};

export async function GET() {
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

    // Call the can_enter_prestige function
    const { data, error: eligibilityError } = await supabase.rpc(
      'can_enter_prestige',
      { p_user_id: user.id }
    );
    
    const eligibilityData = data as EligibilityData | null;

    if (eligibilityError || !eligibilityData) {
      console.error('Error checking prestige eligibility:', eligibilityError);
      return NextResponse.json(
        { error: 'Failed to check prestige eligibility' },
        { status: 500 }
      );
    }

    // Return formatted response
    return NextResponse.json({
      isEligible: eligibilityData.eligible,
      prestige_count: eligibilityData.prestige_count || 0,
      last_prestige_at: eligibilityData.last_prestige_at || null,
      next_eligible_at: eligibilityData.next_eligible_at || null,
      reason: eligibilityData.reason,
      current_xp: eligibilityData.current_xp,
      required_xp: eligibilityData.required_xp,
      days_remaining: eligibilityData.days_remaining,
    });
  } catch (error) {
    console.error('Error in prestige status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

