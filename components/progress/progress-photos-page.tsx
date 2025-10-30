'use client';

import { useState, useEffect } from 'react';
import { Upload, Crown, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePremiumStatus } from '@/lib/hooks/use-premium';
import { GetPremiumButton } from '@/components/premium/get-premium-button';
import { useProgressPhotos } from '@/lib/hooks/useProgressPhotos';
import { PhotoGallery } from './photo-gallery';
import { UploadPhotoModal } from './upload-photo-modal';
import { CompareSlider } from './compare-slider';
import { ProgressPhoto } from '@/lib/types/progress-photo';
import { formatBytes } from '@/lib/utils/image-processing';
import { toast } from 'sonner';

interface ProgressPhotosPageProps {
  userId: string;
}

export function ProgressPhotosPage({ userId }: ProgressPhotosPageProps) {
  const { isPremium, loading: premiumLoading } = usePremiumStatus();
  const {
    photos,
    storage,
    loading,
    error,
    uploadPhoto,
    deletePhoto,
    getImageUrl,
    downloadPhoto,
  } = useProgressPhotos();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [comparePhotos, setComparePhotos] = useState<{
    photo1: ProgressPhoto;
    photo2: ProgressPhoto;
    url1: string;
    url2: string;
  } | null>(null);

  const handleUpload = async (
    file: File,
    options: {
      caption?: string;
      takenAt?: string;
      keepOriginal?: boolean;
    }
  ) => {
    await uploadPhoto(file, options);
  };

  const handleCompare = async (photo1: ProgressPhoto, photo2: ProgressPhoto) => {
    try {
      const [url1, url2] = await Promise.all([
        getImageUrl(photo1.id, 'medium'),
        getImageUrl(photo2.id, 'medium'),
      ]);

      setComparePhotos({ photo1, photo2, url1, url2 });
      setCompareModalOpen(true);
    } catch (error) {
      toast.error('Failed to load comparison images');
      console.error('Error loading comparison images:', error);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      await downloadPhoto(id);
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download photo');
    }
  };

  // Show loading state while checking premium status
  if (premiumLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Skeleton className="aspect-[3/4]" />
            <Skeleton className="aspect-[3/4]" />
            <Skeleton className="aspect-[3/4]" />
          </div>
        </div>
      </div>
    );
  }

  if (loading && photos.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading your progress photos...</p>
        </div>
      </div>
    );
  }

  const storagePercentage = storage
    ? (storage.total_bytes / storage.quota_bytes) * 100
    : 0;
  const isStorageFull = storagePercentage >= 100;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Progress Photos</h1>
            {isPremium && (
              <Badge variant="secondary">
                <Zap className="h-3 w-3 mr-1 fill-purple-600 text-purple-600" />
                Premium
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Track your transformation with before & after photos
          </p>
        </div>
        {isPremium ? (
          <Button
            onClick={() => setUploadModalOpen(true)}
            disabled={isStorageFull}
            size="lg"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Photo
          </Button>
        ) : (
          <GetPremiumButton size="lg">
            Upgrade to Premium
          </GetPremiumButton>
        )}
      </div>

      {/* Storage indicator */}
      {storage && (
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Storage Usage</span>
            <span className="text-sm text-muted-foreground">
              {formatBytes(storage.total_bytes)} / {formatBytes(storage.quota_bytes)}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                storagePercentage >= 90
                  ? 'bg-destructive'
                  : storagePercentage >= 70
                    ? 'bg-yellow-500'
                    : 'bg-primary'
              }`}
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            />
          </div>
          {storagePercentage >= 90 && (
            <p className="text-xs text-destructive mt-2">
              {isStorageFull
                ? 'Storage full - delete old photos to upload new ones'
                : 'Storage almost full - consider deleting old photos'}
            </p>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Premium Gate for non-premium users */}
      {!isPremium && (
        <Card className="border-dashed bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Transform Your Body
              <Badge variant="outline" className="text-xs">Premium Feature</Badge>
            </CardTitle>
            <CardDescription>Upload and track your transformation with progress photos</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="text-center p-6 bg-white dark:bg-gray-950 rounded-lg border">
              <div className="text-4xl mb-3">📸</div>
              <h4 className="font-semibold mb-2">Upload Photos</h4>
              <p className="text-sm text-muted-foreground">
                Capture your progress with front, side, and back poses
              </p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-950 rounded-lg border">
              <div className="text-4xl mb-3">🔄</div>
              <h4 className="font-semibold mb-2">Compare Side-by-Side</h4>
              <p className="text-sm text-muted-foreground">
                See your transformation with before & after comparisons
              </p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-950 rounded-lg border">
              <div className="text-4xl mb-3">☁️</div>
              <h4 className="font-semibold mb-2">Cloud Storage</h4>
              <p className="text-sm text-muted-foreground">
                50MB of secure cloud storage for your photos
              </p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-950 rounded-lg border">
              <div className="text-4xl mb-3">📏</div>
              <h4 className="font-semibold mb-2">Track Measurements</h4>
              <p className="text-sm text-muted-foreground">
                Add body measurements and notes to each photo
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {isPremium && photos.length === 0 && (
        <Alert>
          <AlertDescription>
            <strong>Getting started:</strong> Upload your first progress photo to begin
            tracking your transformation. You can compare photos side-by-side by
            selecting two photos from your gallery.
          </AlertDescription>
        </Alert>
      )}

      {/* Gallery */}
      {isPremium && (
        <PhotoGallery
          photos={photos}
          onDelete={deletePhoto}
          onCompare={handleCompare}
          onDownload={handleDownload}
          getImageUrl={getImageUrl}
        />
      )}

      {/* Upload modal */}
      <UploadPhotoModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUpload}
        storageUsed={storage?.total_bytes || 0}
        storageQuota={storage?.quota_bytes || 52428800}
      />

      {/* Compare slider modal */}
      {comparePhotos && (
        <CompareSlider
          open={compareModalOpen}
          onClose={() => {
            setCompareModalOpen(false);
            setComparePhotos(null);
          }}
          photo1={comparePhotos.photo1}
          photo2={comparePhotos.photo2}
          photo1Url={comparePhotos.url1}
          photo2Url={comparePhotos.url2}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}

