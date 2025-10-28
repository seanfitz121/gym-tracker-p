// GET /api/progress-photos - List user's progress photos
// POST /api/progress-photos/upload - Upload new progress photo

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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

    // Get user's progress photos
    const { data: photos, error } = await supabase
      .from('progress_photo')
      .select('*')
      .eq('user_id', user.id)
      .order('taken_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching progress photos:', error);
      return NextResponse.json(
        { error: 'Failed to fetch photos' },
        { status: 500 }
      );
    }

    // Get storage usage
    const { data: storage } = await supabase
      .from('progress_photo_storage')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      photos: photos || [],
      storage: storage || { total_bytes: 0, quota_bytes: 52428800 },
    });
  } catch (error) {
    console.error('Error in progress photos GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

