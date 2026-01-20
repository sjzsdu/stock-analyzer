'use client';
import { useEffect, useState, use, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Clock, Home, Search, RefreshCw, BarChart3, Check, AlertCircle, Brain } from 'lucide-react';
import StockKLineChart from '@/components/StockKLineChart';
import StockOverviewCard from '@/components/StockOverviewCard';
import AnalysisSummary from '@/components/AnalysisSummary';
import AnalystRadarChart from '@/components/AnalystRadarChart';
import RiskOpportunityCard from '@/components/RiskOpportunityCard';
import EnhancedAnalysisReport from '@/components/analysis/EnhancedAnalysisReport';
import TechnicalIndicators from '@/components/stock/TechnicalIndicators';
import NewsFeed from '@/components/stock/NewsFeed';
import DataQualityIndicator from '@/components/stock/DataQualityIndicator';

const roleNames: Record<string, string> = {
  value: '价值投资者',
  technical: '技术分析师',
  growth: '成长股分析师',
  fundamental: '基本面分析师',
  risk: '风险分析师',
  macro: '宏观分析师'
};

const roleColors: Record<string, string> = {
  value: 'from-blue-500 to-blue-600',
  technical: 'from-purple-500 to-purple-600',
  growth: 'from-green-500 to-green-600',
  fundamental: 'from-orange-500 to-orange-600',
  risk: 'from-red-500 to-red-600',
  macro: 'from-cyan-500 to-cyan-600'
};

