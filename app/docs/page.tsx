'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  TrendingUp, Search, ArrowRight, ChevronDown, ChevronUp,
  BookOpen, ShieldAlert, Zap, Globe, Mail
} from 'lucide-react';

export default function DocsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: '如何开始股票分析？',
      answer: '在首页搜索框中输入股票代码（如：000001、0700.HK、AAPL），点击"开始分析"即可。无需注册即可体验基础分析功能。'
    },
    {
      question: '免费版和分析版有什么区别？',
      answer: '免费版每月提供3次分析机会，分析结果缓存24小时。付费版提供更多分析次数、更长的缓存时间、历史记录保存和高级财务指标等功能。'
    },
    {
      question: '支持哪些市场的股票？',
      answer: '目前支持A股（上海、深圳交易所）、港股（香港交易所）和美股（NYSE、NASDAQ）的分析。'
    },
    {
      question: '分析结果如何解读？',
      answer: '分析报告包含综合评分（0-100分）、投资建议（强烈买入/买入/持有/观望/卖出）、置信度和详细的多维度分析。请结合自身风险承受能力做出投资决策。'
    },
    {
      question: '分析数据从哪里来？',
      answer: 'A股数据来自AkShare等公开数据源，港股和美股数据来自yFinance。财务数据来自公司公开披露的财务报表。'
    },
    {
      question: '如何注册和使用？',
      answer: '点击首页右上角"免费注册"，填写邮箱和密码即可创建账户。注册后可以保存分析历史、收藏股票、享受更多分析次数。'
    },
    {
      question: '分析需要多长时间？',
      answer: '首次分析通常需要30-60秒，包括数据采集和AI分析。已缓存的股票再次分析只需几秒。'
    },
    {
      question: '如何保障数据安全？',
      answer: '我们采用行业标准的加密技术保护用户数据，密码使用bcrypt加密存储，不会出售或共享用户的个人信息。'
    }
  ];

  const guides = [
    {
      title: '快速开始',
      description: '5分钟内学会使用智能股票分析',
      icon: <Zap className="w-6 h-6" />,
      href: '#quick-start'
    },
    {
      title: '功能介绍',
      description: '了解AI分析的各项功能',
      icon: <BookOpen className="w-6 h-6" />,
      href: '/features'
    },
    {
      title: '订阅指南',
      description: '选择适合您的订阅方案',
      icon: <ShieldAlert className="w-6 h-6" />,
      href: '/pricing'
    },
    {
      title: '常见问题',
      description: '解答您在使用中的疑问',
      icon: <Globe className="w-6 h-6" />,
      href: '#faq'
    }
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
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                帮助中心
              </h1>
              <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-12">
                查找使用指南、常见问题解答和最佳实践
              </p>

              {/* Search Box */}
              <div className="max-w-2xl mx-auto">
                <div className="relative glass-effect rounded-2xl p-2">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="搜索问题..."
                    className="w-full bg-transparent border-none rounded-xl px-12 py-4 text-white placeholder-white/40 focus:outline-none text-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Guides */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {guides.map((guide, index) => (
                <Link key={index} href={guide.href} className="glass-effect rounded-2xl p-6 text-center hover:bg-white/10 transition-all card-hover group">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    {guide.icon}
                  </div>
                  <h3 className="font-bold mb-2">{guide.title}</h3>
                  <p className="text-sm text-white/60">{guide.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Start Guide */}
        <section id="quick-start" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-8 text-center">快速开始</h2>

              <div className="space-y-8">
                {[
                  { step: 1, title: '输入股票代码', desc: '在首页搜索框中输入股票代码，支持多种格式：A股（如000001）、港股（如0700.HK）、美股（如AAPL）' },
                  { step: 2, title: '开始分析', desc: '点击"开始分析"按钮，系统将自动采集数据并进行AI分析，首次分析可能需要30-60秒' },
                  { step: 3, title: '查看结果', desc: '分析完成后，您将看到综合评分、投资建议和各维度的详细分析报告' },
                  { step: 4, title: '保存和管理', desc: '注册账户后，您可以保存分析历史、收藏股票、享受更多分析次数' }
                ].map((item, index) => (
                  <div key={index} className="glass-effect rounded-2xl p-6 flex items-start gap-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-white/60 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-8 text-center">常见问题</h2>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="glass-effect rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <span className="font-semibold text-lg">{faq.question}</span>
                      {openFaq === index ? (
                        <ChevronUp className="w-5 h-5 text-white/40" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white/40" />
                      )}
                    </button>
                    {openFaq === index && (
                      <div className="px-6 pb-6 text-white/70 leading-relaxed border-t border-white/10 pt-4">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="glass-effect rounded-3xl p-12 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">还有其他问题？</h2>
              <p className="text-white/70 mb-8 text-lg">
                我们的客服团队随时为您解答疑问
              </p>
              <a href="mailto:support@stock-analyzer.com" className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all button-hover">
                <Mail className="w-5 h-5" />
                <span>联系客服</span>
                <ArrowRight className="w-5 h-5" />
              </a>
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