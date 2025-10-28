'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProgressPhoto } from '@/lib/types/progress-photo';
import { format } from 'date-fns';

interface CompareSliderProps {
  open: boolean;
  onClose: () => void;
  photo1: ProgressPhoto;
  photo2: ProgressPhoto;
  photo1Url: string;
  photo2Url: string;
  onDownload: (id: string) => void;
}

export function CompareSlider({
  open,
  onClose,
  photo1,
  photo2,
  photo1Url,
  photo2Url,
  onDownload,
}: CompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => setIsDragging(false);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown date';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Compare Progress</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Image comparison slider */}
          <div
            ref={containerRef}
            className="relative w-full aspect-[3/4] bg-muted rounded-lg overflow-hidden cursor-ew-resize select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchMove={handleTouchMove}
          >
            {/* Before image (full) */}
            <div className="absolute inset-0">
              <img
                src={photo1Url}
                alt="Before"
                className="w-full h-full object-cover"
                draggable={false}
              />
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/70 text-white text-sm font-medium rounded-md">
                Before
              </div>
            </div>

            {/* After image (clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img
                src={photo2Url}
                alt="After"
                className="w-full h-full object-cover"
                draggable={false}
              />
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/70 text-white text-sm font-medium rounded-md">
                After
              </div>
            </div>

            {/* Slider handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                <ChevronLeft className="h-4 w-4 text-gray-600 -mr-1" />
                <ChevronRight className="h-4 w-4 text-gray-600 -ml-1" />
              </div>
            </div>
          </div>

          {/* Photo details */}
          <div className="grid grid-cols-2 gap-4">
            {/* Before details */}
            <div className="space-y-1">
              <p className="text-sm font-medium">Before</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(photo1.taken_at || photo1.created_at)}
              </p>
              {photo1.caption && (
                <p className="text-sm text-muted-foreground">{photo1.caption}</p>
              )}
            </div>

            {/* After details */}
            <div className="space-y-1">
              <p className="text-sm font-medium">After</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(photo2.taken_at || photo2.created_at)}
              </p>
              {photo2.caption && (
                <p className="text-sm text-muted-foreground">{photo2.caption}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onDownload(photo1.id)}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Before
            </Button>
            <Button
              variant="outline"
              onClick={() => onDownload(photo2.id)}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download After
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Drag the slider to compare photos
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

