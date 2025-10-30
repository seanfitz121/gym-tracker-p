// GET /api/supplements/progress - Get daily progress for all supplements

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Get all supplements for user
    const { data: supplements, error: supplementsError } = await supabase
      .from('supplement_definition')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (supplementsError) {
      console.error('Error fetching supplements:', supplementsError);
      return NextResponse.json(
        { error: 'Failed to fetch supplements' },
        { status: 500 }
      );
    }

    // Get logs for the specified date
    const { data: logs, error: logsError } = await supabase
      .from('supplement_log')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date);

    if (logsError) {
      console.error('Error fetching logs:', logsError);
      return NextResponse.json(
        { error: 'Failed to fetch logs' },
        { status: 500 }
      );
    }

    // Calculate progress for each supplement
    const progress = (supplements || []).map((supplement) => {
      const supplementLogs = (logs || []).filter(
        (log) => log.supplement_id === supplement.id
      );
      const totalTaken = supplementLogs.reduce((sum, log) => sum + Number(log.amount), 0);
      const dailyGoal = supplement.daily_goal_amount || 0;
      const progressPercentage =
        dailyGoal > 0 ? (totalTaken / dailyGoal) * 100 : 0;

      return {
        supplement_id: supplement.id,
        name: supplement.name,
        type: supplement.supplement_type,
        unit: supplement.daily_goal_unit || 'g',
        daily_goal: dailyGoal,
        is_quantitative: true,
        color: null,
        icon: null,
        date,
        total_taken: totalTaken,
        progress_percentage: Math.min(progressPercentage, 100),
        log_count: supplementLogs.length,
        is_complete: progressPercentage >= 100,
      };
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error in supplement progress GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

