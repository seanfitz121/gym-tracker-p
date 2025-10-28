// Custom hook for Prestige Mode

import { useState, useEffect, useCallback } from 'react';
import { PrestigeStatusResponse, PrestigeEnterResponse } from '@/lib/types/prestige';

export function usePrestigeStatus() {
  const [status, setStatus] = useState<PrestigeStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/prestige/status');

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || 'Failed to fetch prestige status');
      }

      const data = await response.json();
      setStatus(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch prestige status';
      setError(message);
      console.error('Error fetching prestige status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    refresh: fetchStatus,
  };
}

export function usePrestigeEnter() {
  const [entering, setEntering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enterPrestige = useCallback(async (): Promise<PrestigeEnterResponse | null> => {
    try {
      setEntering(true);
      setError(null);

      const response = await fetch('/api/prestige/enter', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to enter prestige mode');
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enter prestige mode';
      setError(message);
      console.error('Error entering prestige:', err);
      return null;
    } finally {
      setEntering(false);
    }
  }, []);

  return {
    enterPrestige,
    entering,
    error,
  };
}

