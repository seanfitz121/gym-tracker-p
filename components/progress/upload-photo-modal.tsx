'use client';

import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { validateImageFile, formatBytes } from '@/lib/utils/image-processing';
import { toast } from 'sonner';

interface UploadPhotoModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (
    file: File,
    options: {
      caption?: string;
      takenAt?: string;
      keepOriginal?: boolean;
    }
  ) => Promise<void>;
  storageUsed: number;
  storageQuota: number;
}

export function UploadPhotoModal({
  open,
  onClose,
  onUpload,
  storageUsed,
  storageQuota,
}: UploadPhotoModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [takenAt, setTakenAt] = useState('');
  const [keepOriginal, setKeepOriginal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      await onUpload(selectedFile, {
        caption: caption || undefined,
        takenAt: takenAt || undefined,
        keepOriginal,
      });
      toast.success('Photo uploaded successfully!');
      handleClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption('');
    setTakenAt('');
    setKeepOriginal(false);
    onClose();
  };

  const storagePercentage = (storageUsed / storageQuota) * 100;
  const estimatedSize = selectedFile ? selectedFile.size * (keepOriginal ? 0.4 : 0.15) : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Progress Photo</DialogTitle>
          <DialogDescription>
            Upload transformation photos to track your progress (Premium feature)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Storage usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Storage Used</span>
              <span className="font-medium">
                {formatBytes(storageUsed)} / {formatBytes(storageQuota)}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* File selector */}
          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Click to select photo</p>
              <p className="text-xs text-muted-foreground">
                Max 15 MB • JPG, PNG, WebP
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <>
              {/* Preview */}
              <div className="relative rounded-lg overflow-hidden bg-muted">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                )}
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/75 transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>

              {/* File info */}
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original size:</span>
                  <span className="font-medium">{formatBytes(selectedFile.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated upload:</span>
                  <span className="font-medium text-green-600">
                    ~{formatBytes(estimatedSize)}
                  </span>
                </div>
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <Label htmlFor="caption">Caption (optional)</Label>
                <Input
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g., After 3 months of training"
                  maxLength={200}
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="taken_at">Photo Date (optional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="taken_at"
                    type="date"
                    value={takenAt}
                    onChange={(e) => setTakenAt(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Keep original option */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="keep_original"
                  checked={keepOriginal}
                  onCheckedChange={(checked) => setKeepOriginal(checked as boolean)}
                />
                <label
                  htmlFor="keep_original"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Keep original quality (uses more storage)
                </label>
              </div>

              {/* Upload button */}
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full"
                size="lg"
              >
                {uploading ? (
                  'Uploading...'
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

