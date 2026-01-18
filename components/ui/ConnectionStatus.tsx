'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  isWaitingForServer?: boolean;
  lastUpdate?: Date;
}

export function ConnectionStatus({
  isConnected,
  isWaitingForServer,
  lastUpdate,
}: ConnectionStatusProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    if (!lastUpdate) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  const getStatus = () => {
    if (!isConnected) {
      return {
        icon: <WifiOff className="w-4 h-4" />,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        label: '已断开',
      };
    }
    if (isWaitingForServer) {
      return {
        icon: <RefreshCw className="w-4 h-4 animate-spin" />,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        label: '等待响应...',
      };
    }
    return {
      icon: <Wifi className="w-4 h-4" />,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      label: '已连接',
    };
  };

  const status = getStatus();

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg} transition-all`}>
      <span className={status.color}>{status.icon}</span>
      <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
      {lastUpdate && (
        <span className="text-xs text-white/40">
          ({Math.floor((currentTime.getTime() - lastUpdate.getTime()) / 1000)}s ago)
        </span>
      )}
    </div>
  );
}

export function DataFreshnessIndicator({
  timestamp,
  maxAgeMinutes = 24 * 60,
}: {
  timestamp?: string;
  maxAgeMinutes?: number;
}) {
  const [age, setAge] = useState<number>(0);

  useEffect(() => {
    if (!timestamp) return;

    const updateAge = () => {
      const dataTime = new Date(timestamp).getTime();
      const now = Date.now();
      setAge(Math.floor((now - dataTime) / 1000 / 60));
    };

    updateAge();
    const interval = setInterval(updateAge, 60000);

    return () => clearInterval(interval);
  }, [timestamp]);

  if (!timestamp) {
    return (
      <div className="flex items-center gap-1 text-white/40 text-xs">
        <span className="w-2 h-2 rounded-full bg-gray-400" />
        <span>暂无数据</span>
      </div>
    );
  }

  const isFresh = age < maxAgeMinutes;
  const isStale = age >= maxAgeMinutes && age < maxAgeMinutes * 2;

  return (
    <div className="flex items-center gap-1 text-xs">
      <span
        className={`w-2 h-2 rounded-full ${
          isFresh ? 'bg-green-400' : isStale ? 'bg-yellow-400' : 'bg-red-400'
        }`}
      />
      <span className={isFresh ? 'text-green-400' : isStale ? 'text-yellow-400' : 'text-red-400'}>
        {age < 60
          ? `${age}分钟前`
          : age < 1440
          ? `${Math.floor(age / 60)}小时前`
          : `${Math.floor(age / 1440)}天前`}
      </span>
    </div>
  );
}