export default function AnalyzePage({ params }: { params: Promise<{ symbol: string }> }) {
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [ageHours, setAgeHours] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<{ stage: string; progress: number; message: string } | null>(null);

  const symbol = decodeURIComponent(resolvedParams.symbol);
  const searchParams = useSearchParams();
  const analysisDate = searchParams.get('date');

  const analysisDateRef = useRef(analysisDate);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    analysisDateRef.current = analysisDate;
  }, [analysisDate]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const startAnalysis = useCallback(async () => {
    stopPolling();
    setLoading(true);
    setError('');
    setIsExpired(false);
    setData(null);
    setIsAnalyzing(true);
    setProgress({ stage: 'starting', progress: 0, message: '正在启动分析...' });

    try {
      const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';

      // 启动异步分析
      const response = await fetch(`${PYTHON_API_URL}/api/analyze/async`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, market: 'A' }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`启动分析失败: ${response.statusText} - ${errText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '启动分析失败');
      }

      const jobId = result.job_id;
      setProgress({ stage: 'started', progress: 5, message: '正在初始化分析任务...' });

      // 开始轮询进度
      pollIntervalRef.current = setInterval(async () => {
        try {
          const progressResponse = await fetch(`${PYTHON_API_URL}/api/analyze/progress/${jobId}`);
          
          if (!progressResponse.ok) {
            throw new Error('获取进度失败');
          }

           const progressData = await progressResponse.json();

           console.log('[分析] 进度更新:', progressData);

           // 检查返回数据是否有效
           if (!progressData || typeof progressData !== 'object') {
             console.log('[分析] 无效的进度数据，停止轮询');
             stopPolling();
             setError('获取进度失败，请稍后重试');
             setLoading(false);
             setIsAnalyzing(false);
             return;
           }

           if (progressData.error) {
             stopPolling();
             setError(progressData.error);
             setLoading(false);
             setIsAnalyzing(false);
             return;
           }

          // 更新进度
          setProgress({
            stage: progressData.stage || 'unknown',
            progress: progressData.progress || 0,
            message: progressData.message || '处理中...'
          });

          // 检查是否完成
          if (progressData.status === 'completed') {
            stopPolling();
            
            // 打印完整数据结构用于调试
            console.log('[分析] 完整 progressData 结构:');
            for (const key in progressData) {
              const val = progressData[key];
              const valStr = typeof val === 'object' ? JSON.stringify(val).substring(0, 150) : val;
              console.log(`  ${key}: ${typeof val} = ${valStr}`);
            }
            
            // result 可能在 job.result 中，或者直接在 job 中
            const resultData = progressData.result || progressData;
            
            console.log('[分析] resultData 结构:');
            if (resultData) {
              for (const key in resultData) {
                const val = resultData[key];
                const valStr = typeof val === 'object' ? JSON.stringify(val).substring(0, 150) : val;
                console.log(`  ${key}: ${typeof val} = ${valStr}`);
              }
            } else {
              console.log('  resultData is null or undefined');
            }
            
            // 处理两种数据格式: agentResults 或 roleAnalysis
            const hasAgentResults = resultData?.agentResults && resultData.agentResults.length > 0;
            const hasRoleAnalysis = resultData?.roleAnalysis && resultData.roleAnalysis.length > 0;
            const hasOverallScore = resultData?.overallScore !== undefined && resultData?.overallScore !== null;
            
            console.log('[分析] hasAgentResults:', hasAgentResults);
            console.log('[分析] hasRoleAnalysis:', hasRoleAnalysis);
            console.log('[分析] hasOverallScore:', hasOverallScore, '(value:', resultData?.overallScore, ')');

            // 放宽检查条件：如果有数据就显示
            if (resultData && (hasOverallScore || hasAgentResults || hasRoleAnalysis || resultData.basic)) {
              console.log('[分析] 设置数据成功');
              setData(resultData);
            } else {
              console.log('[分析] 未找到有效的分析结果，progressData:', progressData);
              setError('分析完成但没有返回有效结果');
            }
            setLoading(false);
            setIsAnalyzing(false);
          }
          // 检查是否失败
          else if (progressData?.status === 'failed' || progressData?.status === 'error') {
            stopPolling();
            // Safely handle potential null/undefined values
            const errorMsg = progressData?.message || progressData?.error || progressData?.details || '分析失败，请稍后重试';
            setError(errorMsg);
            setLoading(false);
            setIsAnalyzing(false);
          }
          // 处理意外的 status 值
          else if (progressData?.status && !['pending', 'running', 'completed', 'failed', 'error'].includes(progressData.status)) {
            console.log('[分析] 未知的状态:', progressData.status);
            // 不一定是错误，可能是中间状态，继续等待
          }

        } catch (err) {
          console.error('轮询进度失败:', err);
        }
      }, 2000); // 每2秒轮询一次

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '启动分析失败';
      setError(errorMessage);
      setLoading(false);
      setIsAnalyzing(false);
    }
  }, [symbol, stopPolling]);

  const fetchExistingAnalysis = useCallback(async () => {
    stopPolling();
    setLoading(true);
    setError('');
    setIsAnalyzing(false);
    setProgress(null);

    try {
      const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';

      // 首先检查后端服务是否可用
      console.log('检查后端服务状态...');
      const healthResponse = await fetch(`${PYTHON_API_URL}/health`);
      if (!healthResponse.ok) {
        setError('后端服务不可用，请确保 Python 服务已启动。');
        setLoading(false);
        return;
      }

      const currentAnalysisDate = analysisDateRef.current;
      
      let apiUrl = `/api/analysis/history/${symbol}`;
      if (currentAnalysisDate) {
        apiUrl += `?date=${encodeURIComponent(currentAnalysisDate)}`;
      }

      const response = await fetch(apiUrl);
      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
        setIsExpired(result.expired || false);
        setAgeHours(result.ageHours || 0);
        
        if (result.expired) {
          console.log('数据已过期，自动重新分析...');
          await startAnalysis();
          return;
        }
        
        setLoading(false);
        return;
      }

      console.log('没有历史记录，自动开始分析...');
      await startAnalysis();

    } catch (err) {
      console.error('获取历史记录失败:', err);
      console.log('获取历史记录失败，自动开始分析...');
      await startAnalysis();
    }
  }, [symbol, startAnalysis, stopPolling]);

  useEffect(() => {
    let mounted = true;
    const runFetch = async () => {
      if (mounted) {
        await fetchExistingAnalysis();
      }
    };
    runFetch();
    return () => {
      mounted = false;
      stopPolling();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  // 加载中状态
  if (loading && (isAnalyzing || progress)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1a2332] text-white">
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="glass-effect rounded-3xl p-8 card-hover max-w-2xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                AI 正在分析 {symbol}
              </h3>
              <p className="text-white/60 mb-6">
                {progress?.message || '正在处理...'}
              </p>
              
              <div className="w-full max-w-md mb-6">
                <div className="flex justify-between text-sm text-white/60 mb-2">
                  <span>进度</span>
                  <span>{progress?.progress || 0}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress?.progress || 0}%` }}
                  />
                </div>
              </div>

              {/* Agent 进度显示 */}
              {isAnalyzing && (
                <div className="w-full max-w-md bg-white/5 rounded-xl p-4 mb-4">
                  <p className="text-xs text-white/40 mb-3 text-left">AI Agent 执行状态:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {['价值分析', '技术分析', '成长分析', '基本面', '风险评估', '宏观分析'].map((name, idx) => (
                      <div key={name} className="flex items-center gap-2 text-left">
                        <div className={`w-2 h-2 rounded-full ${
                          (progress?.progress || 0) > (idx + 1) * 15 ? 'bg-green-400' : 'bg-white/20'
                        }`} />
                        <span className={`${(progress?.progress || 0) > (idx + 1) * 15 ? 'text-green-400' : 'text-white/40'}`}>
                          {name}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-left col-span-2">
                      <div className={`w-2 h-2 rounded-full ${
                        (progress?.progress || 0) >= 95 ? 'bg-green-400' : 'bg-white/20'
                      }`} />
                      <span className={`${(progress?.progress || 0) >= 95 ? 'text-green-400' : 'text-white/40'}`}>
                        综合分析
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm text-white/40">
                AI 分析预计需要 20-60 秒，请耐心等待...
              </p>

              <button
                onClick={() => {
                  stopPolling();
                  setLoading(false);
                  setIsAnalyzing(false);
                }}
                className="mt-6 px-6 py-2 bg-white/10 text-white/60 font-medium rounded-xl border border-white/20 hover:bg-white/20 hover:text-white transition-all"
              >
                取消分析
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error && !data) {
    const isApiKeyError = error.includes('DEEPSEEK_API_KEY') || error.includes('API key');
    const isServiceError = error.includes('服务不可用') || error.includes('服务未启动') || error.includes('Failed to fetch');
    const isMongoError = error.includes('MongoDB') || error.includes('数据库');

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1a2332] text-white flex items-center justify-center relative">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="text-center max-w-3xl glass-effect rounded-3xl p-12 shadow-2xl relative z-10 mx-4">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg bg-gradient-to-br from-red-500 to-orange-600">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            {isServiceError ? '服务未启动' : '分析失败'}
          </h2>

          <div className="bg-white/5 rounded-xl p-6 mb-6 text-left">
            <p className="text-white/80 text-sm mb-2">错误信息：</p>
            <pre className="text-red-400 text-xs font-mono whitespace-pre-wrap break-all bg-black/20 rounded-lg p-4 max-h-48 overflow-auto">
              {error}
            </pre>
          </div>

          {isServiceError && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-6 text-left">
              <h3 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">⚠️ 服务启动检查</span>
              </h3>
              <p className="text-white/80 text-sm mb-4">
                后端服务未启动，请启动以下服务后再试：
              </p>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-xs text-yellow-300 space-y-3">
                <div>
                  <p className="font-semibold text-yellow-400 mb-1">1. 启动 MongoDB（数据库）：</p>
                  <p className="ml-2">brew services start mongodb-community</p>
                </div>
                <div>
                  <p className="font-semibold text-yellow-400 mb-1">2. 启动 Python 后端：</p>
                  <p className="ml-2">cd python-service && python main.py</p>
                  <p className="ml-2 text-white/50">或 pnpm dev:be</p>
                </div>
                <div>
                  <p className="font-semibold text-yellow-400 mb-1">3. 启动 Next.js 前端：</p>
                  <p className="ml-2">pnpm dev:fe</p>
                </div>
              </div>
            </div>
          )}

          {isApiKeyError && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6 text-left">
              <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">AI服务配置</span>
              </h3>
              <p className="text-white/80 text-sm mb-4">
                系统需要配置 DeepSeek API Key 才能进行 AI 分析。
              </p>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-xs text-blue-300 space-y-2">
                <p>1. 申请 API Key: <a href="https://platform.deepseek.com/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">https://platform.deepseek.com/</a></p>
                <p>2. 编辑文件: <code className="text-yellow-400">python-service/.env</code></p>
                <p>3. 设置: <code className="text-yellow-400">DEEPSEEK_API_KEY=sk-xxx</code></p>
                <p>4. 重启 Python 服务</p>
              </div>
            </div>
          )}

          {isMongoError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-6 text-left">
              <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">数据库连接失败</span>
              </h3>
              <p className="text-white/80 text-sm mb-4">
                MongoDB 数据库未启动或连接失败。
              </p>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-xs text-red-300 space-y-2">
                <p>启动 MongoDB:</p>
                <p className="ml-2">brew services start mongodb-community</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button
              onClick={startAnalysis}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold transition-all button-hover flex items-center justify-center gap-3 shadow-lg shadow-purple-500/25 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  AI分析中...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  重新分析
                </>
              )}
            </button>
            <Link href="/" className="text-white/60 hover:text-white transition-colors flex items-center justify-center gap-2 py-3">
              <Home className="w-5 h-5" />
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 没有数据且不在分析中
  if (!data && !isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1a2332] text-white">
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="glass-effect rounded-3xl p-8 card-hover">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">准备开始 AI 分析</h3>
              <p className="text-white/60 mb-6">点击下方按钮开始对股票 {symbol} 的深度 AI 分析</p>
              <button
                onClick={startAnalysis}
                disabled={isAnalyzing}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? '分析中...' : '开始分析'}
              </button>
              <p className="text-white/40 text-sm mt-4">
                分析可能需要 1-2 分钟，请耐心等待
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const calculateRealtimeData = () => {
    const klineData = data?.kline || data?.klineData || [];
    
    if (!Array.isArray(klineData) || klineData.length === 0) {
      return {
        currentPrice: 0,
        changePercent: 0,
        changeAmount: 0,
        previousClose: 0,
        volume: 0,
        turnover: 0,
        high52w: 0,
        low52w: 0
      };
    }

    const latest = klineData[klineData.length - 1];
    const previous = klineData[klineData.length - 2] || latest;

    const getClosePrice = (item: any) => {
      if (typeof item === 'object' && item !== null) {
        return Number(item.close) || Number(item[4]) || Number(item[2]) || 0;
      } else if (Array.isArray(item)) {
        return Number(item[4]) || Number(item[2]) || 0;
      }
      return 0;
    };

    const getVolume = (item: any) => {
      if (typeof item === 'object' && item !== null) {
        return Number(item.volume) || Number(item[5]) || 0;
      } else if (Array.isArray(item)) {
        return Number(item[5]) || 0;
      }
      return 0;
    };

    const getTurnover = (item: any) => {
      if (typeof item === 'object' && item !== null) {
        return Number(item.turnover) || Number(item[6]) || 0;
      } else if (Array.isArray(item)) {
        return Number(item[6]) || 0;
      }
      return 0;
    };

    const prices = klineData.map(getClosePrice).filter((p): p is number => !isNaN(p) && p > 0);
    const high52w = prices.length > 0 ? Math.max(...prices) : 0;
    const low52w = prices.length > 0 ? Math.min(...prices) : 0;

    const latestClose = getClosePrice(latest);
    const previousClose = getClosePrice(previous);

    return {
      currentPrice: latestClose,
      changePercent: previousClose ? ((latestClose - previousClose) / previousClose) * 100 : 0,
      changeAmount: previousClose ? (latestClose - previousClose) : 0,
      previousClose,
      volume: getVolume(latest),
      turnover: getTurnover(latest),
      high52w,
      low52w
    };
  };

  const realtimeData = calculateRealtimeData();
    
  interface AgentResult {
    agent?: string;
    role?: string;
    score: number;
  }
  const agentResults = data.agentResults as AgentResult[] | undefined;
  const roleAnalysis = data.roleAnalysis as AgentResult[] | undefined;
  interface Scores { value: number; technical: number; growth: number; fundamental: number; risk: number; macro: number; }
  const scores: Scores = agentResults ? {
    value: agentResults.find((a) => a.agent === 'value')?.score || 0,
    technical: agentResults.find((a) => a.agent === 'technical')?.score || 0,
    growth: agentResults.find((a) => a.agent === 'growth')?.score || 0,
    fundamental: agentResults.find((a) => a.agent === 'fundamental')?.score || 0,
    risk: agentResults.find((a) => a.agent === 'risk')?.score || 0,
    macro: agentResults.find((a) => a.agent === 'macro')?.score || 0
  } : {
    value: roleAnalysis?.find((a) => a.role === 'value')?.score || 0,
    technical: roleAnalysis?.find((a) => a.role === 'technical')?.score || 0,
    growth: roleAnalysis?.find((a) => a.role === 'growth')?.score || 0,
    fundamental: roleAnalysis?.find((a) => a.role === 'fundamental')?.score || 0,
    risk: roleAnalysis?.find((a) => a.role === 'risk')?.score || 0,
    macro: roleAnalysis?.find((a) => a.role === 'macro')?.score || 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1a2332] text-white relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <nav className="glass-effect sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-white hover:text-purple-300 transition-all duration-300 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">股票智能分析</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={startAnalysis}
              disabled={loading || isAnalyzing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || isAnalyzing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{isAnalyzing ? '分析中...' : '重新分析'}</span>
            </button>
            <Link
              href="/"
              className="text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 p-3 rounded-xl flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">返回首页</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2">
            <StockOverviewCard
              basic={{
                name: (data.basic as any)?.name || data.stockName || (data.stockBasic as any)?.name,
                symbol: (data.basic as any)?.symbol || (data.stockBasic as any)?.symbol || symbol,
                market: (data.basic as any)?.market || (data.stockBasic as any)?.market,
                industry: (data.basic as any)?.industry || (data.stockBasic as any)?.industry
              }}
              currentPrice={(data.basic as any)?.current_price || realtimeData.currentPrice}
              changePercent={realtimeData.changePercent}
              changeAmount={realtimeData.changeAmount}
              previousClose={realtimeData.previousClose}
              volume={(data.basic as any)?.volume || realtimeData.volume}
              turnover={(data.basic as any)?.turnover || realtimeData.turnover}
              marketCap={(data.basic as any)?.market_cap || (data.stockBasic as any)?.marketCap || '--'}
              circulatingCap={(data.basic as any)?.circulating_market_cap || (data.basic as any)?.market_cap || (data.stockBasic as any)?.circulatingCap || (data.stockBasic as any)?.marketCap || '--'}
              pe={(data.basic as any)?.pe_ratio || (data.financial as any)?.pe_ratio || (data.stockBasic as any)?.pe || (data.stockBasic as any)?.peRatio || (data.stockBasic as any)?.forwardPE || (data.stockBasic as any)?.trailingPE || 0}
              pb={(data.basic as any)?.pb_ratio || (data.financial as any)?.pb_ratio || (data.stockBasic as any)?.pb || (data.stockBasic as any)?.pbRatio || (data.stockBasic as any)?.priceToBook || 0}
              dividend={(data.basic as any)?.dividend_yield || (data.financial as any)?.dividend_yield || (data.stockBasic as any)?.dividend || (data.stockBasic as any)?.dividendYield || 0}
              roe={(data.financial as any)?.roe || (data.basic as any)?.returnOnEquity || (data.stockBasic as any)?.roe || (data.stockBasic as any)?.returnOnEquity || 0}
              high52w={(data.basic as any)?.week_52_high || realtimeData.high52w}
              low52w={(data.basic as any)?.week_52_low || realtimeData.low52w}
              latestNews={Array.isArray(data.news) ? data.news.map((news: { title?: string; content?: string } | string) => 
                typeof news === 'string' ? news : 
                news.title || news.content || ''
              ).filter(Boolean) : 
              Array.isArray((data.stockBasic as any)?.latestNews) ? (data.stockBasic as any).latestNews.map((news: { title?: string; content?: string } | string) => 
                typeof news === 'string' ? news : 
                news.title || news.content || ''
              ).filter(Boolean) : 
              []}
              technicalIndicators={data.technical ? {
                rsi: (data.technical as any).rsi,
                macd: (data.technical as any).macd,
                macd_signal: (data.technical as any).macd_signal,
                bollinger_upper: (data.technical as any).bollinger_upper,
                bollinger_lower: (data.technical as any).bollinger_lower,
                ma_5: (data.technical as any).ma_5,
                ma_20: (data.technical as any).ma_20
              } : undefined}
            />
          </div>

          <div className="glass-effect rounded-3xl p-6 card-hover flex flex-col justify-center">
            <div className="text-center mb-6">
              <h3 className="text-white/60 text-sm mb-2">综合评分</h3>
              <div className="text-7xl font-bold gradient-text">
                {(data.overallScore as number) ? (data.overallScore as number).toFixed(1) : '--'}
              </div>
            </div>

            <div className="text-center mb-6">
              <span className={`inline-block px-8 py-4 rounded-full text-white font-bold text-xl shadow-lg ${
                data.recommendation === 'strong_buy' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                data.recommendation === 'buy' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                data.recommendation === 'hold' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                data.recommendation === 'wait' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                data.recommendation === 'sell' ? 'bg-gradient-to-r from-red-500 to-red-700' :
                'bg-gradient-to-r from-gray-500 to-gray-600'
              }`}>
                {data.recommendation === 'strong_buy' ? '强烈买入' :
                 data.recommendation === 'buy' ? '买入' :
                 data.recommendation === 'hold' ? '持有' :
                 data.recommendation === 'wait' ? '观望' : 
                 data.recommendation === 'sell' ? '卖出' : (data.overallScore ? '待分析' : '暂无评分')}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60 text-sm">置信度</span>
                  <span className="font-semibold text-white">{Number(data.confidenceScore || data.confidence || 0).toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Number(data.confidenceScore || data.confidence || 0)}%` }}
                  ></div>
                </div>
              </div>

              {isExpired && (
                <div className="flex items-center justify-center gap-2 text-sm text-yellow-400 bg-yellow-500/10 backdrop-blur-sm py-2 rounded-lg border border-yellow-500/20 mb-3">
                  <AlertTriangle className="w-4 h-4" />
                  <span>数据已过期（{ageHours}小时前），建议重新分析</span>
                </div>
              )}
              
              {!!data.cached && !isExpired && (
                <div className="flex items-center justify-center gap-2 text-sm text-green-400 bg-green-500/10 backdrop-blur-sm py-2 rounded-lg border border-green-500/20 mb-3">
                  <Check className="w-4 h-4" />
                  <span>使用缓存数据（{ageHours}小时前）</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-white/50 pt-4 border-t border-white/10">
                <span>分析模型</span>
                <span className="font-medium text-white/80">{data.model as string}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-white/50">
                <span>处理耗时</span>
                <span className="font-medium text-white/80">{(data.processingTime as number)?.toFixed(1) || '--'}秒</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <AnalystRadarChart
            scores={scores}
            overallScore={(data.overallScore as number) || 0}
            confidence={(data.confidenceScore || data.confidence || 0) as number}
          />

          <div className="glass-effect rounded-2xl overflow-hidden card-hover">
            <StockKLineChart
              data={(data.kline || data.klineData) as any}
              symbol={(data.basic as any)?.symbol || (data.stockBasic as any)?.symbol || symbol}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {!!data.technical && (
            <TechnicalIndicators
              data={data.technical as any}
              currentPrice={(data.basic as any)?.current_price || realtimeData.currentPrice}
              symbol={(data.basic as any)?.symbol || symbol}
            />
          )}

          {!!data.financial && (
            <div className="glass-effect rounded-3xl overflow-hidden card-hover">
              <div className="px-6 py-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">财</span>
                  </div>
                  财务指标分析
                </h3>
                <p className="text-white/60 text-sm mt-1">{(data.basic as any)?.symbol || symbol}</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-white/90 font-medium mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      盈利能力
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">ROE</span>
                        <span className="text-white/90">{(data.financial as any)?.roe ? `${(data.financial as any).roe.toFixed(2)}%` : '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">净利率</span>
                        <span className="text-white/90">{(data.financial as any)?.net_profit_margin ? `${(data.financial as any).net_profit_margin.toFixed(2)}%` : '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">毛利率</span>
                        <span className="text-white/90">{(data.financial as any)?.gross_profit_margin ? `${(data.financial as any).gross_profit_margin.toFixed(2)}%` : '--'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-white/90 font-medium mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      成长能力
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">营收增长</span>
                        <span className="text-white/90">{(data.financial as any)?.revenue_growth ? `${(data.financial as any).revenue_growth.toFixed(2)}%` : '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">利润增长</span>
                        <span className="text-white/90">{(data.financial as any)?.net_profit_growth ? `${(data.financial as any).net_profit_growth.toFixed(2)}%` : '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">流动比率</span>
                        <span className="text-white/90">{(data.financial as any)?.current_ratio ? (data.financial as any).current_ratio.toFixed(2) : '--'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!!(data.news as any[])?.length && (
          <div className="mb-8">
            <NewsFeed
              news={data.news as any}
              symbol={(data.basic as any)?.symbol || symbol}
              maxItems={8}
            />
          </div>
        )}

        <div className="mb-8">
          <AnalysisSummary content={data.summary as string} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {!!(data.risks as string[])?.length && (
            (data.risks as string[]).map((risk, idx) => (
              <RiskOpportunityCard
                key={`risk-${idx}`}
                type="risk"
                title={`风险${idx + 1}：${risk.split('：')[0] || '风险因素'}`}
                description={risk.split('：')[1] || risk}
                dataPoints={[]}
                impact={{
                  severity: idx === 0 ? 'high' : idx === 1 ? 'medium' : 'low',
                  confidence: idx === 0 ? 85 : idx === 1 ? 75 : 65,
                  timeframe: 'medium',
                  controllability: 'medium'
                }}
                suggestion={idx === 0 
                  ? '建议密切关注相关动态，设置合理的止损位。'
                  : '保持关注，但不必过度担忧。'}
              />
            ))
          )}

          {!!(data.opportunities as string[])?.length && (
            (data.opportunities as string[]).map((opp, idx) => (
              <RiskOpportunityCard
                key={`opp-${idx}`}
                type="opportunity"
                title={`机会${idx + 1}：${opp.split('：')[0] || '增长机会'}`}
                description={opp.split('：')[1] || opp}
                dataPoints={[]}
                impact={{
                  confidence: idx === 0 ? 88 : 78,
                  timeframe: idx === 0 ? 'long' : 'medium',
                  controllability: 'high'
                }}
                suggestion={idx === 0 
                  ? '这是当前最主要的投资亮点，建议重点关注。'
                  : '可以作为仓位配置的加分项。'}
              />
            ))
          )}
        </div>

        <div className="glass-effect rounded-3xl p-8 mb-8 card-hover">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            多角色深度分析
          </h2>

          {!!(data.agentResults as any[])?.length ? (
            <EnhancedAnalysisReport
              agentResults={data.agentResults as any}
              overallScore={(data.overallScore as number) || 0}
              recommendation={(data.recommendation as string) || 'hold'}
              confidenceScore={(data.confidenceScore || data.confidence || 0) as number}
              keyFactors={(data.keyFactors as string[]) || []}
              symbol={symbol}
              stockName={(data.stockName as string) || symbol}
            />
          ) : (
            <div className="space-y-4">
              {(data.roleAnalysis as any[])?.map((role: { role: string; score: number }) => (
                <div key={role.role} className="border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 shadow-sm hover:shadow-lg">
                  <div
                    className="p-5 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-2 rounded-full text-white text-sm font-bold bg-gradient-to-r ${roleColors[role.role]} shadow-md`}>
                        {roleNames[role.role]}
                      </span>
                      <div>
                        <span className="text-white/60 mr-3">评分</span>
                        <span className={`text-2xl font-bold ${
                          role.score >= 80 ? 'text-green-400' :
                          role.score >= 60 ? 'text-yellow-400' :
                          role.score >= 40 ? 'text-orange-400' : 'text-red-400'
                        }`}>
                          {role.score}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-8">
          <DataQualityIndicator
            data={{
              timestamp: data.timestamp as string,
              data_source: data.data_source as string,
              symbol: (data.basic as any)?.symbol || data.symbol as string,
              market: (data.basic as any)?.market || data.market as string,
              has_basic: !!data.basic,
              has_kline: !!(data.kline && (data.kline as any[]).length > 0),
              has_technical: !!data.technical,
              has_financial: !!data.financial,
              has_news: !!(data.news && (data.news as any[]).length > 0),
              quality_score: Math.round(
                ((data.basic ? 20 : 0) +
                 ((data.kline && (data.kline as any[]).length > 0) ? 20 : 0) +
                 (data.technical ? 20 : 0) +
                 (data.financial ? 20 : 0) +
                 ((data.news && (data.news as any[]).length > 0) ? 20 : 0))
              )
            }}
          />
        </div>

        <div className="text-center glass-effect rounded-2xl p-6 mb-8 border border-white/10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-white/40" />
            <span className="text-white/60 text-sm">分析时间：{new Date().toLocaleString('zh-CN')}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm mb-1">分析模型</div>
              <div className="text-white font-semibold">{data.model as string}</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm mb-1">Token使用</div>
              <div className="text-white font-semibold">
                输入 {(data.tokenUsage as any)?.input?.toLocaleString()} / 输出 {(data.tokenUsage as any)?.output?.toLocaleString()}
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm mb-1">处理耗时</div>
              <div className="text-white font-semibold">{(data.processingTime as number)?.toFixed(1) || '--'}秒</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-white/40">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></div>
            <span>© {new Date().getFullYear()} 股票智能分析系统 | AI驱动的多维度投资决策支持</span>
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
