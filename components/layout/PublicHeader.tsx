'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { TrendingUp, Menu, X, User, Settings, LogOut, ChevronDown } from 'lucide-react';

interface PublicHeaderProps {
  currentPath?: string;
}

export default function PublicHeader({ currentPath = '/' }: PublicHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: '首页' },
    { href: '/features', label: '功能' },
    { href: '/pricing', label: '定价' },
    { href: '/about', label: '关于我们' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  const userLinks = [
    { href: '/history', label: '分析历史', icon: TrendingUp },
    { href: '/settings', label: '账户设置', icon: Settings },
  ];

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#0a0f1a]/95 backdrop-blur-xl shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 whitespace-nowrap group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white whitespace-nowrap">智能投资分析</span>
              <span className="text-xs text-white/50">AI-Driven Stock Analysis</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-all ${
                  isActive(link.href)
                    ? 'text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Authenticated User Menu */}
          {status === 'authenticated' && session?.user ? (
            <div className="hidden md:flex items-center gap-4 relative">
              <Link
                href="/history"
                className="text-white/70 hover:text-white text-sm font-medium px-4 py-2"
              >
                分析历史
              </Link>
              <Link
                href="/settings"
                className="text-white/70 hover:text-white text-sm font-medium px-4 py-2"
              >
                设置
              </Link>
              
              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{session.user.name || session.user.email}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1f2e] rounded-xl shadow-xl border border-white/10 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-medium text-white">{session.user.name || '用户'}</p>
                      <p className="text-xs text-white/50 truncate">{session.user.email}</p>
                    </div>
                    <div className="py-2">
                      {userLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <link.icon className="w-4 h-4" />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-white/10 py-2">
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        退出登录
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Unauthenticated Buttons */
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/auth/signin"
                className="text-white/70 hover:text-white transition-colors text-sm font-medium px-4 py-2"
              >
                登录
              </Link>
              <Link
                href="/auth/signup"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all button-hover shadow-lg shadow-purple-500/20 text-sm"
              >
                免费注册
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-white/10">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg transition-colors ${
                    isActive(link.href)
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {status === 'authenticated' ? (
                <>
                  <div className="pt-4 border-t border-white/10">
                    <p className="px-4 py-2 text-sm text-white/50">
                      {session?.user?.email}
                    </p>
                  </div>
                  {userLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' });
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    退出登录
                  </button>
                </>
              ) : (
                <div className="pt-4 flex flex-col gap-3">
                  <Link
                    href="/auth/signin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center py-3 rounded-lg border border-white/20 text-white/80 hover:bg-white/5 transition-colors"
                  >
                    登录
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium"
                  >
                    免费注册
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}