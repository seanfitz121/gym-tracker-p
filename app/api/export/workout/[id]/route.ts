// GET /api/export/workout/[id] - Export workout data (Premium only)

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { ExportWorkout } from '@/lib/types/export';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

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

    // Fetch workout with all data
    const { data: workout, error: workoutError } = await supabase
      .from('workout_session')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (workoutError || !workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Fetch sets with exercise details
    const { data: sets, error: setsError } = await supabase
      .from('set_entry')
      .select(`
        *,
        exercise:exercise_id (
          id,
          name
        )
      `)
      .eq('session_id', id)
      .order('exercise_id')
      .order('set_order');

    if (setsError) {
      console.error('Error fetching sets:', setsError);
      return NextResponse.json(
        { error: 'Failed to fetch workout data' },
        { status: 500 }
      );
    }

    // Calculate workout stats
    const totalSets = sets?.length || 0;
    const totalVolumeKg = sets?.reduce((sum, set) => {
      const weight = set.weight_unit === 'lb' ? set.weight * 0.453592 : set.weight;
      return sum + weight * set.reps;
    }, 0) || 0;

    // Calculate duration
    let durationMinutes: number | undefined;
    if (workout.started_at && workout.ended_at) {
      const start = new Date(workout.started_at).getTime();
      const end = new Date(workout.ended_at).getTime();
      durationMinutes = Math.round((end - start) / 60000);
    }

    // Group sets by exercise
    const exerciseMap = new Map<string, any[]>();
    sets?.forEach((set: any) => {
      const exerciseId = set.exercise?.id;
      if (!exerciseId) return;

      if (!exerciseMap.has(exerciseId)) {
        exerciseMap.set(exerciseId, []);
      }
      exerciseMap.get(exerciseId)?.push(set);
    });

    // Build export data
    const exportData: ExportWorkout = {
      id: workout.id,
      title: workout.title || undefined,
      started_at: workout.started_at,
      ended_at: workout.ended_at || undefined,
      duration_minutes: durationMinutes,
      total_sets: totalSets,
      total_volume_kg: totalVolumeKg,
      exercises: Array.from(exerciseMap.entries()).map(([exerciseId, sets]) => ({
        name: sets[0].exercise?.name || 'Unknown Exercise',
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

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error in workout export:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

