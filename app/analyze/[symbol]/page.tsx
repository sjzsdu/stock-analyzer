'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowUp, ArrowDown, TrendingUp, AlertTriangle, CheckCircle, Clock, Home, ChevronDown, ChevronUp, Search, RefreshCw, BarChart3, ShieldAlert, Lightbulb, BrainCircuit } from 'lucide-react';
import StockKLineChart from '@/components/StockKLineChart';
import EnhancedAnalysisReport from '@/components/analysis/EnhancedAnalysisReport';

const roleNames: any = {
  value: '价值投资者',
  technical: '技术分析师',
  growth: '成长股分析师',
  fundamental: '基本面分析师',
  risk: '风险分析师',
  macro: '宏观分析师'
};

const roleColors: any = {
  value: 'bg-gradient-to-r from-blue-500 to-blue-600',
  technical: 'bg-gradient-to-r from-purple-500 to-purple-600',
  growth: 'bg-gradient-to-r from-green-500 to-green-600',
  fundamental: 'bg-gradient-to-r from-orange-500 to-orange-600',
  risk: 'bg-gradient-to-r from-red-500 to-red-600',
  macro: 'bg-gradient-to-r from-cyan-500 to-cyan-600'
};

export default function AnalyzePage({ params }: { params: Promise<{ symbol: string }> }) {
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set(['value']));

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
        const data = result.data;
        
        // 处理klineData和stockBasic数据
        if (data.klineData) {
          console.log(`K线数据: ${data.klineData.length} 条记录`);
        }
        
        setData(data);
        
        if (result.cached) {
          console.log('使用缓存数据');
        }
      } else {
        setError(result.error || '分析失败');
      }
    } catch (err) {
      console.error('请求错误:', err);
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (role: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(role)) {
      newExpanded.delete(role);
    } else {
      newExpanded.add(role);
    }
    setExpandedRoles(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1a2332] text-white flex items-center justify-center relative">
        {/* 背景装饰 */}
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

  if (error || !data) {
    // 检测各种错误类型
    const isApiKeyError = error.includes('DEEPSEEK_API_KEY') || error.includes('API key') || error.includes('API配置');
    const isTimeoutError = error.includes('超时') || error.includes('timeout') || error.includes('Timeout');
    const isNetworkError = error.includes('服务暂时不可用') || error.includes('连接') || error.includes('network');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1a2332] text-white flex items-center justify-center relative">
        {/* 背景装饰 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="text-center max-w-3xl glass-effect rounded-3xl p-12 shadow-2xl relative z-10 mx-4">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">⚠️ 分析失败</h2>
          
          {/* 错误详情 */}
          <div className="bg-white/5 rounded-xl p-6 mb-6 text-left">
            <p className="text-white/80 text-sm mb-2">错误信息：</p>
            <pre className="text-red-400 text-xs font-mono whitespace-pre-wrap break-all bg-black/20 rounded-lg p-4 max-h-48 overflow-auto">
{error || '无法加载分析结果'}
            </pre>
          </div>
          
          {/* 快速诊断 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4 text-left">
              <h4 className="text-white/60 text-sm mb-2">🔍 快速检查</h4>
              <ul className="text-white/70 text-xs space-y-1">
                <li>• 服务健康: <a href="http://localhost:8000/health" target="_blank" className="text-blue-400 hover:underline">点击测试</a></li>
                <li>• API 文档: <a href="http://localhost:8000/docs" target="_blank" className="text-blue-400 hover:underline">点击查看</a></li>
              </ul>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 text-left">
              <h4 className="text-white/60 text-sm mb-2">💡 常见解决方案</h4>
              <ul className="text-white/70 text-xs space-y-1">
                {isTimeoutError && <li>• AI分析需要2-5分钟，请耐心等待</li>}
                {isNetworkError && <li>• 检查 Python 服务是否启动</li>}
                {!isApiKeyError && <li>• 点击"重新分析"重试</li>}
                <li>• 返回首页重新搜索</li>
              </ul>
            </div>
          </div>
          
          {/* API Key 配置帮助 */}
          {isApiKeyError && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6 text-left">
              <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">⚙️</span> AI服务配置
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
        {/* 头部：综合评分 */}
        <div className="glass-effect rounded-3xl p-8 mb-8 card-hover">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧：评分和建议 */}
            <div className="lg:col-span-1 text-center">
              <h2 className="text-3xl font-bold mb-6">{symbol}</h2>

              <div className="mb-8 transform transition-all duration-300 hover:scale-105">
                <div className="text-8xl font-bold gradient-text">
                  {data.overallScore.toFixed(1)}
                </div>
                <div className="text-white/60 mt-2 text-lg">综合评分</div>
              </div>

              <div className="mb-8">
                <span className={`inline-block px-8 py-4 rounded-full text-white font-bold text-xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105 ${
                  data.recommendation === 'strong_buy' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                  data.recommendation === 'buy' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                  data.recommendation === 'hold' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                  data.recommendation === 'wait' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                  'bg-gradient-to-r from-red-500 to-red-700'
                }`}>
                  {getRecommendationText(data.recommendation)}
                </span>
              </div>

              <div className="space-y-4 text-left">
                 <div className="flex justify-between items-center bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                   <span className="text-white/70 font-medium">置信度</span>
                   <div className="flex items-center gap-3">
                     <div className="w-32 h-2.5 bg-white/10 rounded-full overflow-hidden">
                       <div
                         className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                         style={{ width: `${data.confidenceScore || data.confidence}%` }}
                       ></div>
                     </div>
                     <span className="font-semibold text-white w-12 text-right">{(data.confidenceScore || data.confidence).toFixed(0)}%</span>
                   </div>
                 </div>
                {data.cached && (
                  <div className="flex items-center justify-center gap-2 text-sm text-orange-400 bg-orange-500/10 backdrop-blur-sm py-3 rounded-xl border border-orange-500/20">
                    <Clock className="w-4 h-4" />
                    <span>使用缓存数据（24小时内有效）</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm text-white/50 border-t border-white/10 pt-4">
                  <span>分析模型</span>
                  <span className="font-medium text-white/80">{data.model}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-white/50">
                  <span>处理耗时</span>
                  <span className="font-medium text-white/80">{data.processingTime?.toFixed(1)}秒</span>
                </div>
              </div>
            </div>

          {/* 右侧：K线图 + AI摘要 */}
          <div className="lg:col-span-2 space-y-8">
            {/* K线图 */}
            <div className="glass-effect rounded-2xl overflow-hidden card-hover">
              <StockKLineChart
                data={data.klineData || []}
                symbol={data.stockBasic?.symbol || symbol}
              />
            </div>

            {/* AI摘要 */}
            <div className="glass-effect rounded-2xl p-6 border border-purple-500/20 card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <BrainCircuit className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold">AI分析摘要</h3>
              </div>
              <p className="text-white/80 leading-relaxed text-lg">
                {data.summary}
              </p>
            </div>
          </div>
        </div>
        </div>

        {/* 风险和机会 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="glass-effect rounded-3xl p-6 border border-red-500/20 card-hover">
            <h3 className="text-xl font-bold text-red-400 mb-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              主要风险
            </h3>
            <ul className="space-y-4">
              {data.risks.map((risk: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 bg-red-500/5 backdrop-blur-sm p-4 rounded-xl border border-red-500/10 transform transition-all duration-200 hover:bg-red-500/10">
                  <span className="text-red-400 font-bold mt-1 flex-shrink-0">{idx + 1}.</span>
                  <span className="text-white/80 leading-relaxed">{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-effect rounded-3xl p-6 border border-green-500/20 card-hover">
            <h3 className="text-xl font-bold text-green-400 mb-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              主要机会
            </h3>
            <ul className="space-y-4">
              {data.opportunities.map((opp: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 bg-green-500/5 backdrop-blur-sm p-4 rounded-xl border border-green-500/10 transform transition-all duration-200 hover:bg-green-500/10">
                  <span className="text-green-400 font-bold mt-1 flex-shrink-0">{idx + 1}.</span>
                  <span className="text-white/80 leading-relaxed">{opp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 多角色详细分析 */}
        <div className="glass-effect rounded-3xl p-8 mb-8 card-hover">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            多角色深度分析
          </h2>

          {/* 检查是否为增强版分析结果 */}
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
            /* 回退到原有分析显示 */
            <div className="space-y-4">
              {data.roleAnalysis.map((role: any) => (
                <div key={role.role} className="border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 shadow-sm hover:shadow-lg">
                  <div
                    className="p-5 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between"
                    onClick={() => toggleRole(role.role)}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-2 rounded-full text-white text-sm font-bold ${roleColors[role.role]} shadow-md`}>
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
                    <div className="transition-transform duration-300">
                      {expandedRoles.has(role.role) ? <ChevronUp className="w-6 h-6 text-white/40" /> : <ChevronDown className="w-6 h-6 text-white/40" />}
                    </div>
                  </div>

                  {expandedRoles.has(role.role) && (
                    <div className="p-6 bg-white/5 backdrop-blur-sm border-t border-white/10 animate-fadeIn">
                      <p className="text-white/80 leading-relaxed text-lg mb-5">{role.analysis}</p>
                      <h4 className="font-bold mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-purple-400" />
                        关键点
                      </h4>
                      <ul className="space-y-3">
                        {role.keyPoints.map((point: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3 text-white/80 bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                            <span className="text-purple-400 font-bold mt-0.5 flex-shrink-0">{idx + 1}.</span>
                            <span className="leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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

function getRecommendationText(rec: string) {
  const map: any = {
    strong_buy: '强烈买入',
    buy: '买入',
    hold: '持有',
    wait: '观望',
    sell: '卖出'
  };
  return map[rec] || rec;
}
