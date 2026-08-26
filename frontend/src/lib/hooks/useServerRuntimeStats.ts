import { useEffect, useState } from 'react';
import { getServerRuntimeStats, ServerRuntimeStats } from '@/services/docker/fetchs';

const POLL_INTERVAL_MS = 10_000;

export function useServerRuntimeStats(serverId: string, serverStatus: string) {
  const [stats, setStats] = useState<ServerRuntimeStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (serverStatus !== 'running') {
      setStats(null);
      setIsLoading(false);
      return;
    }

    let active = true;
    setStats(null);
    setIsLoading(true);

    const loadStats = async () => {
      try {
        const nextStats = await getServerRuntimeStats(serverId);
        if (active) setStats(nextStats);
      } catch (error) {
        console.error(`Error fetching runtime stats for ${serverId}:`, error);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadStats();
    const interval = window.setInterval(loadStats, POLL_INTERVAL_MS);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [serverId, serverStatus]);

  return { stats, isLoading };
}
