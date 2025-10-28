// POST /api/progress-photos/[id]/download - Get download URL for original

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const BUCKET_NAME = 'progress-photos-private';
const SIGNED_URL_EXPIRY = 120; // 120 seconds

export async function POST(
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

    // Fetch photo and verify ownership
    const { data: photo, error } = await supabase
      .from('progress_photo')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Use original if available, otherwise fall back to medium
    const filePath = photo.original_path || photo.file_path;

    if (!filePath) {
      return NextResponse.json(
        { error: 'No downloadable file available' },
        { status: 404 }
      );
    }

    // Generate signed URL with download header
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, SIGNED_URL_EXPIRY, {
        download: true,
      });

    if (signedUrlError || !signedUrlData) {
      console.error('Error generating download URL:', signedUrlError);
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: signedUrlData.signedUrl,
      expiresIn: SIGNED_URL_EXPIRY,
      fileName: filePath.split('/').pop() || 'progress-photo.jpg',
    });
  } catch (error) {
    console.error('Error in progress photo download:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

