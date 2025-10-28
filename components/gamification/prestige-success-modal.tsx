'use client';

import { useEffect } from 'react';
import { Trophy, Star, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface PrestigeSuccessModalProps {
  open: boolean;
  onClose: () => void;
  prestigeCount: number;
  badgeName: string;
}

export function PrestigeSuccessModal({
  open,
  onClose,
  prestigeCount,
  badgeName,
}: PrestigeSuccessModalProps) {
  useEffect(() => {
    if (open) {
      // Trigger confetti celebration
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 999999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [open]);

  const handleShare = () => {
    // Future: implement social sharing
    navigator.clipboard.writeText(
      `I just entered Prestige ${prestigeCount} on SF Gym Tracker! 💪🏆`
    );
    alert('Copied to clipboard!');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Prestige Success!</DialogTitle>
          <DialogDescription className="sr-only">
            You've successfully entered prestige mode
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6 text-center">
          {/* Animated Trophy */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-16 w-16 text-yellow-400 animate-pulse" />
            </div>
            <div className="relative flex items-center justify-center">
              <Trophy className="h-24 w-24 text-purple-500 animate-bounce" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Prestige {prestigeCount} Unlocked!
            </h2>
            <p className="text-muted-foreground">
              You've reset your journey and earned the exclusive{' '}
              <strong className="text-foreground">{badgeName}</strong> badge!
            </p>
          </div>

          {/* Badge Preview */}
          <div className="rounded-lg border-2 border-purple-500 bg-purple-50 dark:bg-purple-950/20 p-4">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span>Prestige {prestigeCount}</span>
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Your prestige badge is now visible on your profile
            </p>
          </div>

          {/* New Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-muted-foreground mb-1">Current XP</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-muted-foreground mb-1">Current Level</p>
              <p className="text-2xl font-bold">1</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-2">
            <Button onClick={handleShare} variant="outline" className="w-full">
              Share Your Achievement
            </Button>
            <Button onClick={onClose} variant="default" className="w-full">
              Start Fresh Journey
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            All your lifetime stats, PRs, and workout history have been preserved. Happy
            grinding! 💪
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

