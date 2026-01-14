/**
 * 登录页面
 * 
 * 支持多种登录方式：Google、微信、支付宝、QQ、邮箱密码
 * 
 * @module app/auth/signin/page
 */

'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getAvailableOAuthProviders } from '@/lib/auth-domestic-oauth';
import {
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Sparkles
} from 'lucide-react';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  // 获取可用的OAuth提供商
  const oauthProviders = getAvailableOAuthProviders();
  
  // 处理邮箱密码登录
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');
    
    try {
      const result = await signIn('email', {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setFormError(result.error);
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setFormError('登录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 处理OAuth登录
  const handleOAuthLogin = (providerId: string) => {
    signIn(providerId, { callbackUrl });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">股票分析AI</span>
          </Link>
          <p className="text-gray-600">登录您的账户，开启智能投资分析</p>
        </div>
        
        {/* 错误提示 */}
        {(error || formError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-600 text-sm">
              {formError || '登录失败，请重试'}
            </p>
          </div>
        )}
        
        {/* OAuth登录按钮 */}
        {oauthProviders.length > 0 && (
          <div className="space-y-3 mb-6">
            {oauthProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleOAuthLogin(provider.id)}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                style={{ backgroundColor: provider.bg }}
              >
                <span className="text-white font-medium">{provider.name}</span>
              </button>
            ))}
          </div>
        )}
        
        {/* 分隔符 */}
        {oauthProviders.length > 0 && (
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-500">
                或使用邮箱登录
              </span>
            </div>
          </div>
        )}
        
        {/* 邮箱密码登录表单 */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              邮箱地址
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>登录</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
        
        {/* 注册链接 */}
        <p className="text-center text-gray-600 mt-6">
          还没有账户？{' '}
          <Link 
            href="/auth/signup" 
            className="text-indigo-600 font-medium hover:text-indigo-700 inline-flex items-center gap-1"
          >
            立即注册
            <ChevronRight className="w-4 h-4" />
          </Link>
        </p>
        
        {/* 版权信息 */}
        <p className="text-center text-gray-400 text-sm mt-8">
          登录即表示同意{' '}
          <Link href="/terms" className="text-gray-500 hover:text-gray-600">
            服务条款
          </Link>
          {' '}和{' '}
          <Link href="/privacy" className="text-gray-500 hover:text-gray-600">
            隐私政策
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
