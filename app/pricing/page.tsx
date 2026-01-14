'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  TrendingUp, Sparkles, ArrowRight, CheckCircle, XCircle,
  Zap, Users, Globe, Clock, Star, ShieldAlert
} from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: '免费版',
      description: '适合初次体验',
      price: { monthly: 0, yearly: 0 },
      color: 'from-gray-500 to-gray-600',
      features: [
        { name: '股票分析', included: true, detail: '每月3次' },
        { name: '6维度AI分析', included: true },
        { name: '分析结果缓存', included: true, detail: '24小时' },
        { name: 'K线图表展示', included: true },
        { name: '历史记录', included: false },
        { name: '收藏功能', included: false },
        { name: '高级财务指标', included: false },
        { name: '优先客服支持', included: false }
      ],
      cta: '免费开始',
      highlight: false
    },
    {
      name: '基础版',
      description: '适合个人投资者',
      price: { monthly: 29, yearly: 290 },
      originalPrice: { monthly: 49, yearly: 490 },
      color: 'from-blue-500 to-blue-600',
      features: [
        { name: '股票分析', included: true, detail: '每月30次' },
        { name: '6维度AI分析', included: true },
        { name: '分析结果缓存', included: true, detail: '7天' },
        { name: 'K线图表展示', included: true },
        { name: '历史记录', included: true, detail: '30天' },
        { name: '收藏功能', included: true },
        { name: '高级财务指标', included: false },
        { name: '优先客服支持', included: false }
      ],
      cta: '立即升级',
      highlight: false
    },
    {
      name: '专业版',
      description: '适合活跃投资者',
      price: { monthly: 99, yearly: 990 },
      originalPrice: { monthly: 149, yearly: 1490 },
      color: 'from-purple-500 to-pink-600',
      features: [
        { name: '股票分析', included: true, detail: '每月100次' },
        { name: '6维度AI分析', included: true },
        { name: '分析结果缓存', included: true, detail: '30天' },
        { name: 'K线图表展示', included: true },
        { name: '历史记录', included: true, detail: '1年' },
        { name: '收藏功能', included: true },
        { name: '高级财务指标', included: true },
        { name: '优先客服支持', included: true }
      ],
      cta: '立即升级',
      highlight: true
    },
    {
      name: '企业版',
      description: '适合专业机构',
      price: { monthly: null, yearly: null },
      color: 'from-yellow-500 to-orange-600',
      features: [
        { name: '股票分析', included: true, detail: '无限次' },
        { name: '6维度AI分析', included: true },
        { name: '分析结果缓存', included: true, detail: '无限制' },
        { name: 'K线图表展示', included: true },
        { name: '历史记录', included: true, detail: '永久' },
        { name: '收藏功能', included: true },
        { name: '高级财务指标', included: true },
        { name: '专属客服', included: true },
        { name: 'API访问', included: true },
        { name: '定制化报告', included: true }
      ],
      cta: '联系我们',
      highlight: false
    }
  ];

  const faqs = [
    {
      question: '免费版可以分析多少次股票？',
      answer: '免费版每月提供3次股票分析机会，每次分析结果会缓存24小时，期间再次分析同一股票不会消耗次数。'
    },
    {
      question: '分析次数用完了怎么办？',
      answer: '您可以升级到更高版本的订阅，获得更多分析次数。升级后立即生效，次数会在每月初重置。'
    },
    {
      question: '年付有什么优惠？',
      answer: '选择年付可以享受约17%的折扣（相当于免费获得2个月），并且价格锁定一年，不受价格调整影响。'
    },
    {
      question: '可以取消订阅吗？',
      answer: '可以随时取消，取消后您仍可使用当前订阅期剩余的功能。取消后不会自动续费。'
    },
    {
      question: '企业版有什么特别功能？',
      answer: '企业版提供无限分析次数、API访问、定制化报告、专属客服等高级功能，适合有批量分析需求或需要集成到自有系统的用户。'
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
              <Link href="/pricing" className="text-white/90 hover:text-white transition-colors">定价</Link>
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
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-full text-sm text-white/80 mb-8">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>灵活的订阅方案</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-8">
                选择适合您的
                <span className="gradient-text block mt-2">投资方案</span>
              </h1>

              <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-12">
                从免费体验到专业投资，我们提供灵活的订阅方案，满足不同投资者的需求
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className={`text-lg transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-white/50'}`}>按月付费</span>
                <button
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className="relative w-16 h-8 bg-white/10 rounded-full p-1 transition-colors hover:bg-white/20"
                >
                  <div className={`absolute top-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all ${billingCycle === 'yearly' ? 'left-9' : 'left-1'}`}></div>
                </button>
                <span className={`text-lg transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-white/50'}`}>
                  按年付费
                  <span className="ml-2 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">省17%</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {plans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={`relative glass-effect rounded-3xl p-8 ${
                    plan.highlight
                      ? 'border-2 border-purple-500/50 shadow-lg shadow-purple-500/20 transform md:-translate-y-4'
                      : ''
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        最受欢迎
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      {plan.name === '免费版' ? <Zap className="w-8 h-8 text-white" /> :
                       plan.name === '基础版' ? <Users className="w-8 h-8 text-white" /> :
                       plan.name === '专业版' ? <Star className="w-8 h-8 text-white" /> :
                       <ShieldAlert className="w-8 h-8 text-white" />}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-white/60 text-sm">{plan.description}</p>
                  </div>

                  <div className="text-center mb-8">
                    {plan.price.monthly === null ? (
                      <div className="text-3xl font-bold">联系客服</div>
                    ) : (
                      <>
                        {plan.originalPrice && billingCycle === 'yearly' && (
                          <div className="text-white/40 text-sm line-through">
                            ¥{plan.originalPrice.yearly}/年
                          </div>
                        )}
                        <div className="text-5xl font-bold">
                          <span className="text-2xl">¥</span>
                          {billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                        </div>
                        <div className="text-white/50 text-sm mt-2">
                          /{billingCycle === 'monthly' ? '月' : '年'}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-white/30 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-white/80' : 'text-white/30'}`}>
                          {feature.name}
                          {feature.detail && (
                            <span className="text-white/50 ml-1">({feature.detail})</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={plan.name === '企业版' ? 'mailto:support@stock-analyzer.com' : '/auth/signup'}
                    className={`block w-full py-4 rounded-xl font-semibold text-center transition-all ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">功能对比</h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                详细的功能对比，帮助您选择最适合的方案
              </p>
            </div>

            <div className="overflow-x-auto max-w-5xl mx-auto">
              <table className="w-full glass-effect rounded-2xl overflow-hidden">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-6 text-white/60">功能</th>
                    <th className="text-center p-6">免费版</th>
                    <th className="text-center p-6">基础版</th>
                    <th className="text-center p-6 text-purple-400">专业版</th>
                    <th className="text-center p-6">企业版</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: '每月分析次数', free: '3次', basic: '30次', pro: '100次', ent: '无限' },
                    { feature: 'AI分析维度', free: '6维度', basic: '6维度', pro: '6维度', ent: '6维度 + 定制' },
                    { feature: '结果缓存时间', free: '24小时', basic: '7天', pro: '30天', ent: '永久' },
                    { feature: '历史记录保存', free: '无', basic: '30天', pro: '1年', ent: '永久' },
                    { feature: 'K线图表', free: true, basic: true, pro: true, ent: true },
                    { feature: '收藏功能', free: false, basic: true, pro: true, ent: true },
                    { feature: '高级财务指标', free: false, basic: false, pro: true, ent: true },
                    { feature: 'API访问', free: false, basic: false, pro: false, ent: true },
                    { feature: '专属客服', free: false, basic: false, pro: true, ent: true }
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="p-4 text-white/80">{row.feature}</td>
                      <td className="p-4 text-center text-white/60">{typeof row.free === 'boolean' ? (row.free ? '✓' : '-') : row.free}</td>
                      <td className="p-4 text-center text-white/60">{typeof row.basic === 'boolean' ? (row.basic ? '✓' : '-') : row.basic}</td>
                      <td className="p-4 text-center text-purple-400 font-medium">{typeof row.pro === 'boolean' ? (row.pro ? '✓' : '-') : row.pro}</td>
                      <td className="p-4 text-center text-white/60">{typeof row.ent === 'boolean' ? (row.ent ? '✓' : '-') : row.ent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">常见问题</h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                更多问题，请查看帮助中心或联系客服
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="glass-effect rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                  <p className="text-white/60 leading-relaxed">{faq.answer}</p>
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
                立即注册，免费体验AI驱动的智能股票分析
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/signup" className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all button-hover flex items-center gap-3 w-full sm:w-auto justify-center">
                  <span>免费注册</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/features" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-white/10 w-full sm:w-auto">
                  了解更多功能
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