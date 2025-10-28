// POST /api/settings/flair - Toggle golden name flair

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

    // Parse request body
    const body = await request.json();
    const { premium_flair_enabled } = body;

    if (typeof premium_flair_enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'premium_flair_enabled must be a boolean' },
        { status: 400 }
      );
    }

    // Update profile
    const { error: updateError } = await supabase
      .from('profile')
      .update({ premium_flair_enabled })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating flair setting:', updateError);
      return NextResponse.json(
        { error: 'Failed to update flair setting' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      premium_flair_enabled,
    });
  } catch (error) {
    console.error('Error in flair settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

