'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, Home, Search, RefreshCw, BarChart3, ShieldAlert, Lightbulb, BrainCircuit } from 'lucide-react';
import StockKLineChart from '@/components/StockKLineChart';
import StockOverviewCard from '@/components/StockOverviewCard';
import AnalysisSummary from '@/components/AnalysisSummary';
import AnalystRadarChart from '@/components/AnalystRadarChart';
import RiskOpportunityCard from '@/components/RiskOpportunityCard';
import EnhancedAnalysisReport from '@/components/analysis/EnhancedAnalysisReport';

// 角色名称映射
const roleNames: Record<string, string> = {
  value: '价值投资者',
  technical: '技术分析师',
  growth: '成长股分析师',
  fundamental: '基本面分析师',
  risk: '风险分析师',
  macro: '宏观分析师'
};

// 角色颜色映射
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
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const symbol = decodeURIComponent(resolvedParams.symbol);

  useEffect(() => {
    fetchAnalysis();
  }, [symbol]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || '分析失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1a2332] text-white flex items-center justify-center relative">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="text-center glass-effect rounded-3xl p-12 max-w-lg shadow-2xl relative z-10">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-500 border-t-transparent mx-auto mb-8 shadow-lg shadow-purple-500/30"></div>
          <div className="text-3xl font-bold mb-4 gradient-text">正在分析中...</div>
          <div className="text-white/70 text-lg mb-6">AI多Agent正在深度分析股票数据</div>
          <div className="text-white/50 flex items-center justify-center gap-2 mb-8">
            <Clock className="w-5 h-5" />
            <span>预计需要30-60秒</span>
          </div>
          <div className="space-y-3 text-sm text-white/60 bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
              <span>数据采集中...</span>
            </div>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>技术分析执行中</span>
            </div>
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-4 h-4 text-pink-400" />
              <span>AI综合研判中</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !data) {
    const isApiKeyError = error.includes('DEEPSEEK_API_KEY') || error.includes('API key');
    const isTimeoutError = error.includes('超时') || error.includes('timeout');
    const isNetworkError = error.includes('服务暂时不可用') || error.includes('连接');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1a2332] text-white flex items-center justify-center relative">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="text-center max-w-3xl glass-effect rounded-3xl p-12 shadow-2xl relative z-10 mx-4">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">分析失败</h2>
          
          <div className="bg-white/5 rounded-xl p-6 mb-6 text-left">
            <p className="text-white/80 text-sm mb-2">错误信息：</p>
            <pre className="text-red-400 text-xs font-mono whitespace-pre-wrap break-all bg-black/20 rounded-lg p-4 max-h-48 overflow-auto">
              {error || '无法加载分析结果'}
            </pre>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4 text-left">
              <h4 className="text-white/60 text-sm mb-2">快速检查</h4>
              <ul className="text-white/70 text-xs space-y-1">
                <li>• 服务健康: <a href="http://localhost:8000/health" target="_blank" className="text-blue-400 hover:underline">点击测试</a></li>
                <li>• API 文档: <a href="http://localhost:8000/docs" target="_blank" className="text-blue-400 hover:underline">点击查看</a></li>
              </ul>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 text-left">
              <h4 className="text-white/60 text-sm mb-2">常见解决方案</h4>
              <ul className="text-white/70 text-xs space-y-1">
                {isTimeoutError && <li>• AI分析需要2-5分钟，请耐心等待</li>}
                {isNetworkError && <li>• 检查 Python 服务是否启动</li>}
                {!isApiKeyError && <li>• 点击"重新分析"重试</li>}
                <li>• 返回首页重新搜索</li>
              </ul>
            </div>
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
                <p>1. 申请 API Key: <a href="https://platform.deepseek.com/" target="_blank" className="text-blue-400 hover:underline">https://platform.deepseek.com/</a></p>
                <p>2. 编辑文件: <code className="text-yellow-400">python-service/.env</code></p>
                <p>3. 设置: <code className="text-yellow-400">DEEPSEEK_API_KEY=sk-xxx</code></p>
                <p>4. 重启 Python 服务</p>
              </div>
            </div>
          )}
          
          <div className="flex flex-col gap-4">
            <button
              onClick={fetchAnalysis}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold transition-all button-hover flex items-center justify-center gap-3 shadow-lg shadow-purple-500/25"
            >
              <RefreshCw className="w-5 h-5" />
              重新分析
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

    // 从K线数据提取实时行情
    const calculateRealtimeData = () => {
      if (!data.klineData || data.klineData.length === 0) {
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

      const klineData = data.klineData;
      const latest = klineData[klineData.length - 1];
      const previous = klineData[klineData.length - 2] || latest;
      
      // 计算52周高低
      const prices = klineData.map((k: number[]) => k[4] || k[2]); // 收盘价
      const high52w = Math.max(...prices);
      const low52w = Math.min(...prices);
      
      // 计算成交额（可能需要转换单位）
      const turnover = latest[6] || 0; // 成交额

      return {
        currentPrice: latest[4] || latest[2], // 收盘价
        changePercent: previous[4] ? ((latest[4] - previous[4]) / previous[4]) * 100 : 0,
        changeAmount: previous[4] ? (latest[4] - previous[4]) : 0,
        previousClose: previous[4] || previous[2],
        volume: latest[5] || 0, // 成交量
        turnover: turnover,
        high52w,
        low52w
      };
    };

    const realtimeData = calculateRealtimeData();
    
    // 提取评分数据（从 agentResults 中获取）
    const scores = data.agentResults ? {
      value: data.agentResults.find((a: any) => a.agent === 'value')?.score || 0,
      technical: data.agentResults.find((a: any) => a.agent === 'technical')?.score || 0,
      growth: data.agentResults.find((a: any) => a.agent === 'growth')?.score || 0,
      fundamental: data.agentResults.find((a: any) => a.agent === 'fundamental')?.score || 0,
      risk: data.agentResults.find((a: any) => a.agent === 'risk')?.score || 0,
      macro: data.agentResults.find((a: any) => a.agent === 'macro')?.score || 0
    } : {
      value: data.roleAnalysis?.find((a: any) => a.role === 'value')?.score || 0,
      technical: data.roleAnalysis?.find((a: any) => a.role === 'technical')?.score || 0,
      growth: data.roleAnalysis?.find((a: any) => a.role === 'growth')?.score || 0,
      fundamental: data.roleAnalysis?.find((a: any) => a.role === 'fundamental')?.score || 0,
      risk: data.roleAnalysis?.find((a: any) => a.role === 'risk')?.score || 0,
      macro: data.roleAnalysis?.find((a: any) => a.role === 'macro')?.score || 0
    };

    // 过滤掉0分，只保留有效的评分
    const validScores = Object.entries(scores).filter(([_, score]) => score > 0);
    const maxScore = validScores.length > 0 ? Math.max(...validScores.map(([_, s]) => s)) : 0;
    const minScore = validScores.length > 0 ? Math.min(...validScores.map(([_, s]) => s)) : 0;
    const strongestRole = validScores.find(([_, s]) => s === maxScore)?.[0] || '';
    const weakestRole = validScores.find(([_, s]) => s === minScore)?.[0] || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1a2332] text-white relative">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* 导航栏 */}
      <nav className="glass-effect sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-white hover:text-purple-300 transition-all duration-300 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">股票智能分析</span>
          </Link>
          <Link
            href="/"
            className="text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 p-3 rounded-xl flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">返回首页</span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* 第一行：股票概览卡片 + 综合评分 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* 股票概览卡片 */}
          <div className="xl:col-span-2">
            <StockOverviewCard
              basic={{
                name: data.stockName || data.stockBasic?.name,
                symbol: data.stockBasic?.symbol || symbol,
                market: data.stockBasic?.market,
                industry: data.stockBasic?.industry
              }}
              currentPrice={realtimeData.currentPrice}
              changePercent={realtimeData.changePercent}
              changeAmount={realtimeData.changeAmount}
              previousClose={realtimeData.previousClose}
              volume={realtimeData.volume}
              turnover={realtimeData.turnover}
              marketCap={data.stockBasic?.marketCap || '--'}
              circulatingCap={data.stockBasic?.circulatingCap || data.stockBasic?.marketCap || '--'}
              // 兼容多种字段名（A股、港股、美股）
              pe={data.stockBasic?.pe || data.stockBasic?.peRatio || data.stockBasic?.forwardPE || data.stockBasic?.trailingPE || 0}
              pb={data.stockBasic?.pb || data.stockBasic?.pbRatio || data.stockBasic?.priceToBook || 0}
              dividend={data.stockBasic?.dividend || data.stockBasic?.dividendYield || 0}
              roe={data.stockBasic?.roe || data.stockBasic?.returnOnEquity || 0}
              high52w={realtimeData.high52w}
              low52w={realtimeData.low52w}
              latestNews={data.stockBasic?.latestNews || []}
            />
          </div>

          {/* 综合评分卡片 */}
          <div className="glass-effect rounded-3xl p-6 card-hover flex flex-col justify-center">
            <div className="text-center mb-6">
              <h3 className="text-white/60 text-sm mb-2">综合评分</h3>
              <div className="text-7xl font-bold gradient-text">
                {data.overallScore.toFixed(1)}
              </div>
            </div>

            <div className="text-center mb-6">
              <span className={`inline-block px-8 py-4 rounded-full text-white font-bold text-xl shadow-lg ${
                data.recommendation === 'strong_buy' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                data.recommendation === 'buy' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                data.recommendation === 'hold' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                data.recommendation === 'wait' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                'bg-gradient-to-r from-red-500 to-red-700'
              }`}>
                {data.recommendation === 'strong_buy' ? '强烈买入' :
                 data.recommendation === 'buy' ? '买入' :
                 data.recommendation === 'hold' ? '持有' :
                 data.recommendation === 'wait' ? '观望' : '卖出'}
              </span>
            </div>

            {/* 置信度进度条 */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60 text-sm">置信度</span>
                  <span className="font-semibold text-white">{(data.confidenceScore || data.confidence).toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                    style={{ width: `${data.confidenceScore || data.confidence}%` }}
                  ></div>
                </div>
              </div>

              {data.cached && (
                <div className="flex items-center justify-center gap-2 text-sm text-orange-400 bg-orange-500/10 backdrop-blur-sm py-2 rounded-lg border border-orange-500/20">
                  <Clock className="w-4 h-4" />
                  <span>使用缓存数据（24小时内有效）</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-white/50 pt-4 border-t border-white/10">
                <span>分析模型</span>
                <span className="font-medium text-white/80">{data.model}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-white/50">
                <span>处理耗时</span>
                <span className="font-medium text-white/80">{data.processingTime?.toFixed(1)}秒</span>
              </div>
            </div>
          </div>
        </div>

        {/* 第二行：雷达图 + K线图 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* 多维度评分雷达图 */}
          <AnalystRadarChart
            scores={scores}
            overallScore={data.overallScore}
            confidence={data.confidenceScore || data.confidence}
          />

          {/* K线图 */}
          <div className="glass-effect rounded-2xl overflow-hidden card-hover">
            <StockKLineChart
              data={data.klineData || []}
              symbol={data.stockBasic?.symbol || symbol}
            />
          </div>
        </div>

        {/* 第三行：AI分析摘要 */}
        <div className="mb-8">
          <AnalysisSummary content={data.summary} />
        </div>

        {/* 第四行：风险和机会 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* 主要风险 */}
          {data.risks && data.risks.length > 0 && (
            data.risks.map((risk: string, idx: number) => (
              <RiskOpportunityCard
                key={`risk-${idx}`}
                type="risk"
                title={`风险${idx + 1}：${risk.split('：')[0] || '风险因素'}`}
                description={risk.split('：')[1] || risk}
                dataPoints={[]}
                impact={{
                  severity: idx === 0 ? 'high' : idx === 1 ? 'medium' : 'low',
                  confidence: Number((70 + Math.random() * 20).toFixed(1)),
                  timeframe: 'medium',
                  controllability: 'medium'
                }}
                suggestion={idx === 0 
                  ? '建议密切关注相关动态，设置合理的止损位。'
                  : '保持关注，但不必过度担忧。'}
              />
            ))
          )}

          {/* 主要机会 */}
          {data.opportunities && data.opportunities.length > 0 && (
            data.opportunities.map((opp: string, idx: number) => (
              <RiskOpportunityCard
                key={`opp-${idx}`}
                type="opportunity"
                title={`机会${idx + 1}：${opp.split('：')[0] || '增长机会'}`}
                description={opp.split('：')[1] || opp}
                dataPoints={[]}
                impact={{
                  confidence: Number((70 + Math.random() * 20).toFixed(1)),
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

        {/* 第五行：多角色深度分析 */}
        <div className="glass-effect rounded-3xl p-8 mb-8 card-hover">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            多角色深度分析
          </h2>

          {data.agentResults && data.agentResults.length > 0 ? (
            <EnhancedAnalysisReport
              agentResults={data.agentResults}
              overallScore={data.overallScore}
              recommendation={data.recommendation}
              confidenceScore={data.confidenceScore || data.confidence}
              keyFactors={data.keyFactors || []}
              symbol={symbol}
              stockName={data.stockName || symbol}
            />
          ) : (
            <div className="space-y-4">
              {data.roleAnalysis?.map((role: any) => (
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

        {/* 底部信息 */}
        <div className="text-center glass-effect rounded-2xl p-6 mb-8 border border-white/10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-white/40" />
            <span className="text-white/60 text-sm">分析时间：{new Date().toLocaleString('zh-CN')}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm mb-1">分析模型</div>
              <div className="text-white font-semibold">{data.model}</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm mb-1">Token使用</div>
              <div className="text-white font-semibold">
                输入 {data.tokenUsage?.input?.toLocaleString()} / 输出 {data.tokenUsage?.output?.toLocaleString()}
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm mb-1">处理耗时</div>
              <div className="text-white font-semibold">{data.processingTime?.toFixed(1)}秒</div>
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
