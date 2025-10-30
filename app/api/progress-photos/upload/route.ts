// POST /api/progress-photos/upload - Upload progress photo with variants

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const BUCKET_NAME = 'progress-photos-private';
const MAX_QUOTA = 52428800; // 50 MB default

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

    // Get current storage usage
    const { data: storageData } = await supabase
      .from('progress_photo_storage')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const currentUsage = storageData?.total_bytes || 0;
    const quota = storageData?.quota_bytes || MAX_QUOTA;

    // Parse multipart form data
    const formData = await request.formData();
    const thumbFile = formData.get('thumb') as File;
    const mediumFile = formData.get('medium') as File;
    const originalFile = formData.get('original') as File | null;
    const caption = formData.get('caption') as string | null;
    const takenAt = formData.get('taken_at') as string | null;

    if (!thumbFile || !mediumFile) {
      return NextResponse.json(
        { error: 'Thumbnail and medium images required' },
        { status: 400 }
      );
    }

    // Calculate total size of upload
    const uploadSize =
      thumbFile.size + mediumFile.size + (originalFile?.size || 0);

    // Check quota
    if (currentUsage + uploadSize > quota) {
      return NextResponse.json(
        {
          error: 'Storage quota exceeded',
          current: currentUsage,
          quota,
          required: uploadSize,
        },
        { status: 413 }
      );
    }

    // Generate unique file paths
    const photoId = crypto.randomUUID();
    const timestamp = Date.now();
    const getExtension = (file: File) => {
      const parts = file.name.split('.');
      return parts[parts.length - 1] || 'webp';
    };

    const thumbPath = `${user.id}/${photoId}/thumb_${timestamp}.${getExtension(thumbFile)}`;
    const mediumPath = `${user.id}/${photoId}/medium_${timestamp}.${getExtension(mediumFile)}`;
    const originalPath = originalFile
      ? `${user.id}/${photoId}/original_${timestamp}.${getExtension(originalFile)}`
      : null;

    // Upload files to storage
    const uploadPromises = [
      supabase.storage.from(BUCKET_NAME).upload(thumbPath, thumbFile, {
        contentType: thumbFile.type,
        upsert: false,
      }),
      supabase.storage.from(BUCKET_NAME).upload(mediumPath, mediumFile, {
        contentType: mediumFile.type,
        upsert: false,
      }),
    ];

    if (originalFile && originalPath) {
      uploadPromises.push(
        supabase.storage.from(BUCKET_NAME).upload(originalPath, originalFile, {
          contentType: originalFile.type,
          upsert: false,
        })
      );
    }

    const uploadResults = await Promise.all(uploadPromises);

    // Check for upload errors
    const uploadErrors = uploadResults.filter((r) => r.error);
    if (uploadErrors.length > 0) {
      console.error('Storage upload errors:', uploadErrors);
      // Clean up any successful uploads
      await Promise.all([
        supabase.storage.from(BUCKET_NAME).remove([thumbPath]),
        supabase.storage.from(BUCKET_NAME).remove([mediumPath]),
        originalPath
          ? supabase.storage.from(BUCKET_NAME).remove([originalPath])
          : Promise.resolve(),
      ]);
      return NextResponse.json(
        { error: 'Failed to upload files' },
        { status: 500 }
      );
    }

    // Create database record with file sizes
    const { data: photo, error: dbError } = await supabase
      .from('progress_photo')
      .insert({
        id: photoId,
        user_id: user.id,
        file_path: mediumPath,
        thumb_path: thumbPath,
        original_path: originalPath,
        thumb_size_bytes: thumbFile.size,
        medium_size_bytes: mediumFile.size,
        original_size_bytes: originalFile?.size || 0,
        caption,
        taken_at: takenAt,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Clean up uploaded files
      await Promise.all([
        supabase.storage.from(BUCKET_NAME).remove([thumbPath]),
        supabase.storage.from(BUCKET_NAME).remove([mediumPath]),
        originalPath
          ? supabase.storage.from(BUCKET_NAME).remove([originalPath])
          : Promise.resolve(),
      ]);
      return NextResponse.json(
        { error: 'Failed to save photo record' },
        { status: 500 }
      );
    }

    // Fetch updated storage usage (automatically calculated by trigger)
    const { data: updatedStorage } = await supabase
      .from('progress_photo_storage')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      photo,
      storage: updatedStorage || {
        total_bytes: uploadSize,
        quota_bytes: quota,
      },
    });
  } catch (error) {
    console.error('Error in progress photos upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

