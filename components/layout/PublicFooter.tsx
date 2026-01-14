'use client';

import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: '功能特性', href: '/features' },
      { label: '定价方案', href: '/pricing' },
      { label: '使用指南', href: '/docs' },
    ],
    company: [
      { label: '关于我们', href: '/about' },
      { label: '联系我们', href: 'mailto:support@stock-analyzer.com' },
      { label: '加入我们', href: '#' },
    ],
    legal: [
      { label: '隐私政策', href: '#' },
      { label: '服务条款', href: '#' },
      { label: 'Cookie政策', href: '#' },
    ],
  };

  const socialLinks = [
    { name: 'GitHub', href: '#', icon: 'G' },
    { name: 'Twitter', href: '#', icon: 'T' },
    { name: 'LinkedIn', href: '#', icon: 'L' },
  ];

  return (
    <footer className="relative border-t border-white/10 py-12 bg-[#0a0f1a]/50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-semibold">智能投资分析</span>
              </Link>
              <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm">
                利用先进的AI多Agent协作技术，为投资者提供全方位的股票分析、风险评估和智能投资建议。
              </p>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    aria-label={social.name}
                  >
                    <span className="text-sm text-white/60">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">产品</h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-white/60 hover:text-white text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">公司</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-white/60 hover:text-white text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">法律</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-white/60 hover:text-white text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-white/50">
              © {currentYear} 智能投资分析平台. 保留所有权利.
            </div>
            <div className="flex items-center gap-6 text-sm text-white/50">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                服务运行正常
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}