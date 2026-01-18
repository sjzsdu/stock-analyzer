'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Activity,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Database,
  Brain,
  Shield,
  Sparkles,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { SkeletonCard, SkeletonChart } from '@/components/ui/Skeleton';

interface ProgressState {
  stage: string;
  progress: number;
  message: string;
  details?: Record<string, unknown>;
  elapsed_seconds?: number;
  result?: Record<string, unknown>;
  error?: string;
  isWaitingForServer?: boolean;
}

interface AnalysisProgressProps {
  progress: ProgressState | null;
  isRunning: boolean;
  hasError: boolean;
  error: string | null;
  symbol: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

interface StageInfo {
  key: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const STAGES: StageInfo[] = [
  {
    key: 'check_cache',
    label: '检查缓存',
    icon: <Database className="w-4 h-4" />,
    description: '检查是否有历史分析数据',
  },
  {
    key: 'collect_basic',
    label: '采集基本信息',
    icon: <Database className="w-4 h-4" />,
    description: '获取股票基本信息和公司资料',
  },
  {
    key: 'collect_kline',
    label: '采集K线数据',
    icon: <Activity className="w-4 h-4" />,
    description: '获取历史价格和成交量数据',
  },
  {
    key: 'calculate_technical',
    label: '计算技术指标',
    icon: <BarChart3 className="w-4 h-4" />,
    description: '计算均线、RSI、MACD 等指标',
  },
  {
    key: 'collect_financial',
    label: '采集财务数据',
    icon: <Database className="w-4 h-4" />,
    description: '获取财务报表和财务指标',
  },
  {
    key: 'collect_news',
    label: '采集新闻资讯',
    icon: <Activity className="w-4 h-4" />,
    description: '收集最新新闻和公告',
  },
  {
    key: 'ai_analysis',
    label: 'AI 分析中',
    icon: <Brain className="w-4 h-4" />,
    description: '多Agent AI 系统正在深度分析（预计 1-3 分钟）',
  },
  {
    key: 'ai_value',
    label: '价值分析',
    icon: <TrendingUp className="w-4 h-4" />,
    description: 'AI 正在评估股票的内在价值',
  },
  {
    key: 'ai_technical',
    label: '技术分析',
    icon: <BarChart3 className="w-4 h-4" />,
    description: '分析价格趋势和形态',
  },
  {
    key: 'ai_growth',
    label: '成长分析',
    icon: <TrendingUp className="w-4 h-4" />,
    description: '评估公司成长潜力',
  },
  {
    key: 'ai_risk',
    label: '风险评估',
    icon: <Shield className="w-4 h-4" />,
    description: '识别潜在风险因素',
  },
  {
    key: 'complete',
    label: '分析完成',
    icon: <Sparkles className="w-4 h-4" />,
    description: '生成最终分析报告',
  },
];

const STAGE_ORDER = STAGES.map((s) => s.key);

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}分${remainingSeconds}秒`
      : `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}小时${remainingMinutes}分`;
}

function getStageIndex(stage: string): number {
  const index = STAGE_ORDER.indexOf(stage);
  return index >= 0 ? index : -1;
}

function calculateETA(progress: number, elapsed: number): string {
  if (progress <= 0) return '计算中...';
  if (progress >= 100) return '即将完成';

  const estimatedTotal = (elapsed / progress) * 100;
  const remaining = estimatedTotal - elapsed;
  return formatDuration(Math.round(remaining));
}

export default function AnalysisProgress({
  progress,
  isRunning,
  hasError,
  error,
  symbol,
  onRetry,
  onCancel,
}: AnalysisProgressProps) {
  const [startTime] = useState<number>(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const prevStageRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  useEffect(() => {
    if (progress?.stage && progress.stage !== prevStageRef.current) {
      const index = getStageIndex(progress.stage);
      if (index >= 0) {
        prevStageRef.current = progress.stage;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentStageIndex(index);
      }
    }
  }, [progress?.stage]);

  if (hasError && error) {
    const isNetworkError = error.includes('网络') || error.includes('连接') || error.includes('timeout');
    const isRateLimitError = error.includes('频繁') || error.includes('429') || error.includes('Rate');

    return (
      <div className="glass-effect rounded-3xl p-8 card-hover">
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isNetworkError ? 'bg-yellow-500/20' : 'bg-red-500/20'
          }`}>
            <AlertCircle className={`w-8 h-8 ${isNetworkError ? 'text-yellow-400' : 'text-red-400'}`} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {isNetworkError ? '网络连接问题' : '分析出错'}
          </h3>
          <p className="text-white/60 mb-2 max-w-md">{error}</p>
          {isNetworkError && (
            <p className="text-sm text-yellow-400/80 mb-6">
              请检查网络连接后重试
            </p>
          )}
          {isRateLimitError && (
            <p className="text-sm text-yellow-400/80 mb-6">
              服务器繁忙，请稍后再试
            </p>
          )}
          <div className="flex flex-wrap gap-4 justify-center">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                重新分析
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
              >
                取消
              </button>
            )}
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 w-full">
            <p className="text-xs text-white/40">
              股票代码: {symbol} • 如果问题持续，请稍后重试
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isRunning || !progress) {
    return (
      <div className="space-y-6">
        <SkeletonCard showStats />
        <SkeletonChart showLegend />
      </div>
    );
  }

  const progressPercent = progress.progress || 0;
  const eta = calculateETA(progressPercent, elapsed);
  const isWaitingForServer = progress.isWaitingForServer;

  return (
    <div className="space-y-6">
      <div className="glass-effect rounded-3xl p-6 card-hover">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isWaitingForServer
                ? 'bg-yellow-500/20 animate-pulse'
                : 'bg-gradient-to-br from-blue-500 to-purple-600'
            }`}>
              {isWaitingForServer ? (
                <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin" />
              ) : (
                <Brain className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                AI 正在分析 {symbol}
              </h3>
              <p className={`text-sm ${
                isWaitingForServer ? 'text-yellow-400' : 'text-white/60'
              }`}>
                {progress.message || (isWaitingForServer ? '等待服务器响应...' : '准备中...')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isWaitingForServer ? (
              <div className="flex items-center gap-2 text-yellow-400">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm">等待响应</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-400">
                <Wifi className="w-4 h-4" />
                <span className="text-sm">已连接</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-white/60">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-mono">{formatDuration(elapsed)}</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/60">进度</span>
            <span className={`text-sm font-semibold ${
              isWaitingForServer ? 'text-yellow-400' : 'text-white'
            }`}>
              {progressPercent}%
            </span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isWaitingForServer
                  ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 animate-pulse'
                  : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {progressPercent < 100 && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className={`w-4 h-4 ${isWaitingForServer ? 'text-yellow-400' : 'text-white/60'}`} />
            <span className={isWaitingForServer ? 'text-yellow-400' : 'text-white/60'}>
              {isWaitingForServer ? '服务器繁忙，请耐心等待...' : `预计剩余时间: ${eta}`}
            </span>
          </div>
        )}
      </div>

      <div className="glass-effect rounded-3xl p-6 card-hover">
        <h4 className="text-sm font-semibold text-white/60 mb-4">分析阶段</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {STAGES.slice(0, 8).map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;

            return (
              <div
                key={stage.key}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-white/10 border border-white/20'
                    : isCompleted
                    ? 'bg-green-500/10'
                    : 'bg-white/5'
                }`}
              >
                <div
                  className={`flex-shrink-0 ${
                    isCompleted
                      ? 'text-green-400'
                      : isCurrent
                      ? 'text-blue-400'
                      : 'text-white/30'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isCurrent ? (
                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-medium truncate ${
                      isCompleted
                        ? 'text-green-400'
                        : isCurrent
                        ? 'text-white'
                        : 'text-white/40'
                    }`}
                  >
                    {stage.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {currentStageIndex >= 8 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {STAGES.slice(8).map((stage, index) => {
              const actualIndex = 8 + index;
              const isCompleted = actualIndex < currentStageIndex;
              const isCurrent = actualIndex === currentStageIndex;

              return (
                <div
                  key={stage.key}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-white/10 border border-white/20'
                      : isCompleted
                      ? 'bg-green-500/10'
                      : 'bg-white/5'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 ${
                      isCompleted
                        ? 'text-green-400'
                        : isCurrent
                        ? 'text-blue-400'
                        : 'text-white/30'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isCurrent ? (
                      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-medium truncate ${
                        isCompleted
                          ? 'text-green-400'
                          : isCurrent
                          ? 'text-white'
                          : 'text-white/40'
                      }`}
                    >
                      {stage.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonCard showStats={false} />
      <SkeletonChart showLegend />
    </div>
  );
}
