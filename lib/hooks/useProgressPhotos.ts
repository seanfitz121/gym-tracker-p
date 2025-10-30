// Custom hook for progress photos management

import { useState, useEffect, useCallback } from 'react';
import { ProgressPhoto, ProgressPhotoStorage } from '@/lib/types/progress-photo';
import { processProgressPhoto } from '@/lib/utils/image-processing';

interface UseProgressPhotosResult {
  photos: ProgressPhoto[];
  storage: ProgressPhotoStorage | null;
  loading: boolean;
  error: string | null;
  uploadPhoto: (
    file: File,
    options: {
      caption?: string;
      takenAt?: string;
      keepOriginal?: boolean;
    }
  ) => Promise<ProgressPhoto>;
  deletePhoto: (id: string) => Promise<void>;
  getImageUrl: (id: string, variant: 'thumb' | 'medium' | 'original') => Promise<string>;
  downloadPhoto: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useProgressPhotos(): UseProgressPhotosResult {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [storage, setStorage] = useState<ProgressPhotoStorage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch photos from API
  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/progress-photos');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch photos');
      }

      const data = await response.json();
      setPhotos(data.photos || []);
      setStorage(data.storage || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch photos';
      setError(message);
      console.error('Error fetching progress photos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload new photo
  const uploadPhoto = useCallback(
    async (
      file: File,
      options: {
        caption?: string;
        takenAt?: string;
        keepOriginal?: boolean;
      }
    ): Promise<ProgressPhoto> => {
      try {
        setError(null);

        // Process image on client side
        const processed = await processProgressPhoto(file, options.keepOriginal || false);

        // Create form data
        const formData = new FormData();
        formData.append('thumb', processed.thumb);
        formData.append('medium', processed.medium);
        if (processed.original) {
          formData.append('original', processed.original);
        }
        if (options.caption) {
          formData.append('caption', options.caption);
        }
        if (options.takenAt) {
          formData.append('taken_at', options.takenAt);
        }

        // Upload to API
        const response = await fetch('/api/progress-photos/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to upload photo');
        }

        const data = await response.json();

        // Update local state
        setPhotos((prev) => [data.photo, ...prev]);
        setStorage(data.storage);

        return data.photo;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload photo';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Delete photo
  const deletePhoto = useCallback(async (id: string) => {
    try {
      setError(null);

      const response = await fetch(`/api/progress-photos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || 'Failed to delete photo');
      }

      const data = await response.json();

      // Update local state immediately (optimistic update)
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      
      // Update storage from response
      if (data.storage) {
        setStorage(data.storage);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete photo';
      setError(message);
      console.error('Delete photo error:', err);
      throw err;
    }
  }, []);

  // Get signed URL for image
  const getImageUrl = useCallback(
    async (id: string, variant: 'thumb' | 'medium' | 'original'): Promise<string> => {
      try {
        const response = await fetch(
          `/api/progress-photos/${id}/image?variant=${variant}`
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to get image URL');
        }

        const data = await response.json();
        return data.url;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to get image URL';
        console.error('Error getting image URL:', err);
        throw new Error(message);
      }
    },
    []
  );

  // Download photo
  const downloadPhoto = useCallback(async (id: string) => {
    try {
      setError(null);

      const response = await fetch(`/api/progress-photos/${id}/download`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to download photo');
      }

      const data = await response.json();

      // Trigger download
      const link = document.createElement('a');
      link.href = data.url;
      link.download = data.fileName || 'progress-photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download photo';
      setError(message);
      throw err;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  return {
    photos,
    storage,
    loading,
    error,
    uploadPhoto,
    deletePhoto,
    getImageUrl,
    downloadPhoto,
    refresh: fetchPhotos,
  };
}

