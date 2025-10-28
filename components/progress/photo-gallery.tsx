'use client';

import { useState, useEffect } from 'react';
import { MoreVertical, Trash2, Download, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProgressPhoto } from '@/lib/types/progress-photo';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface PhotoGalleryProps {
  photos: ProgressPhoto[];
  onDelete: (id: string) => Promise<void>;
  onCompare: (photo1: ProgressPhoto, photo2: ProgressPhoto) => void;
  onDownload: (id: string) => void;
  getImageUrl: (id: string, variant: 'thumb' | 'medium' | 'original') => Promise<string>;
}

export function PhotoGallery({
  photos,
  onDelete,
  onCompare,
  onDownload,
  getImageUrl,
}: PhotoGalleryProps) {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [selectedPhotos, setSelectedPhotos] = useState<ProgressPhoto[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load thumbnails
  useEffect(() => {
    const loadThumbnails = async () => {
      const urls: Record<string, string> = {};
      for (const photo of photos) {
        try {
          const url = await getImageUrl(photo.id, 'thumb');
          urls[photo.id] = url;
        } catch (error) {
          console.error('Error loading thumbnail:', error);
        }
      }
      setThumbnails(urls);
    };

    loadThumbnails();
  }, [photos, getImageUrl]);

  const handlePhotoClick = (photo: ProgressPhoto) => {
    if (selectedPhotos.length === 0) {
      setSelectedPhotos([photo]);
    } else if (selectedPhotos.length === 1) {
      if (selectedPhotos[0].id === photo.id) {
        setSelectedPhotos([]);
      } else {
        setSelectedPhotos([selectedPhotos[0], photo]);
        // Trigger comparison
        onCompare(selectedPhotos[0], photo);
        setSelectedPhotos([]);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      await onDelete(deleteId);
      toast.success('Photo deleted successfully');
      setDeleteId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete photo');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string | null, fallback: string) => {
    if (!dateStr) return format(new Date(fallback), 'MMM d, yyyy');
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return format(new Date(fallback), 'MMM d, yyyy');
    }
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <Images className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">No progress photos yet</p>
        <p className="text-sm text-muted-foreground">
          Upload your first photo to start tracking your transformation
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {selectedPhotos.length > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm font-medium">
              {selectedPhotos.length === 1
                ? 'Select another photo to compare'
                : 'Comparing photos...'}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPhotos([])}
              className="mt-2"
            >
              Cancel
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`group relative aspect-[3/4] bg-muted rounded-lg overflow-hidden cursor-pointer transition-all ${
                selectedPhotos.some((p) => p.id === photo.id)
                  ? 'ring-2 ring-primary'
                  : 'hover:ring-2 hover:ring-primary/50'
              }`}
              onClick={() => handlePhotoClick(photo)}
            >
              {thumbnails[photo.id] ? (
                <img
                  src={thumbnails[photo.id]}
                  alt={photo.caption || 'Progress photo'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-pulse text-muted-foreground">Loading...</div>
                </div>
              )}

              {/* Overlay with info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <p className="text-xs font-medium">
                    {formatDate(photo.taken_at, photo.created_at)}
                  </p>
                  {photo.caption && (
                    <p className="text-xs truncate mt-1">{photo.caption}</p>
                  )}
                </div>

                {/* Actions menu */}
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 bg-black/50 hover:bg-black/75"
                      >
                        <MoreVertical className="h-4 w-4 text-white" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(photo.id);
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(photo.id);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this progress photo. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

