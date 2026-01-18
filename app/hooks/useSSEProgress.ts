import { useState, useEffect, useRef, useCallback } from 'react';

export interface ProgressState {
  stage: string;
  progress: number;
  message: string;
  details?: Record<string, unknown>;
  elapsed_seconds?: number;
  result?: Record<string, unknown>;
  error?: string;
}

interface UseSSEProgressOptions {
  onComplete?: (result: Record<string, unknown>) => void;
  onError?: (error: string) => void;
  onProgress?: (state: ProgressState) => void;
  enabled?: boolean;
}

interface UseSSEProgressReturn {
  progress: ProgressState | null;
  jobId: string | null;
  start: (symbol: string, market: string) => Promise<void>;
  stop: () => void;
  isRunning: boolean;
  hasError: boolean;
  error: string | null;
}

export function useSSEProgress(options: UseSSEProgressOptions = {}): UseSSEProgressReturn {
  const { onComplete, onError, onProgress, enabled = true } = options;

  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback(async (symbol: string, market: string) => {
    if (!enabled) return;

    stop();
    setHasError(false);
    setError(null);
    setProgress(null);

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

      const eventSource = new EventSource(`${PYTHON_API_URL}/api/analyze/stream/${newJobId}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('[SSE] 连接已建立');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.error) {
            setHasError(true);
            setError(data.error);
            onError?.(data.error);
            stop();
            return;
          }

          if (data.stage === 'complete' && data.result) {
            setProgress({
              stage: 'complete',
              progress: 100,
              message: '分析完成!',
              result: data.result,
            });
            onComplete?.(data.result);
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
          };

          setProgress(newProgress);
          onProgress?.(newProgress);
        } catch (parseError) {
          console.error('[SSE] 解析数据失败:', parseError);
        }
      };

      eventSource.onerror = (error) => {
        console.error('[SSE] 连接错误:', error);
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          setHasError(true);
          setError('连接已断开');
          onError?.('连接已断开');
        }
        stop();
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '启动分析失败';
      setHasError(true);
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [enabled, stop, onComplete, onError, onProgress]);

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
