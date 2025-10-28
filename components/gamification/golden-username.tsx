'use client';

import { cn } from '@/lib/utils';

interface GoldenUsernameProps {
  username: string;
  isPremium: boolean;
  flairEnabled: boolean;
  className?: string;
  showIcon?: boolean;
}

export function GoldenUsername({
  username,
  isPremium,
  flairEnabled,
  className,
  showIcon = true,
}: GoldenUsernameProps) {
  // Only show golden flair if user is premium AND has it enabled
  const shouldShowFlair = isPremium && flairEnabled;

  if (!shouldShowFlair) {
    return <span className={className}>{username}</span>;
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span
        className="golden-username font-semibold"
        aria-label="Pro member"
      >
        {username}
      </span>
      {showIcon && (
        <span className="inline-block text-sm" aria-hidden="true">
          💎
        </span>
      )}
    </span>
  );
}

// CSS for the golden gradient effect is in globals.css

