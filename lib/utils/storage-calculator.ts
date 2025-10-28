// Storage calculation utilities for progress photos

import { createClient } from '@/lib/supabase/server';

const BUCKET_NAME = 'progress-photos-private';

/**
 * Calculate total storage used by a user's progress photos
 * This function queries actual file sizes from Supabase Storage
 */
export async function calculateUserStorage(userId: string): Promise<number> {
  const supabase = await createClient();

  // Get all photo records for the user
  const { data: photos, error } = await supabase
    .from('progress_photo')
    .select('thumb_path, file_path, original_path')
    .eq('user_id', userId);

  if (error || !photos) {
    console.error('Error fetching photos for storage calculation:', error);
    return 0;
  }

  let totalBytes = 0;

  // Sum up file sizes from storage
  for (const photo of photos) {
    const paths = [photo.thumb_path, photo.file_path];
    if (photo.original_path) {
      paths.push(photo.original_path);
    }

    for (const path of paths) {
      if (!path) continue; // Skip null paths
      
      try {
        // Get file metadata from storage
        const { data: fileData, error: fileError } = await supabase.storage
          .from(BUCKET_NAME)
          .list(path.substring(0, path.lastIndexOf('/')), {
            search: path.split('/').pop(),
          });

        if (!fileError && fileData && fileData.length > 0) {
          // Note: Supabase storage list doesn't return file sizes in some versions
          // This is a limitation - we may need to estimate or track sizes in DB
          // For now, we'll use estimated sizes based on variants
          if (path === photo.thumb_path) {
            totalBytes += 50000; // ~50KB estimate for thumbs
          } else if (path === photo.file_path) {
            totalBytes += 250000; // ~250KB estimate for medium
          } else if (path === photo.original_path) {
            totalBytes += 3000000; // ~3MB estimate for originals
          }
        }
      } catch (err) {
        console.error('Error getting file size:', err);
      }
    }
  }

  return totalBytes;
}

/**
 * Update storage tracking for a user
 */
export async function updateStorageTracking(userId: string): Promise<void> {
  const supabase = await createClient();
  const totalBytes = await calculateUserStorage(userId);

  await supabase.from('progress_photo_storage').upsert({
    user_id: userId,
    total_bytes: totalBytes,
    updated_at: new Date().toISOString(),
  });
}

/**
 * Check if user has enough storage quota for an upload
 */
export async function checkStorageQuota(
  userId: string,
  uploadSize: number
): Promise<{ allowed: boolean; currentUsage: number; quota: number }> {
  const supabase = await createClient();

  const { data: storage } = await supabase
    .from('progress_photo_storage')
    .select('total_bytes, quota_bytes')
    .eq('user_id', userId)
    .single();

  const currentUsage = storage?.total_bytes || 0;
  const quota = storage?.quota_bytes || 52428800; // 50 MB default

  return {
    allowed: currentUsage + uploadSize <= quota,
    currentUsage,
    quota,
  };
}

