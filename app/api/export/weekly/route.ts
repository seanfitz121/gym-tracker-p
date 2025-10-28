// GET /api/export/weekly - Export weekly summary data (Premium only)
// Query params: week_start (ISO date), week_end (ISO date)

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { ExportWeeklySummary } from '@/lib/types/export';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get('week_start');
    const weekEnd = searchParams.get('week_end');

    if (!weekStart || !weekEnd) {
      return NextResponse.json(
        { error: 'Missing required parameters: week_start, week_end' },
        { status: 400 }
      );
    }

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check premium status
    const { data: profile } = await supabase
      .from('profile')
      .select('is_premium')
      .eq('id', user.id)
      .single();

    if (!profile?.is_premium) {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      );
    }

    // Fetch workouts for the week
    const { data: workouts, error: workoutsError } = await supabase
      .from('workout_session')
      .select('*')
      .eq('user_id', user.id)
      .gte('started_at', weekStart)
      .lte('started_at', weekEnd)
      .order('started_at', { ascending: true });

    if (workoutsError) {
      console.error('Error fetching workouts:', workoutsError);
      return NextResponse.json(
        { error: 'Failed to fetch workout data' },
        { status: 500 }
      );
    }

    // Fetch all sets for these workouts
    const workoutIds = workouts?.map((w) => w.id) || [];
    const { data: allSets } = await supabase
      .from('set_entry')
      .select(`
        *,
        exercise:exercise_id (
          name
        )
      `)
      .in('session_id', workoutIds);

    // Calculate stats for each workout
    const exportWorkouts = workouts?.map((workout) => {
      const workoutSets = allSets?.filter((s) => s.session_id === workout.id) || [];
      const totalSets = workoutSets.length;
      const totalVolumeKg = workoutSets.reduce((sum, set) => {
        const weight = set.weight_unit === 'lb' ? set.weight * 0.453592 : set.weight;
        return sum + weight * set.reps;
      }, 0);

      let durationMinutes: number | undefined;
      if (workout.started_at && workout.ended_at) {
        const start = new Date(workout.started_at).getTime();
        const end = new Date(workout.ended_at).getTime();
        durationMinutes = Math.round((end - start) / 60000);
      }

      // Group sets by exercise for this workout
      const exerciseMap = new Map<string, any[]>();
      workoutSets.forEach((set: any) => {
        const exerciseName = set.exercise?.name || 'Unknown';
        if (!exerciseMap.has(exerciseName)) {
          exerciseMap.set(exerciseName, []);
        }
        exerciseMap.get(exerciseName)?.push(set);
      });

      return {
        id: workout.id,
        title: workout.title || undefined,
        started_at: workout.started_at,
        ended_at: workout.ended_at || undefined,
        duration_minutes: durationMinutes,
        total_sets: totalSets,
        total_volume_kg: totalVolumeKg,
        exercises: Array.from(exerciseMap.entries()).map(([name, sets]) => ({
          name,
          sets: sets.map((set, index) => ({
            set_number: index + 1,
            reps: set.reps,
            weight: set.weight,
            weight_unit: set.weight_unit,
            rpe: set.rpe || undefined,
            is_warmup: set.is_warmup || false,
          })),
        })),
      };
    }) || [];

    // Calculate weekly totals
    const totalWorkouts = exportWorkouts.length;
    const totalSets = exportWorkouts.reduce((sum, w) => sum + w.total_sets, 0);
    const totalVolumeKg = exportWorkouts.reduce((sum, w) => sum + w.total_volume_kg, 0);
    const totalDurationMinutes = exportWorkouts.reduce(
      (sum, w) => sum + (w.duration_minutes || 0),
      0
    );

    // Fetch XP data for the week
    const { data: xpData } = await supabase
      .from('weekly_xp')
      .select('xp')
      .eq('user_id', user.id)
      .gte('iso_week', parseInt(weekStart.slice(0, 4) + weekStart.slice(5, 7)))
      .lte('iso_week', parseInt(weekEnd.slice(0, 4) + weekEnd.slice(5, 7)))
      .maybeSingle();

    const xpEarned = xpData?.xp || 0;

    // Build export data
    const exportData: ExportWeeklySummary = {
      week_start: weekStart,
      week_end: weekEnd,
      total_workouts: totalWorkouts,
      total_sets: totalSets,
      total_volume_kg: totalVolumeKg,
      total_duration_minutes: totalDurationMinutes,
      xp_earned: xpEarned,
      workouts: exportWorkouts,
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error in weekly export:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

