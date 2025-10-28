// GET /api/export/template/[id] - Export template data (Premium only)

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { ExportTemplate } from '@/lib/types/export';

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

    // Fetch template
    const { data: template, error: templateError } = await supabase
      .from('template')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Parse template payload
    const payload = template.payload as any;
    const exercises = payload.exercises || [];

    // Build export data
    const exportData: ExportTemplate = {
      id: template.id,
      name: template.name,
      exercises: exercises.map((ex: any) => ({
        name: ex.name || ex.exercise?.name || 'Unknown Exercise',
        sets: ex.sets?.length || 0,
        target_reps: ex.target_reps || ex.sets?.map((s: any) => s.reps).join(', '),
        target_weight: ex.target_weight || ex.sets?.map((s: any) => `${s.weight}${s.weight_unit || 'kg'}`).join(', '),
        notes: ex.notes || '',
      })),
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error in template export:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

