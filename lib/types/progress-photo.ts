// Progress Photos Types

export interface ProgressPhoto {
  id: string;
  user_id: string;
  file_path: string;
  thumb_path: string | null;
  original_path: string | null;
  caption: string | null;
  taken_at: string | null; // ISO date string
  created_at: string;
}

export interface ProgressPhotoWithUrls extends ProgressPhoto {
  thumb_url?: string;
  medium_url?: string;
  original_url?: string;
}

export interface ProgressPhotoStorage {
  user_id: string;
  total_bytes: number;
  quota_bytes: number;
  updated_at: string;
}

export interface UploadProgressPhotoRequest {
  thumbFile: File;
  mediumFile: File;
  originalFile?: File;
  caption?: string;
  taken_at?: string; // ISO date string
}

export interface UploadProgressPhotoResponse {
  photo: ProgressPhoto;
  storage: ProgressPhotoStorage;
}

export interface ImageVariant {
  file: File;
  type: 'thumb' | 'medium' | 'original';
  size: number;
}

export interface CompressionResult {
  thumb: File;
  medium: File;
  original?: File;
  totalSize: number;
  compressionRatio: number;
}

export type PhotoVariant = 'thumb' | 'medium' | 'original';

