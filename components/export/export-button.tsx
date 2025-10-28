'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { usePremiumStatus } from '@/lib/hooks/use-premium';
import { useExport } from '@/lib/hooks/useExport';
import { toast } from 'sonner';
import type { ExportFormat } from '@/lib/types/export';

interface ExportButtonProps {
  type: 'workout' | 'template' | 'weekly';
  id?: string;
  weekStart?: string;
  weekEnd?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export function ExportButton({
  type,
  id,
  weekStart,
  weekEnd,
  variant = 'outline',
  size = 'sm',
  showLabel = true,
}: ExportButtonProps) {
  const { isPremium, loading: premiumLoading } = usePremiumStatus();
  const { exportWorkout, exportTemplate, exportWeeklySummary, loading } = useExport();
  const [open, setOpen] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    try {
      if (type === 'workout' && id) {
        await exportWorkout(id, format);
        toast.success(`Workout exported as ${format.toUpperCase()}`);
      } else if (type === 'template' && id) {
        await exportTemplate(id, format);
        toast.success(`Template exported as ${format.toUpperCase()}`);
      } else if (type === 'weekly' && weekStart && weekEnd) {
        await exportWeeklySummary(weekStart, weekEnd, format);
        toast.success(`Weekly summary exported as ${format.toUpperCase()}`);
      }
      setOpen(false);
    } catch (error) {
      // Error handling done in hook
      const message = error instanceof Error ? error.message : 'Export failed';
      toast.error(message);
    }
  };

  if (premiumLoading) {
    return (
      <Button variant={variant} size={size} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!isPremium) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => toast.error('Premium subscription required', {
          description: 'Export to CSV/PDF is a premium feature',
        })}
      >
        <Crown className="h-4 w-4" />
        {showLabel && <span className="ml-2">Export (Premium)</span>}
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {showLabel && <span className="ml-2">Export</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

