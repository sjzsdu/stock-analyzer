'use client';

import Link from 'next/link';
import {
  TrendingUp, BrainCircuit, ShieldAlert, Target, LineChart, Database,
  Sparkles, ArrowRight, ChevronRight, CheckCircle, BarChart3,
  Zap, Globe, Lightbulb, Cpu, Globe2, Lock, Users, Award, Clock
} from 'lucide-react';

export default function AboutPage() {
  const team = [
    {
      name: '投资专家',
      role: '投资策略负责人',
      description: '10年投资经验，擅长价值投资和量化分析',
      icon: <TrendingUp className="w-8 h-8" />
    },
    {
      name: 'AI工程师',
      role: '技术架构师',
      description: '专注机器学习和AI系统开发',
      icon: <BrainCircuit className="w-8 h-8" />
    },
    {
      name: '数据科学家',
      role: '数据负责人',
      description: '金融数据分析和处理专家',
      icon: <Database className="w-8 h-8" />
    }
  ];

  const values = [
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: '创新驱动',
      description: '持续探索AI技术在投资领域的应用，提供最先进的分析工具'
    },
    {
      icon: <ShieldAlert className="w-8 h-8" />,
      title: '稳健可靠',
      description: '提供透明、可追溯的分析过程，让投资决策有据可依'
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: '用户至上',
      description: '以用户需求为导向，持续优化产品体验和服务质量'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: '开放包容',
      description: '拥抱多元化观点，提供多角度分析视角'
    }
  ];

  const milestones = [
    {
      year: '2024',
      title: '产品启动',
      description: '完成核心功能开发和测试'
    },
    {
      year: '2025 Q1',
      title: '正式发布',
      description: '上线开放公众使用'
    },
    {
      year: '2025 Q2',
      title: '功能扩展',
      description: '添加更多高级功能和优化'
    },
    {
      year: '2025 Q3+',
      title: '持续演进',
      description: '根据用户反馈持续迭代优化'
    }
  ];

  const stats = [
    { value: '6+', label: '专业Agent' },
    { value: '3', label: '支持市场' },
    { value: '24/7', label: '全天候分析' },
    { value: '99.9%', label: '服务可用性' }
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
              <Link href="/features" className="text-white/70 hover:text-white transition-colors">功能</Link>
              <Link href="/pricing" className="text-white/70 hover:text-white transition-colors">定价</Link>
              <Link href="/about" className="text-white/90 hover:text-white transition-colors">关于我们</Link>
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
                <span>关于我们</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-8">
                用AI赋能
                <span className="gradient-text block mt-2">智能投资决策</span>
              </h1>

              <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
                我们致力于利用先进的AI技术，为投资者提供专业、全面、透明的股票分析工具，帮助您做出更明智的投资决策
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="glass-effect rounded-3xl p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{stat.value}</div>
                    <div className="text-white/60">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">我们的使命</h2>
                <p className="text-lg text-white/70 max-w-2xl mx-auto">
                  让专业级股票分析触手可及
                </p>
              </div>

              <div className="glass-effect rounded-3xl p-8 md:p-12">
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg text-white/80 leading-relaxed mb-6">
                    在传统的股票分析领域，专业级的投资研究往往需要昂贵的付费服务或专业的金融知识。
                    我们相信，每个人都应该能够获得高质量的投资分析工具，而不必支付高昂的费用或具备专业的金融背景。
                  </p>
                  <p className="text-lg text-white/80 leading-relaxed mb-6">
                    智能投资分析平台利用先进的AI技术，特别是多Agent协作系统，模拟专业投资团队的分析方法，
                    为用户提供多维度、全方位的股票分析报告。我们的AI Agent不仅提供分析结论，更重要的是展示完整的推理过程和数据依据，
                    让用户能够理解每一项建议背后的逻辑。
                  </p>
                  <p className="text-lg text-white/80 leading-relaxed">
                    我们的目标是成为您最值得信赖的AI投资助手，帮助您在复杂的市场环境中做出更理性、更科学的投资决策。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">核心价值观</h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                我们坚持这些原则，为用户提供最好的产品和服务
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {values.map((value, index) => (
                <div key={value.title} className="glass-effect rounded-3xl p-8 text-center card-hover">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                  <p className="text-white/60 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">专业团队</h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                汇聚投资、技术、数据多领域专家
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {team.map((member, index) => (
                <div key={member.name} className="glass-effect rounded-3xl p-8 text-center card-hover">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    {member.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <p className="text-purple-400 mb-4">{member.role}</p>
                  <p className="text-white/60">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">发展历程</h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                每一步都是成长的印记
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* 连接线 */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 hidden md:block"></div>

                <div className="space-y-8">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex items-start gap-6 md:gap-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg z-10">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div className="glass-effect rounded-2xl p-6 flex-1">
                        <div className="text-purple-400 font-bold mb-2">{milestone.year}</div>
                        <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                        <p className="text-white/60">{milestone.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="glass-effect rounded-3xl p-12 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">联系我们</h2>
              <p className="text-white/70 mb-8 text-lg">
                如果您有任何问题或建议，欢迎与我们联系
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/signup" className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all button-hover flex items-center gap-3 w-full sm:w-auto justify-center">
                  <span>立即体验</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="mailto:support@stock-analyzer.com" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-white/10 w-full sm:w-auto">
                  发送邮件
                </a>
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