'use client';
import { useEffect, useState, use, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Clock, Home, Search, RefreshCw, BarChart3, Lightbulb, BrainCircuit, Check, Zap, Database, TrendingUp, AlertCircle, Sparkles, Globe } from 'lucide-react';
import StockKLineChart from '@/components/StockKLineChart';
import StockOverviewCard from '@/components/StockOverviewCard';
import AnalysisSummary from '@/components/AnalysisSummary';
import AnalystRadarChart from '@/components/AnalystRadarChart';
import RiskOpportunityCard from '@/components/RiskOpportunityCard';
import EnhancedAnalysisReport from '@/components/analysis/EnhancedAnalysisReport';
import TechnicalIndicators from '@/components/stock/TechnicalIndicators';
import NewsFeed from '@/components/stock/NewsFeed';
import DataQualityIndicator from '@/components/stock/DataQualityIndicator';
import { useSSEProgress } from '@/app/hooks/useSSEProgress';

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

const STAGE_CONFIG: Record<string, { icon: typeof Zap; label: string; color: string }> = {
  starting: { icon: Zap, label: '启动分析', color: 'text-yellow-400' },
  check_cache: { icon: Database, label: '检查缓存', color: 'text-blue-400' },
  collect_basic: { icon: Database, label: '采集基本信息', color: 'text-blue-400' },
  collect_kline: { icon: TrendingUp, label: '采集K线数据', color: 'text-purple-400' },
  calculate_technical: { icon: TrendingUp, label: '计算技术指标', color: 'text-purple-400' },
  collect_financial: { icon: Database, label: '采集财务数据', color: 'text-green-400' },
  collect_news: { icon: Database, label: '采集新闻资讯', color: 'text-cyan-400' },
  ai_analysis: { icon: BrainCircuit, label: 'AI智能分析', color: 'text-pink-400' },
  ai_value: { icon: Lightbulb, label: '价值分析', color: 'text-yellow-400' },
  ai_technical: { icon: TrendingUp, label: '技术分析', color: 'text-purple-400' },
  ai_growth: { icon: TrendingUp, label: '成长分析', color: 'text-green-400' },
  ai_fundamental: { icon: BarChart3, label: '基本面分析', color: 'text-orange-400' },
  ai_risk: { icon: AlertCircle, label: '风险评估', color: 'text-red-400' },
  ai_macro: { icon: Globe, label: '宏观分析', color: 'text-cyan-400' },
  synthesize: { icon: Sparkles, label: '综合研判', color: 'text-pink-400' },
  complete: { icon: Check, label: '分析完成', color: 'text-green-400' },
  error: { icon: AlertTriangle, label: '分析错误', color: 'text-red-400' },
};

