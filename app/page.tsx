'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, ArrowRight, Sparkles, Zap, BarChart3, BrainCircuit, 
  Globe, TrendingUp, ShieldAlert, RefreshCw, ChevronRight,
  Clock, Target, LineChart, Database, Award
} from 'lucide-react';

export default function Home() {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
          headerRef.current.style.background = 'rgba(0, 0, 0, 0.9)';
          headerRef.current.style.backdropFilter = 'blur(10px)';
          headerRef.current.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
          headerRef.current.style.background = 'rgba(0, 0, 0, 0.3)';
          headerRef.current.style.backdropFilter = 'blur(10px)';
          headerRef.current.style.boxShadow = 'none';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAnalyze = () => {
    if (!symbol.trim()) return;
    setLoading(true);
    window.location.href = `/analyze/${encodeURIComponent(symbol.trim())}`;
  };

  // 从环境变量获取版本号，默认为开发版本
  const version = process.env.NEXT_PUBLIC_APP_VERSION || 'Dev';

  const features = [
    {
      icon: <BrainCircuit className="w-8 h-8 text-white" />,
      title: 'AI多角色分析',
      description: '6大专业Agent从不同角度进行深度分析，覆盖技术、基本面、市场情绪等多维度',
      color: 'from-blue-500 to-purple-600',
    },
    {
      icon: <Database className="w-8 h-8 text-white" />,
      title: '全面数据洞察',
      description: '整合财务数据、技术指标、新闻资讯，提供全方位的市场洞察和趋势分析',
      color: 'from-green-500 to-teal-600',
    },
    {
      icon: <Target className="w-8 h-8 text-white" />,
      title: '智能投资建议',
      description: '基于多维度分析结果，提供买入、卖出、观望等明确的投资建议和风险提示',
      color: 'from-yellow-500 to-orange-600',
    },
    {
      icon: <LineChart className="w-8 h-8 text-white" />,
      title: '实时市场监控',
      description: '24/7实时监控市场动态，捕捉重要的价格变动和市场事件',
      color: 'from-red-500 to-pink-600',
    },
    {
      icon: <ShieldAlert className="w-8 h-8 text-white" />,
      title: '风险评估系统',
      description: '多维度风险评估模型，帮助您了解投资风险并制定相应的风险管理策略',
      color: 'from-indigo-500 to-blue-600',
    },
    {
      icon: <Award className="w-8 h-8 text-white" />,
      title: '投资组合优化',
      description: '基于现代投资组合理论，优化资产配置，提高风险调整回报率',
      color: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1a2332] text-white overflow-x-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* 头部 */}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-transparent">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 whitespace-nowrap">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white flex-shrink-0 whitespace-nowrap">智能投资分析</span>
                <span className="text-xs text-gray-400">AI-Driven Stock Analysis</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a href="#" className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all">首页</a>
              <a href="#" className="text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all">功能</a>
              <a href="#" className="text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all">关于我们</a>
              <a href="#" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-5 py-2 rounded-lg font-medium transition-all button-hover">
                开始使用
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* 英雄区域 */}
        <section className="pt-32 pb-32 relative">
          <div className="container mx-auto px-4">
            {/* 标签 */}
            <div className="flex justify-center mb-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full text-sm text-white/80 shadow-lg">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="font-medium">AI驱动的智能投资分析平台</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-green-400">{version}</span>
              </div>
            </div>

            {/* 标题 */}
            <h1 className="text-5xl md:text-7xl font-bold text-center mb-6 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              智能股票
              <span className="gradient-text block mt-2">深度分析</span>
            </h1>

            {/* 副标题 */}
            <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-12 text-center leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
              多Agent协作 · 全维度数据 · 智能投资决策支持
            </p>

            {/* 搜索区域 */}
            <div className="max-w-3xl mx-auto mb-12 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
              <div className="relative glass-effect rounded-2xl p-2 transition-all hover:shadow-2xl hover:shadow-purple-500/10">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                      placeholder="输入股票代码（如：000001, 0700.HK, AAPL）"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-base"
                    />
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-none rounded-xl px-8 py-4 font-semibold text-lg cursor-pointer transition-all button-hover flex items-center gap-3 shadow-lg shadow-purple-500/25"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>分析中...</span>
                      </>
                    ) : (
                      <>
                        <span>开始分析</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
              </div>

            {/* 数据展示 */}
            <div className="flex justify-center gap-8 mt-16 animate-fadeInUp" style={{ animationDelay: '1s' }}>
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text">6</div>
                <div className="text-sm text-white/60 mt-2">专业Agent</div>
              </div>
              <div className="w-px bg-white/10"></div>
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text">3</div>
                <div className="text-sm text-white/60 mt-2">支持市场</div>
              </div>
            </div>
          </div>
        </section>

        {/* 特性区域 */}
        <section className="py-32 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-full text-sm text-purple-300 mb-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <Zap className="w-4 h-4" />
                <span className="font-medium">核心功能</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                强大的分析功能
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                利用先进的AI技术，为您提供全方位的股票分析和投资建议
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={feature.title}
                  className="group glass-effect rounded-3xl p-8 card-hover animate-fadeInUp"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-purple-300 transition-colors">{feature.title}</h3>
                  <p className="text-white/60 mb-6 leading-relaxed">{feature.description}</p>
                  <a href="#" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors group-hover:gap-3">
                    <span>了解更多</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 分析流程 */}
        <section className="py-32 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full text-sm text-blue-300 mb-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <BarChart3 className="w-4 h-4" />
                <span className="font-medium">智能流程</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                智能分析流程
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                从数据采集到投资建议，全流程AI驱动
              </p>
            </div>

            <div className="relative max-w-5xl mx-auto">
              {/* 连接线 */}
              <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform -translate-y-1/2 hidden md:block"></div>

              {/* 流程步骤 */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
                {[
                  { title: '数据采集', desc: '实时获取股票数据', icon: <Database className="w-5 h-5" /> },
                  { title: '技术分析', desc: 'K线形态与指标分析', icon: <LineChart className="w-5 h-5" /> },
                  { title: '基本面评估', desc: '财务数据深度挖掘', icon: <Target className="w-5 h-5" /> },
                  { title: '风险分析', desc: '多维度风险评估', icon: <ShieldAlert className="w-5 h-5" /> },
                  { title: '投资建议', desc: 'AI智能决策支持', icon: <BrainCircuit className="w-5 h-5" /> }
                ].map((step, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center animate-fadeInUp"
                    style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25 relative group hover:scale-110 transition-transform duration-300">
                      {step.icon}
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-white">{step.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 市场覆盖 */}
        <section className="py-32 relative">
          <div className="container mx-auto px-4 text-center">
            <div className="glass-effect inline-flex items-center gap-6 px-8 py-5 rounded-2xl animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-white/80 font-medium">支持市场：</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg font-semibold">A股</span>
                <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-lg font-semibold">港股</span>
                <span className="bg-pink-500/20 text-pink-300 px-4 py-2 rounded-lg font-semibold">美股</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="relative border-t border-white/10 py-16 animate-fadeInUp" style={{ animationDelay: '1.2s' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              {/* 品牌信息 */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-white">智能投资分析</span>
                    <p className="text-xs text-white/50 mt-1">AI-Driven Stock Analysis</p>
                  </div>
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-md">
                  利用先进的AI多Agent协作技术，为投资者提供全方位的股票分析、风险评估和智能投资建议。
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer">
                    <Globe className="w-5 h-5 text-white/60" />
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer">
                    <Zap className="w-5 h-5 text-white/60" />
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer">
                    <BarChart3 className="w-5 h-5 text-white/60" />
                  </div>
                </div>
              </div>

              {/* 快速链接 */}
              <div>
                <h4 className="text-white font-semibold mb-4">快速链接</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors text-sm">首页</a></li>
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors text-sm">功能介绍</a></li>
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors text-sm">关于我们</a></li>
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors text-sm">使用指南</a></li>
                </ul>
              </div>

              {/* 支持与帮助 */}
              <div>
                <h4 className="text-white font-semibold mb-4">支持与帮助</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors text-sm">帮助中心</a></li>
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors text-sm">常见问题</a></li>
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors text-sm">联系我们</a></li>
                  <li><a href="#" className="text-white/60 hover:text-white transition-colors text-sm">反馈建议</a></li>
                </ul>
              </div>
            </div>

            {/* 底部信息 */}
            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-white/50">
                © {new Date().getFullYear()} 智能投资分析平台 | 保留所有权利
              </div>
              <div className="flex items-center gap-6 text-sm text-white/50">
                <a href="#" className="hover:text-white transition-colors">隐私政策</a>
                <a href="#" className="hover:text-white transition-colors">服务条款</a>
                <a href="#" className="hover:text-white transition-colors">Cookie 政策</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}