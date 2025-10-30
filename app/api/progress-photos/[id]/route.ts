// DELETE /api/progress-photos/[id] - Delete progress photo

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const BUCKET_NAME = 'progress-photos-private';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    console.log('[DELETE] Starting delete for photo:', id);

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[DELETE] Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[DELETE] User authenticated:', user.id);

    // Fetch photo and verify ownership
    const { data: photo, error } = await supabase
      .from('progress_photo')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !photo) {
      console.error('[DELETE] Photo not found or error:', error);
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    console.log('[DELETE] Photo found, proceeding with delete');

    // Calculate size of files being deleted
    const filePaths = [photo.thumb_path, photo.file_path];
    if (photo.original_path) {
      filePaths.push(photo.original_path);
    }

    // Delete database record first (more important than storage cleanup)
    const { error: deleteError } = await supabase
      .from('progress_photo')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('[DELETE] Error deleting photo record:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete photo from database' },
        { status: 500 }
      );
    }

    console.log('[DELETE] Database record deleted successfully');

    // Try to delete files from storage (best effort - may fail if bucket doesn't exist)
    try {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filePaths.filter((path): path is string => Boolean(path)));

      if (storageError) {
        console.warn('Storage cleanup warning (non-fatal):', storageError);
        // Not fatal - DB record is already deleted
      }
    } catch (storageErr) {
      console.warn('Storage cleanup failed (non-fatal):', storageErr);
      // Not fatal - DB record is already deleted
    }

    // Storage is automatically recalculated by the database trigger
    // Fetch the updated storage info to return to client (optional)
    const { data: updatedStorage } = await supabase
      .from('progress_photo_storage')
      .select('*')
      .eq('user_id', user.id)
      .single();

    console.log('[DELETE] Delete completed successfully');
    return NextResponse.json({ 
      success: true,
      storage: updatedStorage 
    });
  } catch (error) {
    console.error('[DELETE] Unexpected error in progress photo delete:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

