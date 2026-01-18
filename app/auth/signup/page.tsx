/**
 * 注册页面
 * 
 * 支持邮箱注册账户
 * 
 * @module app/auth/signup/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  CheckCircle,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  Eye,
  EyeOff 
} from 'lucide-react';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // 检查登录状态，如果已登录则跳转到首页
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);
  
  const password = watch('password');
  
  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        setError(result.error || '注册失败，请重试');
      } else {
        setSuccess(true);
        setRegisteredEmail(data.email);
      }
    } catch (err) {
      setError('注册失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const [registeredEmail, setRegisteredEmail] = useState('');
  
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">注册成功！</h1>
          <p className="text-gray-600 mb-4">
            我们已向 <span className="font-medium text-indigo-600">{registeredEmail}</span> 发送了验证邮件
          </p>
          <p className="text-gray-500 text-sm mb-8">
            请点击邮件中的链接验证您的邮箱，24小时内有效
          </p>
          <Link 
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all"
          >
            去登录
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-sm text-gray-500">
            没有收到邮件？{' '}
            <Link href="/auth/verify-email" className="text-indigo-600 hover:text-indigo-700 font-medium">
              重新发送
            </Link>
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">股票分析AI</span>
          </Link>
          <p className="text-gray-600">创建您的账户，开启智能投资</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                {...register('name', { 
                  required: '请输入用户名',
                  minLength: { value: 2, message: '用户名至少2个字符' },
                  maxLength: { value: 50, message: '用户名最多50个字符' }
                })}
                placeholder="请输入用户名"
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">邮箱地址</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                {...register('email', { 
                  required: '请输入邮箱地址',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: '请输入有效的邮箱地址'
                  }
                })}
                placeholder="your@email.com"
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', { 
                  required: '请输入密码',
                  minLength: { value: 8, message: '密码至少8个字符' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: '密码需包含大小写字母和数字'
                  }
                })}
                placeholder="请输入密码"
                className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">确认密码</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('confirmPassword', { 
                  required: '请确认密码',
                  validate: value => value === password || '两次输入的密码不一致'
                })}
                placeholder="请再次输入密码"
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>
          
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              {...register('agreeTerms', { required: '请同意服务条款' })}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label className="text-sm text-gray-600">
              我已阅读并同意 
              <Link href="/terms" className="text-indigo-600 hover:text-indigo-700">服务条款</Link>
              和
              <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700">隐私政策</Link>
            </label>
          </div>
          {errors.agreeTerms && (
            <p className="text-sm text-red-500">{errors.agreeTerms.message}</p>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>立即注册</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
        
        <p className="text-center text-gray-600 mt-6">
          已有账户？{' '}
          <Link href="/auth/signin" className="text-indigo-600 font-medium hover:text-indigo-700">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}
