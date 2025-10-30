// GET /api/supplements/logs - Get supplement logs (with optional date filter)
// POST /api/supplements/logs - Log supplement intake

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { CreateSupplementLogInput } from '@/lib/types/supplement';

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
    const date = searchParams.get('date'); // YYYY-MM-DD
    const supplementId = searchParams.get('supplement_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = supabase
      .from('supplement_log')
      .select(`
        *,
        supplement_definition:supplement_id (
          id,
          name,
          type,
          unit,
          daily_goal,
          color,
          icon,
          is_quantitative
        )
      `)
      .eq('user_id', user.id)
      .order('taken_at', { ascending: false });

    // Apply filters
    if (date) {
      query = query.eq('date', date);
    }
    if (supplementId) {
      query = query.eq('supplement_id', supplementId);
    }
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error fetching supplement logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch supplement logs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ logs: logs || [] });
  } catch (error) {
    console.error('Error in supplement logs GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateSupplementLogInput = await request.json();

    // Validate required fields
    if (!body.supplement_id || body.amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: supplement_id, amount' },
        { status: 400 }
      );
    }

    // Verify supplement exists and belongs to user
    const { data: supplement, error: supplementError } = await supabase
      .from('supplement_definition')
      .select('id')
      .eq('id', body.supplement_id)
      .eq('user_id', user.id)
      .single();

    if (supplementError || !supplement) {
      return NextResponse.json(
        { error: 'Supplement not found' },
        { status: 404 }
      );
    }

    const takenAt = body.taken_at || new Date().toISOString();
    const date = body.date || new Date().toISOString().split('T')[0];

    // Create log entry
    const { data: log, error } = await supabase
      .from('supplement_log')
      .insert({
        user_id: user.id,
        supplement_id: body.supplement_id,
        amount: body.amount,
        logged_at: takenAt,
        unit: body.unit || 'g',
        notes: body.notes,
      })
      .select(`
        *,
        supplement_definition:supplement_id (
          id,
          name,
          type,
          unit,
          daily_goal,
          color,
          icon
        )
      `)
      .single();

    if (error) {
      console.error('Error creating supplement log:', error);
      return NextResponse.json(
        { error: 'Failed to create supplement log' },
        { status: 500 }
      );
    }

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error('Error in supplement logs POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

