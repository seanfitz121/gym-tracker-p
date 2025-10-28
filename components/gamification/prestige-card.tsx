'use client';

import { useState } from 'react';
import { Crown, Zap, AlertTriangle, Clock, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePrestigeStatus } from '@/lib/hooks/usePrestige';
import { PrestigeConfirmModal } from './prestige-confirm-modal';
import { PrestigeSuccessModal } from './prestige-success-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface PrestigeCardProps {
  isPremium: boolean;
}

export function PrestigeCard({ isPremium }: PrestigeCardProps) {
  const { status, loading, refresh } = usePrestigeStatus();
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [prestigeResult, setPrestigeResult] = useState<{
    prestige_count: number;
    badge_name: string;
  } | null>(null);

  const handlePrestigeSuccess = (result: { prestige_count: number; badge_name: string }) => {
    setPrestigeResult(result);
    setConfirmModalOpen(false);
    setSuccessModalOpen(true);
    refresh(); // Refresh status
  };

  if (!isPremium) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-500" />
            Prestige Mode
          </CardTitle>
          <CardDescription>
            Premium feature - Reset your XP for infinite progression
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/50 p-4 text-center">
            <Crown className="h-12 w-12 mx-auto mb-3 text-yellow-500" />
            <p className="text-sm text-muted-foreground mb-4">
              Prestige Mode is available exclusively for Premium members
            </p>
            <Button asChild variant="default">
              <a href="/app/premium">Upgrade to Premium</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  const daysRemaining = status?.days_remaining || 0;
  const isOnCooldown = !status?.isEligible && daysRemaining > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-500" />
            Prestige Mode
            {status && status.prestige_count > 0 && (
              <Badge variant="secondary" className="ml-2">
                Prestige {status.prestige_count}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Reset your XP for infinite progression and exclusive Prestige badges
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Card */}
          <div
            className={`rounded-lg border p-4 ${
              status?.isEligible
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                : 'bg-muted/50'
            }`}
          >
            {status?.isEligible ? (
              <>
                <div className="flex items-start gap-3 mb-3">
                  <Zap className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      Ready to Prestige!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      You've reached the top rank and can enter Prestige Mode
                    </p>
                  </div>
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  <p>Current XP: <strong>{status?.current_xp?.toLocaleString()}</strong></p>
                  {(status?.prestige_count ?? 0) > 0 && (
                    <p className="mt-1">
                      Your next prestige will be: <strong>Prestige {(status?.prestige_count ?? 0) + 1}</strong>
                    </p>
                  )}
                </div>
              </>
            ) : isOnCooldown ? (
              <>
                <div className="flex items-start gap-3 mb-3">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div>
                    <p className="font-semibold">Prestige Cooldown Active</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You can prestige again in{' '}
                      {status?.next_eligible_at &&
                        formatDistanceToNow(new Date(status.next_eligible_at))}
                    </p>
                  </div>
                </div>
                {status?.last_prestige_at && (
                  <p className="text-sm text-muted-foreground">
                    Last prestige:{' '}
                    {formatDistanceToNow(new Date(status.last_prestige_at), { addSuffix: true })}
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-semibold">Not Yet Eligible</p>
                    <p className="text-sm text-muted-foreground mt-1">{status?.reason}</p>
                  </div>
                </div>
                {status?.required_xp && status?.current_xp !== undefined && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress to Prestige</span>
                      <span className="font-medium">
                        {status?.current_xp?.toLocaleString()} / {status?.required_xp?.toLocaleString()} XP
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${Math.min(((status?.current_xp ?? 0) / (status?.required_xp ?? 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Button */}
          <Button
            onClick={() => setConfirmModalOpen(true)}
            disabled={!status?.isEligible}
            variant="destructive"
            size="lg"
            className="w-full"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Enter Prestige Mode
          </Button>

          {/* Info */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium">What happens when you Prestige:</p>
            <ul className="space-y-1 pl-4">
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Earn exclusive Prestige badge</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Keep all lifetime stats, PRs, and workout history</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400">⚠</span>
                <span>Your XP and level will reset to 0</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400">⚠</span>
                <span>30-day cooldown before next Prestige</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <PrestigeConfirmModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onSuccess={handlePrestigeSuccess}
        currentPrestigeCount={status?.prestige_count || 0}
      />

      {prestigeResult && (
        <PrestigeSuccessModal
          open={successModalOpen}
          onClose={() => setSuccessModalOpen(false)}
          prestigeCount={prestigeResult.prestige_count}
          badgeName={prestigeResult.badge_name}
        />
      )}
    </>
  );
}

