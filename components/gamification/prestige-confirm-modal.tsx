'use client';

import { useState } from 'react';
import { AlertTriangle, Trophy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePrestigeEnter } from '@/lib/hooks/usePrestige';
import { toast } from 'sonner';

interface PrestigeConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (result: { prestige_count: number; badge_name: string }) => void;
  currentPrestigeCount: number;
}

export function PrestigeConfirmModal({
  open,
  onClose,
  onSuccess,
  currentPrestigeCount,
}: PrestigeConfirmModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const { enterPrestige, entering } = usePrestigeEnter();

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  const handleConfirm = async () => {
    if (confirmText.toUpperCase() !== 'RESET') {
      toast.error('Please type RESET to confirm');
      return;
    }

    const result = await enterPrestige();

    if (result && result.success) {
      toast.success('Prestige Mode activated!');
      onSuccess({
        prestige_count: result.prestige_count!,
        badge_name: result.badge_name!,
      });
      handleClose();
    } else {
      toast.error(result?.error || 'Failed to enter prestige mode');
    }
  };

  const nextPrestige = currentPrestigeCount + 1;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-500" />
            Enter Prestige Mode
          </DialogTitle>
          <DialogDescription>
            Reset your XP and level to earn Prestige {nextPrestige}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>This action will reset your XP and level to 0.</strong> This cannot be
              undone. You will need to wait 30 days before you can prestige again.
            </AlertDescription>
          </Alert>

          {/* What you'll get */}
          <div className="space-y-2">
            <p className="font-medium text-sm">You will receive:</p>
            <ul className="space-y-1 text-sm text-muted-foreground pl-4">
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>
                  <strong className="text-foreground">Prestige {nextPrestige}</strong> badge
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Fresh progression journey</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Bragging rights 😎</span>
              </li>
            </ul>
          </div>

          {/* What you'll keep */}
          <div className="space-y-2">
            <p className="font-medium text-sm">You will keep:</p>
            <ul className="space-y-1 text-sm text-muted-foreground pl-4">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">✓</span>
                <span>All lifetime stats and workout history</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">✓</span>
                <span>All personal records (PRs)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">✓</span>
                <span>All earned badges (including previous prestiges)</span>
              </li>
            </ul>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirm-text">
              Type <strong>RESET</strong> to confirm
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="RESET"
              className="uppercase"
              disabled={entering}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={entering}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={confirmText.toUpperCase() !== 'RESET' || entering}
          >
            {entering ? 'Processing...' : `Enter Prestige ${nextPrestige}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

