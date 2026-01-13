'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUp, ArrowDown, TrendingUp, AlertTriangle, CheckCircle, Clock, Home, ChevronDown, ChevronUp, Search } from 'lucide-react';
import StockKLineChart from '@/components/StockKLineChart';

const roleNames: any = {
  value: '价值投资者',
  technical: '技术分析师',
  growth: '成长股分析师',
  fundamental: '基本面分析师',
  risk: '风险分析师',
  macro: '宏观分析师'
};

const roleColors: any = {
  value: 'bg-blue-500',
  technical: 'bg-purple-500',
  growth: 'bg-green-500',
  fundamental: 'bg-orange-500',
  risk: 'bg-red-500',
  macro: 'bg-cyan-500'
};

export default function AnalyzePage({ params }: { params: { symbol: string } }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set(['value']));
  
  const symbol = decodeURIComponent(params.symbol);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-6"></div>
          <div className="text-2xl font-bold text-gray-900 mb-2">正在分析中...</div>
          <div className="text-gray-600">AI多Agent正在深度分析股票数据</div>
          <div className="text-gray-500 mt-4 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            <span>预计需要30-60秒</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">分析失败</h2>
          <p className="text-gray-600 mb-6">{error || '无法加载分析结果'}</p>
          <button
            onClick={fetchAnalysis}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
          >
            重新分析
          </button>
          <Link href="/" className="block mt-4 text-indigo-600 hover:text-indigo-700">
            <Home className="w-5 h-5 inline mr-2" />
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-900 hover:text-indigo-600 transition-colors">
            <Search className="w-6 h-6" />
            <span className="font-bold text-xl">股票智能分析</span>
          </Link>
          <Link 
            href="/" 
            className="text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <Home className="w-5 h-5" />
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* 头部：综合评分 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧：评分和建议 */}
            <div className="lg:col-span-1 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{symbol}</h2>
              
              <div className="mb-8">
                <div className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  {data.overallScore.toFixed(1)}
                </div>
                <div className="text-gray-600 mt-2 text-lg">综合评分</div>
              </div>
              
              <div className="mb-8">
                <span className={`inline-block px-8 py-4 rounded-full text-white font-bold text-xl shadow-lg ${
                  data.recommendation === 'strong_buy' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                  data.recommendation === 'buy' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                  data.recommendation === 'hold' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                  data.recommendation === 'wait' ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 
                  'bg-gradient-to-r from-red-500 to-red-700'
                }`}>
                  {getRecommendationText(data.recommendation)}
                </span>
              </div>

              <div className="space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">置信度</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${data.confidence}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold text-gray-900 w-12 text-right">{data.confidence.toFixed(0)}%</span>
                  </div>
                </div>
                {data.cached && (
                  <div className="flex items-center justify-center gap-2 text-sm text-orange-600 bg-orange-50 py-2 rounded-lg">
                    <Clock className="w-4 h-4" />
                    <span>使用缓存数据（24小时内有效）</span>
                  </div>
                )}
              </div>
            </div>

          {/* 右侧：K线图 + AI摘要 */}
          <div className="lg:col-span-2 space-y-6">
            {/* K线图 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <StockKLineChart 
                data={data.klineData || []} 
                symbol={data.stockBasic?.symbol || symbol}
              />
            </div>

            {/* AI摘要 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">AI分析摘要</h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg bg-gradient-to-r from-gray-50 to-indigo-50 p-6 rounded-2xl">
              {data.summary}
            </p>
          </div>
        </div>
        </div>

        {/* 风险和机会 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-3xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-red-800 mb-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <ArrowDown className="w-6 h-6 text-white" />
              </div>
              主要风险
            </h3>
            <ul className="space-y-3">
              {data.risks.map((risk: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-1">{idx + 1}.</span>
                  <span className="text-red-900 leading-relaxed">{risk}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-3xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-green-800 mb-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <ArrowUp className="w-6 h-6 text-white" />
              </div>
              主要机会
            </h3>
            <ul className="space-y-3">
              {data.opportunities.map((opp: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-green-500 font-bold mt-1">{idx + 1}.</span>
                  <span className="text-green-900 leading-relaxed">{opp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 多角色详细分析 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            多角色深度分析
          </h2>
          <div className="space-y-4">
            {data.roleAnalysis.map((role: any) => (
              <div key={role.role} className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-indigo-300 transition-colors">
                <div 
                  className="p-5 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                  onClick={() => toggleRole(role.role)}
                >
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-full text-white text-sm font-bold ${roleColors[role.role]}`}>
                      {roleNames[role.role]}
                    </span>
                    <div>
                      <span className="text-gray-600 mr-3">评分</span>
                      <span className={`text-2xl font-bold ${
                        role.score >= 80 ? 'text-green-600' :
                        role.score >= 60 ? 'text-yellow-600' :
                        role.score >= 40 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {role.score}
                      </span>
                    </div>
                  </div>
                  {expandedRoles.has(role.role) ? <ChevronUp className="w-6 h-6 text-gray-400" /> : <ChevronDown className="w-6 h-6 text-gray-400" />}
                </div>

                {expandedRoles.has(role.role) && (
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-indigo-50 border-t-2 border-gray-200">
                    <p className="text-gray-700 leading-relaxed text-lg mb-5">{role.analysis}</p>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-600" />
                      关键点
                    </h4>
                    <ul className="space-y-2">
                      {role.keyPoints.map((point: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-700">
                          <span className="text-indigo-600 font-bold mt-0.5">{idx + 1}.</span>
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 底部信息 */}
        <div className="text-center text-gray-500 text-sm pb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-4 h-4" />
            <span>分析时间：{new Date().toLocaleString('zh-CN')}</span>
          </div>
          <div>分析模型：{data.model}</div>
          <div>Token使用：输入 {data.tokenUsage?.input?.toLocaleString()} / 输出 {data.tokenUsage?.output?.toLocaleString()}</div>
          <div>处理耗时：{data.processingTime?.toFixed(1)}秒</div>
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
