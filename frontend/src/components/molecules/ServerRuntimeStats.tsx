'use client';

import { Clock3, Cpu, MemoryStick, Users, Waypoints } from 'lucide-react';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { useServerRuntimeStats } from '@/lib/hooks/useServerRuntimeStats';
import {
  formatPercent,
  formatPlayerCount,
  formatServerUptime,
  getServerCpuPercent,
  getServerMemoryPercent,
} from '@/lib/utils/server-runtime-stats';

interface ServerRuntimeStatsProps {
  readonly serverId: string;
  readonly serverStatus: string;
}

export function ServerRuntimeStats({ serverId, serverStatus }: ServerRuntimeStatsProps) {
  const { t } = useLanguage();
  const { stats, isLoading } = useServerRuntimeStats(serverId, serverStatus);
  const cpuPercent = stats ? getServerCpuPercent(stats) : null;
  const memoryPercent = stats ? getServerMemoryPercent(stats) : null;
  const values = [
    {
      label: t('players'),
      value: formatPlayerCount(stats),
      icon: Users,
      color: 'text-emerald-300',
    },
    {
      label: t('uptime'),
      value: stats ? formatServerUptime(stats.uptimeSeconds) : '…',
      icon: Clock3,
      color: 'text-cyan-300',
    },
    {
      label: t('cpu'),
      value: formatPercent(cpuPercent, isLoading && !stats),
      icon: Cpu,
      color: 'text-amber-300',
    },
    {
      label: t('memory'),
      value: formatPercent(memoryPercent, isLoading && !stats),
      icon: MemoryStick,
      color: 'text-fuchsia-300',
    },
    {
      label: t('version'),
      value: stats?.version || (isLoading ? '…' : '—'),
      icon: Waypoints,
      color: 'text-blue-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {values.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="mc-slot min-w-0 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-minecraft uppercase tracking-wide text-gray-400">
            <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} />
            <span className="truncate">{label}</span>
          </div>
          <p className="mt-1 truncate font-mono text-sm font-semibold text-white" title={value}>
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
