'use client';

import Link from 'next/link';
import {
  BrainCircuit, TrendingUp, ShieldAlert, Target, LineChart, Database,
  Sparkles, ArrowRight, ChevronRight, CheckCircle, BarChart3,
  Zap, Globe, Lightbulb, Cpu, Globe2, Lock
} from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      icon: <BrainCircuit className="w-8 h-8" />,
      title: 'AI多Agent协作分析',
      description: '6大专业Agent从不同角度进行深度分析，覆盖技术、基本面、市场情绪等多维度，提供全方位投资视角',
      color: 'from-blue-500 to-purple-600',
      details: [
        '价值投资Agent - DCF估值与相对估值',
        '技术分析Agent - 趋势与形态识别',
        '成长股Agent - 营收与利润增长评估',
        '基本面Agent - 财务质量深度剖析',
        '风险评估Agent - 多维度风险识别',
        '宏观分析Agent - 经济周期与政策影响'
      ]
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: '全面数据洞察',
      description: '整合财务数据、技术指标、新闻资讯，提供全方位的市场洞察和趋势分析',
      color: 'from-green-500 to-teal-600',
      details: [
        '实时行情数据采集',
        '财务报表深度分析',
        '行业对比与基准',
        '历史估值趋势',
        '关联交易与关联交易',
        '管理层与股权结构'
      ]
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: '智能投资建议',
      description: '基于多维度分析结果，提供买入、卖出、观望等明确的投资建议和风险提示',
      color: 'from-yellow-500 to-orange-600',
      details: [
        '明确的操作建议（强烈买入/买入/持有/观望/卖出）',
        '置信度评分（0-100%）',
        '风险收益比评估',
        '目标价预测区间',
        '止盈止损建议',
        '关键风险因素提示'
      ]
    },
    {
      icon: <LineChart className="w-8 h-8" />,
      title: 'K线图表可视化',
      description: '专业的金融图表展示，支持多种技术指标和图表形态分析',
      color: 'from-red-500 to-pink-600',
      details: [
        '交互式K线图表',
        'MACD/RSI/KDJ指标',
        '移动平均线叠加',
        '成交量分析',
        '支撑阻力位标记',
        '形态识别提示'
      ]
    },
    {
      icon: <ShieldAlert className="w-8 h-8" />,
      title: '风险评估系统',
      description: '多维度风险评估模型，帮助您了解投资风险并制定相应的风险管理策略',
      color: 'from-indigo-500 to-blue-600',
      details: [
        '市场系统性风险',
        '行业特有风险',
        '公司财务风险',
        '估值风险评估',
        '流动性风险提示',
        '合规与政策风险'
      ]
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: '推理过程透明',
      description: 'AI分析过程完全透明，每项结论都有详细的数据支撑和推理逻辑',
      color: 'from-purple-500 to-pink-600',
      details: [
        '数据来源标注',
        '对比基准说明',
        '置信度来源',
        '限制条件说明',
        '替代分析视角',
        '可追溯的分析链路'
      ]
    }
  ];

  const markets = [
    { name: 'A股', description: '支持上海、深圳交易所上市股票', color: 'bg-blue-500' },
    { name: '港股', description: '支持香港交易所上市股票', color: 'bg-purple-500' },
    { name: '美股', description: '支持NYSE、NASDAQ上市股票', color: 'bg-pink-500' }
  ];

  const techStack = [
    { name: 'Next.js 16', description: '现代React框架', icon: <Globe2 className="w-5 h-5" /> },
    { name: 'FastAPI', description: '高性能Python后端', icon: <Cpu className="w-5 h-5" /> },
    { name: 'CrewAI', description: '多Agent协作框架', icon: <BrainCircuit className="w-5 h-5" /> },
    { name: 'DeepSeek', description: '大语言模型', icon: <Lightbulb className="w-5 h-5" /> },
    { name: 'MongoDB', description: '数据存储', icon: <Database className="w-5 h-5" /> },
    { name: 'AkShare', description: 'A股数据源', icon: <BarChart3 className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1a2332] text-white overflow-x-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* 头部 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 whitespace-nowrap">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white flex-shrink-0 whitespace-nowrap">智能投资分析</span>
                <span className="text-xs text-gray-400">AI-Driven Stock Analysis</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link href="/" className="text-white/70 hover:text-white transition-colors">首页</Link>
              <Link href="/features" className="text-white/90 hover:text-white transition-colors">功能</Link>
              <Link href="/pricing" className="text-white/70 hover:text-white transition-colors">定价</Link>
              <Link href="/about" className="text-white/70 hover:text-white transition-colors">关于我们</Link>
              <Link href="/auth/signup" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-5 py-2 rounded-lg font-medium transition-all button-hover">
                免费注册
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative pt-24">
        {/* Hero Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-full text-sm text-white/80 mb-8">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>AI驱动的智能投资分析平台</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-8">
                强大的
                <span className="gradient-text block mt-2">AI分析功能</span>
              </h1>

              <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
                利用先进的AI多Agent协作技术，为您提供全方位的股票分析、风险评估和智能投资建议
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
                <Link href="/auth/signup" className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all button-hover flex items-center gap-3">
                  <span>立即开始体验</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="#features" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-white/10">
                  了解更多
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">核心功能特性</h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                六大专业Agent协作分析，覆盖投资决策全流程
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group glass-effect rounded-3xl p-8 card-hover"
                >
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-white/60 mb-6 leading-relaxed">{feature.description}</p>

                  <ul className="space-y-3">
                    {feature.details.slice(0, 4).map((detail, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/50">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>

                  {feature.details.length > 4 && (
                    <button className="mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 transition-colors">
                      查看更多 <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Markets Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="glass-effect rounded-3xl p-12 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">支持全球主要市场</h2>
                <p className="text-white/70">一个平台，涵盖A股、港股、美股</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {markets.map((market, index) => (
                  <div key={market.name} className="text-center">
                    <div className={`w-16 h-16 ${market.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <Globe className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{market.name}</h3>
                    <p className="text-white/60 text-sm">{market.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">技术架构</h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                现代化技术栈，强大的性能和可靠性
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
              {techStack.map((tech, index) => (
                <div key={tech.name} className="glass-effect rounded-xl p-6 text-center hover:bg-white/10 transition-colors">
                  <div className="text-white/80 mb-3 flex justify-center">
                    {tech.icon}
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{tech.name}</h4>
                  <p className="text-xs text-white/50">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="glass-effect rounded-3xl p-12 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">准备好开始了吗？</h2>
              <p className="text-white/70 mb-8 text-lg">
                立即注册，体验AI驱动的智能股票分析
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/signup" className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all button-hover flex items-center gap-3 w-full sm:w-auto justify-center">
                  <span>免费注册</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/about" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-white/10 w-full sm:w-auto">
                  了解更多
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-white font-semibold">智能投资分析</span>
                  <p className="text-xs text-white/50">© {new Date().getFullYear()} 保留所有权利</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-white/50">
                <Link href="/features" className="hover:text-white transition-colors">功能</Link>
                <Link href="/pricing" className="hover:text-white transition-colors">定价</Link>
                <Link href="/about" className="hover:text-white transition-colors">关于我们</Link>
                <Link href="/docs" className="hover:text-white transition-colors">帮助中心</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}