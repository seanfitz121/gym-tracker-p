// GET /api/supplements/stats - Get supplement adherence statistics

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
    const supplementId = searchParams.get('supplement_id');
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Get supplements (either specific or all)
    let supplementsQuery = supabase
      .from('supplement_definition')
      .select('*')
      .eq('user_id', user.id);

    if (supplementId) {
      supplementsQuery = supplementsQuery.eq('id', supplementId);
    }

    const { data: supplements, error: supplementsError } = await supplementsQuery;

    if (supplementsError) {
      console.error('Error fetching supplements:', supplementsError);
      return NextResponse.json(
        { error: 'Failed to fetch supplements' },
        { status: 500 }
      );
    }

    // Get logs for date range
    let logsQuery = supabase
      .from('supplement_log')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDateStr)
      .lte('date', endDateStr);

    if (supplementId) {
      logsQuery = logsQuery.eq('supplement_id', supplementId);
    }

    const { data: logs, error: logsError } = await logsQuery;

    if (logsError) {
      console.error('Error fetching logs:', logsError);
      return NextResponse.json(
        { error: 'Failed to fetch logs' },
        { status: 500 }
      );
    }

    // Calculate stats for each supplement
    const stats = (supplements || []).map((supplement) => {
      const supplementLogs = (logs || []).filter(
        (log) => log.supplement_id === supplement.id
      );

      // Group logs by date
      const logsByDate = supplementLogs.reduce((acc, log) => {
        const date = log.date; // Use the date column directly
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(log);
        return acc;
      }, {} as Record<string, typeof supplementLogs>);

      // Calculate daily totals
      const dailyTotals: Record<string, number> = {};
      Object.keys(logsByDate).forEach((date) => {
        dailyTotals[date] = logsByDate[date].reduce(
          (sum, log) => sum + Number(log.amount),
          0
        );
      });

      // Days logged
      const daysLogged = Object.keys(dailyTotals).length;

      // Days met goal
      const dailyGoal = supplement.daily_goal || 0;
      const daysMetGoal = Object.values(dailyTotals).filter(
        (total) => total >= dailyGoal
      ).length;

      // Adherence percentage
      const adherencePercentage = daysLogged > 0 ? (daysMetGoal / days) * 100 : 0;

      // Average daily intake
      const totalIntake = Object.values(dailyTotals).reduce((sum, val) => sum + val, 0);
      const averageDailyIntake = daysLogged > 0 ? totalIntake / daysLogged : 0;

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      for (let i = 0; i < days; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        if (dailyTotals[dateStr] >= dailyGoal) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
      const allDates = Object.keys(dailyTotals).sort();
      allDates.forEach((date) => {
        if (dailyTotals[date] >= dailyGoal) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      });

      return {
        supplement_id: supplement.id,
        name: supplement.name,
        type: supplement.type,
        unit: supplement.unit || 'g',
        daily_goal: dailyGoal,
        days_logged: daysLogged,
        days_met_goal: daysMetGoal,
        adherence_percentage: Math.round(adherencePercentage),
        average_daily_intake: Math.round(averageDailyIntake * 100) / 100,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        total_logs: supplementLogs.length,
      };
    });

    return NextResponse.json({ stats, days, start_date: startDateStr, end_date: endDateStr });
  } catch (error) {
    console.error('Error in supplement stats GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

