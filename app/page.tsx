'use client';
import { useState } from 'react';
import { Search, TrendingUp, Shield, Brain, ArrowRight, Sparkles, Zap, BarChart3, Globe } from 'lucide-react';

export default function Home() {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    if (!symbol.trim()) return;
    setLoading(true);
    window.location.href = `/analyze/${encodeURIComponent(symbol.trim())}`;
  };

  const popularStocks = [
    { symbol: '000001', name: '平安银行', market: 'A股' },
    { symbol: '0700.HK', name: '腾讯控股', market: '港股' },
    { symbol: 'AAPL', name: '苹果', market: '美股' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30"></div>
      
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-white/20">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">AI驱动的智能投资分析平台</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            智能股票
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {' '}深度分析
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            多Agent协作 · 全维度数据 · 智能投资决策支持
          </p>

          <div className="relative max-w-2xl mx-auto mb-12">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-30"></div>
            <div className="relative flex items-center bg-white/10 backdrop-blur-md rounded-full border border-white/20 p-2">
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="输入股票代码（如：000001, 0700.HK, AAPL）"
                className="flex-1 bg-transparent px-6 py-4 text-lg text-white placeholder-gray-400 focus:outline-none"
              />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <span>开始分析</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-16">
            <span className="text-sm text-gray-400">热门股票：</span>
            {popularStocks.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => {
                  setSymbol(stock.symbol);
                  window.location.href = `/analyze/${encodeURIComponent(stock.symbol)}`;
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-sm text-gray-300 hover:text-white transition-all flex items-center gap-2"
              >
                <Globe className="w-3 h-3" />
                {stock.name} · {stock.symbol}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI多角色分析</h3>
              <p className="text-gray-400">6大专业Agent从不同角度进行深度分析，覆盖技术面、基本面、市场情绪等多维度</p>
            </div>

            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">全面数据洞察</h3>
              <p className="text-gray-400">整合财务数据、技术指标、新闻资讯，提供全方位的市场洞察和趋势分析</p>
            </div>

            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">智能投资建议</h3>
              <p className="text-gray-400">基于多维度分析结果，提供买入、卖出、观望等明确的投资建议和风险提示</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-20 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            支持市场：
            <span className="text-gray-300 ml-2">A股</span>
            <span className="mx-2">·</span>
            <span className="text-gray-300">港股</span>
            <span className="mx-2">·</span>
            <span className="text-gray-300">美股</span>
          </div>
        </div>
      </div>
    </div>
  );
}
