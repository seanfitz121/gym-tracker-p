'use client';

import { useState } from 'react';
import { Crown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoldenUsername } from '@/components/gamification/golden-username';
import { toast } from 'sonner';

interface FlairToggleProps {
  isPremium: boolean;
  initialFlairEnabled: boolean;
  username: string;
}

export function FlairToggle({ isPremium, initialFlairEnabled, username }: FlairToggleProps) {
  const [flairEnabled, setFlairEnabled] = useState(initialFlairEnabled);
  const [updating, setUpdating] = useState(false);

  const handleToggle = async (enabled: boolean) => {
    try {
      setUpdating(true);
      
      const response = await fetch('/api/settings/flair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ premium_flair_enabled: enabled }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update flair setting');
      }

      setFlairEnabled(enabled);
      toast.success(enabled ? 'Golden name flair enabled' : 'Golden name flair disabled');
    } catch (error) {
      console.error('Error updating flair:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update flair');
      setFlairEnabled(!enabled); // Revert on error
    } finally {
      setUpdating(false);
    }
  };

  if (!isPremium) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Golden Name Flair
          </CardTitle>
          <CardDescription>
            Premium feature - Upgrade to unlock golden username display
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Golden Name Flair
        </CardTitle>
        <CardDescription>
          Display your username in gold across the app (Premium exclusive)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="flair-toggle" className="text-base font-medium">
            Enable Golden Name
          </Label>
          <Switch
            id="flair-toggle"
            checked={flairEnabled}
            onCheckedChange={handleToggle}
            disabled={updating}
          />
        </div>

        {/* Preview */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
          <div className="flex items-center gap-2 text-lg">
            <span className="text-muted-foreground">Username:</span>
            <GoldenUsername
              username={username}
              isPremium={isPremium}
              flairEnabled={flairEnabled}
              showIcon={true}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Your golden username will appear in your profile, comments, leaderboard, and social
          features. You can toggle this on or off anytime.
        </p>
      </CardContent>
    </Card>
  );
}

