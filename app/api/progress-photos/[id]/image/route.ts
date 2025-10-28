// GET /api/progress-photos/[id]/image?variant=thumb|medium|original
// Returns signed URL for image variant

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const BUCKET_NAME = 'progress-photos-private';
const SIGNED_URL_EXPIRY = 120; // 120 seconds

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

    // Get variant from query params
    const searchParams = request.nextUrl.searchParams;
    const variant = searchParams.get('variant') || 'medium';

    if (!['thumb', 'medium', 'original'].includes(variant)) {
      return NextResponse.json({ error: 'Invalid variant' }, { status: 400 });
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

    // Get the appropriate file path
    let filePath: string | null = null;
    switch (variant) {
      case 'thumb':
        filePath = photo.thumb_path;
        break;
      case 'medium':
        filePath = photo.file_path;
        break;
      case 'original':
        filePath = photo.original_path;
        break;
    }

    if (!filePath) {
      return NextResponse.json(
        { error: `${variant} variant not available` },
        { status: 404 }
      );
    }

    // Generate signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, SIGNED_URL_EXPIRY);

    if (signedUrlError || !signedUrlData) {
      console.error('Error generating signed URL:', signedUrlError);
      return NextResponse.json(
        { error: 'Failed to generate signed URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: signedUrlData.signedUrl,
      expiresIn: SIGNED_URL_EXPIRY,
    });
  } catch (error) {
    console.error('Error in progress photo image endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

