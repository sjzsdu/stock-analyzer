import { useState, useEffect, useRef, useCallback } from 'react';

export interface ProgressState {
  stage: string;
  progress: number;
  message: string;
  details?: Record<string, unknown>;
  elapsed_seconds?: number;
  result?: Record<string, unknown>;
  error?: string;
  isWaitingForServer?: boolean;
}

interface UseSSEProgressOptions {
  onComplete?: (result: Record<string, unknown>) => void;
  onError?: (error: string) => void;
  onProgress?: (state: ProgressState) => void;
  enabled?: boolean;
  heartbeatInterval?: number;
  maxHeartbeatWait?: number;
  maxReconnectAttempts?: number;
  initialReconnectDelay?: number;
}

interface UseSSEProgressReturn {
  progress: ProgressState | null;
  jobId: string | null;
  start: (symbol: string, market?: string) => Promise<void>;
  stop: () => void;
  isRunning: boolean;
  hasError: boolean;
  error: string | null;
}

const DEFAULT_HEARTBEAT_INTERVAL = 15000;
const DEFAULT_MAX_HEARTBEAT_WAIT = 30000;
const DEFAULT_MAX_RECONNECT_ATTEMPTS = 5;
const DEFAULT_INITIAL_RECONNECT_DELAY = 1000;

export function useSSEProgress(options: UseSSEProgressOptions = {}): UseSSEProgressReturn {
  const {
    onComplete,
    onError,
    onProgress,
    enabled = true,
    heartbeatInterval = DEFAULT_HEARTBEAT_INTERVAL,
    maxHeartbeatWait = DEFAULT_MAX_HEARTBEAT_WAIT,
    maxReconnectAttempts = DEFAULT_MAX_RECONNECT_ATTEMPTS,
    initialReconnectDelay = DEFAULT_INITIAL_RECONNECT_DELAY,
  } = options;

  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastProgressTimeRef = useRef<number>(Date.now());
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isManualStopRef = useRef<boolean>(false);

  const stop = useCallback(() => {
    isManualStopRef.current = true;
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsRunning(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const start = useCallback(async (symbol: string, market: string = "A") => {
    if (!enabled) return;

    stop();
    isManualStopRef.current = false;
    setHasError(false);
    setError(null);
    setProgress(null);
    lastProgressTimeRef.current = Date.now();

    try {
      const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';

      const response = await fetch(`${PYTHON_API_URL}/api/analyze/async`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, market }),
      });

      if (!response.ok) {
        throw new Error(`启动分析失败: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '启动分析失败');
      }

      const newJobId = result.job_id;
      setJobId(newJobId);
      setIsRunning(true);

      let reconnectCount = 0;

      const connectSSE = () => {
        if (isManualStopRef.current) return;

        const eventSource = new EventSource(`${PYTHON_API_URL}/api/analyze/stream/${newJobId}`);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log('[SSE] 连接已建立');
          reconnectCount = 0;
          reconnectAttemptsRef.current = 0;
          setProgress(prev => prev ? { ...prev, isWaitingForServer: false } : null);
        };

        eventSource.onmessage = (event) => {
          if (isManualStopRef.current) return;

          try {
            lastProgressTimeRef.current = Date.now();
            setProgress(prev => prev ? { ...prev, isWaitingForServer: false } : null);

            const sanitizedData = event.data.replace(/: NaN([,}])/g, ': null$1');
            const data = JSON.parse(sanitizedData);

            console.log('[SSE] Received data:', JSON.stringify(data, null, 2));

            if (data.error) {
              setHasError(true);
              setError(data.error);
              onError?.(data.error);
              stop();
              return;
            }

            if (data.stage === 'complete' && data.result) {
              console.log('[SSE] Analysis complete, result:', JSON.stringify(data.result, null, 2));
              const sanitizedResult = JSON.parse(JSON.stringify(data.result).replace(/: NaN([,}])/g, ': null$1'));
              setProgress({
                stage: 'complete',
                progress: 100,
                message: '分析完成!',
                result: sanitizedResult,
                isWaitingForServer: false,
              });
              onComplete?.(sanitizedResult);
              stop();
              return;
            }

            if (data.stage === 'error') {
              setHasError(true);
              setError(data.message || '分析失败');
              onError?.(data.message || '分析失败');
              stop();
              return;
            }

            const newProgress: ProgressState = {
              stage: data.stage || 'unknown',
              progress: data.progress || 0,
              message: data.message || '',
              details: data.details,
              elapsed_seconds: data.elapsed_seconds,
              isWaitingForServer: false,
            };

            setProgress(newProgress);
            onProgress?.(newProgress);
          } catch (parseError) {
            console.error('[SSE] 解析数据失败:', parseError);
            console.error('[SSE] 原始数据:', event.data);
          }
        };

        eventSource.onerror = (error) => {
          console.error('[SSE] 连接错误:', error);

          if (isManualStopRef.current) return;

          if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
            reconnectCount += 1;

            if (reconnectCount > maxReconnectAttempts) {
              setHasError(true);
              setError('连接多次失败，请稍后重试');
              onError?.('连接多次失败，请稍后重试');
              stop();
              return;
            }

            const delay = Math.min(initialReconnectDelay * Math.pow(2, reconnectCount - 1), 10000);
            console.log(`[SSE] 将在 ${delay}ms 后尝试重新连接 (${reconnectCount}/${maxReconnectAttempts})`);

            reconnectTimeoutRef.current = setTimeout(() => {
              if (!isManualStopRef.current) {
                connectSSE();
              }
            }, delay);
          }
        };
      };

      connectSSE();

      heartbeatTimerRef.current = setInterval(() => {
        if (isManualStopRef.current || !eventSourceRef.current) return;

        const now = Date.now();
        const timeSinceLastProgress = now - lastProgressTimeRef.current;

        if (timeSinceLastProgress > maxHeartbeatWait) {
          console.log('[SSE] 心跳超时，显示等待状态');

          setProgress(prev => {
            const currentProgress = prev?.progress || 0;
            return {
              stage: prev?.stage || 'waiting',
              progress: currentProgress,
              message: prev?.message || '等待服务器响应...',
              details: prev?.details,
              elapsed_seconds: prev?.elapsed_seconds,
              isWaitingForServer: true,
            };
          });

          if (eventSourceRef.current?.readyState === EventSource.OPEN) {
            console.log('[SSE] 连接打开但无响应，可能服务器繁忙');
          }
        } else if (timeSinceLastProgress > heartbeatInterval && eventSourceRef.current?.readyState === EventSource.OPEN) {
          console.log('[SSE] 发送心跳检测...');
          lastProgressTimeRef.current = now;
        }
      }, heartbeatInterval);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '启动分析失败';
      setHasError(true);
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [enabled, stop, onComplete, onError, onProgress, heartbeatInterval, maxHeartbeatWait, maxReconnectAttempts, initialReconnectDelay]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    progress,
    jobId,
    start,
    stop,
    isRunning,
    hasError,
    error,
  };
}
