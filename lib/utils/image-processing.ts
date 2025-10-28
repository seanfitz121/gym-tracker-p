// Client-side image processing utilities for Progress Photos

export interface ResizeOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number; // 0-1
  format: 'webp' | 'jpeg';
}

/**
 * Resize and compress an image file client-side
 */
export async function resizeImage(
  file: File,
  options: ResizeOptions
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      const maxDimension = Math.max(width, height);
      const targetMax = Math.max(options.maxWidth, options.maxHeight);

      if (maxDimension > targetMax) {
        const scale = targetMax / maxDimension;
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }

          const mimeType = options.format === 'webp' ? 'image/webp' : 'image/jpeg';
          const newFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, `.${options.format}`),
            { type: mimeType }
          );

          resolve(newFile);
        },
        options.format === 'webp' ? 'image/webp' : 'image/jpeg',
        options.quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load the image
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Process an uploaded image into multiple variants (thumb, medium, optional original)
 */
export async function processProgressPhoto(
  file: File,
  keepOriginal: boolean = false
): Promise<{
  thumb: File;
  medium: File;
  original?: File;
  totalSize: number;
  compressionRatio: number;
}> {
  // Check if WebP is supported
  const supportsWebP = await checkWebPSupport();
  const format = supportsWebP ? 'webp' : 'jpeg';

  // Create thumbnail (~200px, lower quality for size)
  const thumb = await resizeImage(file, {
    maxWidth: 200,
    maxHeight: 200,
    quality: 0.75,
    format,
  });

  // Create medium variant (1080px longest side, high quality)
  const medium = await resizeImage(file, {
    maxWidth: 1080,
    maxHeight: 1080,
    quality: 0.85,
    format,
  });

  const totalSize = thumb.size + medium.size + (keepOriginal ? file.size : 0);
  const compressionRatio = file.size > 0 ? (1 - totalSize / file.size) : 0;

  return {
    thumb,
    medium,
    original: keepOriginal ? file : undefined,
    totalSize,
    compressionRatio,
  };
}

/**
 * Check if browser supports WebP
 */
async function checkWebPSupport(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width === 1);
    img.onerror = () => resolve(false);
    img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  });
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size (max 15 MB)
  const maxSize = 15 * 1024 * 1024; // 15 MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be smaller than 15 MB' };
  }

  return { valid: true };
}

