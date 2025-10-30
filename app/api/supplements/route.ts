// GET /api/supplements - List user's supplements
// POST /api/supplements - Create new supplement

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { CreateSupplementDefinitionInput } from '@/lib/types/supplement';

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

    // Get user's supplements
    const { data: supplements, error } = await supabase
      .from('supplement_definition')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching supplements:', error);
      return NextResponse.json(
        { error: 'Failed to fetch supplements' },
        { status: 500 }
      );
    }

    return NextResponse.json({ supplements: supplements || [] });
  } catch (error) {
    console.error('Error in supplements GET:', error);
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

    // Check if user is premium
    const { data: subscription } = await supabase
      .from('premium_subscription')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle();

    const isPremium = subscription && (subscription.status === 'active' || subscription.status === 'trialing');

    if (!isPremium) {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      );
    }

    const body: CreateSupplementDefinitionInput = await request.json();

    // Validate required fields
    if (!body.name || !body.type || !body.unit || body.daily_goal === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, unit, daily_goal' },
        { status: 400 }
      );
    }

    // Create supplement
    const { data: supplement, error } = await supabase
      .from('supplement_definition')
      .insert({
        user_id: user.id,
        name: body.name,
        type: body.type,
        daily_goal: body.daily_goal,
        unit: body.unit || 'g',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating supplement:', error);
      return NextResponse.json(
        { error: 'Failed to create supplement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ supplement }, { status: 201 });
  } catch (error) {
    console.error('Error in supplements POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