export default function AnalyzePage({ params }: { params: Promise<{ symbol: string }> }) {
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [ageHours, setAgeHours] = useState(0);
  const [isAnalyzingResult, setIsAnalyzingResult] = useState(false);

  const symbol = decodeURIComponent(resolvedParams.symbol);
  const searchParams = useSearchParams();
  const analysisDate = searchParams.get('date');

  // 使用 ref 存储最新的 analysisDate，避免 useEffect 依赖循环
  const analysisDateRef = useRef(analysisDate);

  useEffect(() => {
    analysisDateRef.current = analysisDate;
  }, [analysisDate]);

  const {
    progress,
    start: startAnalysis,
    stop: stopAnalysis,
    isRunning: isAnalyzing,
    hasError: hasProgressError,
    error: progressError
  } = useSSEProgress({
    onComplete: (result) => {
      setData(result);
      setLoading(false);
      setIsAnalyzingResult(false);
    },
    onError: (err) => {
      setError(err);
      setLoading(false);
      setIsAnalyzingResult(false);
    }
  });

  const startSSEAnalysis = useCallback(async () => {
    setLoading(true);
    setError('');
    setIsExpired(false);
    setData(null);
    setIsAnalyzingResult(true);

    await startAnalysis(symbol);
  }, [symbol, startAnalysis]);

  const fetchExistingAnalysis = useCallback(async () => {
    setLoading(true);
    setError('');
    setIsAnalyzingResult(false);

    try {
      // 使用 ref 获取最新的 analysisDate
      const currentAnalysisDate = analysisDateRef.current;
      
      // 构建请求 URL，包含日期参数
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
        
        // 如果数据过期，自动重新分析
        if (result.expired) {
          console.log('数据已过期，自动重新分析...');
          await startSSEAnalysis();
          return;
        }
        
        setLoading(false);
        return;
      }

      console.log('没有历史记录，自动开始分析...');
      await startSSEAnalysis();

    } catch (err) {
      console.error('获取历史记录失败:', err);
      console.log('获取历史记录失败，自动开始分析...');
      await startSSEAnalysis();
    }
  }, [symbol, startSSEAnalysis]); // 只依赖 symbol 和 startSSEAnalysis

  useEffect(() => {
    // 避免无限循环，只在组件挂载时或 symbol 变化时调用
    fetchExistingAnalysis();
  }, [symbol]); // 移除 analysisDate 和 fetchExistingAnalysis 依赖

  const formatElapsedTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.floor(seconds)}秒`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}分${secs}秒`;
  };

  const calculateETA = (progressValue: number, elapsed: number): string => {
    if (progressValue <= 0) return '计算中...';
    const totalEstimated = (elapsed / progressValue) * 100;
    const remaining = totalEstimated - elapsed;
    if (remaining <= 0) return '即将完成';
    return formatElapsedTime(remaining);
  };

  const isLoadingWithSSE = loading && isAnalyzing;

  if (isLoadingWithSSE && progress) {
    const elapsed = progress.elapsed_seconds || 0;
    const eta = calculateETA(progress.progress, elapsed);
    const currentStageConfig = STAGE_CONFIG[progress.stage] || STAGE_CONFIG.starting;
    const CurrentIcon = currentStageConfig.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1a2332] text-white flex items-center justify-center relative">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="text-center glass-effect rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl relative z-10">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-white/10"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={`${progress.progress * 3.52} 352`}
                className="transition-all duration-500 ease-out"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold gradient-text">{progress.progress}%</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-2">
            <CurrentIcon className={`w-6 h-6 ${currentStageConfig.color}`} />
            <span className="text-xl font-bold gradient-text">{progress.message}</span>
          </div>

          <div className={`text-sm mb-6 ${currentStageConfig.color}`}>
            {currentStageConfig.label}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-white/50 mb-1">已用时间</div>
              <div className="text-white font-semibold">{formatElapsedTime(elapsed)}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-white/50 mb-1">预计剩余</div>
              <div className="text-white font-semibold">{eta}</div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-left max-h-48 overflow-y-auto">
            {Object.entries(STAGE_CONFIG).map(([stage, config]) => {
              const stageOrder = ['starting', 'check_cache', 'collect_basic', 'collect_kline', 'calculate_technical', 'collect_financial', 'collect_news', 'ai_analysis', 'ai_value', 'ai_technical', 'ai_growth', 'ai_fundamental', 'ai_risk', 'ai_macro', 'synthesize', 'complete'];
              const stageIndex = stageOrder.indexOf(stage);
              const progressIndex = stageOrder.indexOf(progress.stage);
              const isCompleted = stage === 'complete' || stageIndex < progressIndex || (progress.progress >= 100);
              const isCurrent = stage === progress.stage;

              const StageIcon = config.icon;

              return (
                <div
                  key={stage}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                    isCurrent ? 'bg-white/10 border border-purple-500/30' :
                    isCompleted ? 'bg-green-500/5' : 'bg-white/5'
                  }`}
                >
                  <StageIcon className={`w-4 h-4 flex-shrink-0 ${
                    isCompleted ? 'text-green-400' :
                    isCurrent ? config.color : 'text-white/30'
                  }`} />
                  <span className={`${isCompleted ? 'text-white/60' : isCurrent ? 'text-white' : 'text-white/30'}`}>
                    {config.label}
                  </span>
                  {isCompleted && (
                    <Check className="w-4 h-4 text-green-400 ml-auto" />
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => {
              stopAnalysis();
              setLoading(false);
            }}
            className="mt-6 text-white/60 hover:text-white text-sm transition-colors"
          >
            取消分析
          </button>
        </div>
      </div>
    );
  }

  if (isAnalyzingResult && (error || hasProgressError)) {
    const errorMsg = error || progressError || '分析失败，请重试';
    const isApiKeyError = errorMsg.includes('DEEPSEEK_API_KEY') || errorMsg.includes('API key');

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1a2332] text-white flex items-center justify-center relative">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="text-center max-w-3xl glass-effect rounded-3xl p-12 shadow-2xl relative z-10 mx-4">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg bg-gradient-to-br from-red-500 to-orange-600">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">分析失败</h2>

          <div className="bg-white/5 rounded-xl p-6 mb-6 text-left">
            <p className="text-white/80 text-sm mb-2">错误信息：</p>
            <pre className="text-red-400 text-xs font-mono whitespace-pre-wrap break-all bg-black/20 rounded-lg p-4 max-h-48 overflow-auto">
              {errorMsg}
            </pre>
          </div>

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

          <div className="flex flex-col gap-4">
            <button
              onClick={startSSEAnalysis}
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

  if (!data && !isAnalyzing && !isLoadingWithSSE) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1a2332] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/60">加载中...</p>
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

    // 处理不同格式的 kline 数据
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
              onClick={startSSEAnalysis}
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
              turnover={realtimeData.turnover}
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
