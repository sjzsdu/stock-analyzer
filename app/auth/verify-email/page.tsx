'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight,
  Sparkles 
} from 'lucide-react';

interface VerificationStatus {
  success: boolean;
  message?: string;
  alreadyVerified?: boolean;
  error?: string;
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus({
          success: false,
          error: '验证链接无效，请检查邮件中的链接是否完整',
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const result = await response.json();

        if (result.success) {
          setStatus({
            success: true,
            message: result.message,
            alreadyVerified: result.alreadyVerified,
          });
        } else {
          setStatus({
            success: false,
            error: result.error,
          });
        }
      } catch {
        setStatus({
          success: false,
          error: '验证失败，请稍后重试',
        });
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  const handleResend = async () => {
    if (!email) {
      return;
    }

    setResending(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        alert('验证邮件已重新发送，请查收您的邮箱');
      } else {
        alert(result.error || '发送失败，请稍后重试');
      }
    } catch {
      alert('发送失败，请稍后重试');
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Mail className="w-10 h-10 text-indigo-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">正在验证...</h1>
        <p className="text-gray-600">请稍候，我们正在验证您的邮箱</p>
      </div>
    );
  }

  if (!status?.success && status?.error) {
    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">股票分析AI</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">验证失败</h1>
          <p className="text-gray-600 mb-6">{status.error}</p>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-600 mb-4">
              如果您没有收到验证邮件，可以重新发送：
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="请输入您的邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <button
                onClick={handleResend}
                disabled={!email || resending}
                className="px-4 py-3 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {resending ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    发送
                  </>
                )}
              </button>
            </div>
          </div>

          <Link 
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all"
          >
            返回注册
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>
      
      {status?.alreadyVerified ? (
        <>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">邮箱已验证</h1>
          <p className="text-gray-600 mb-6">
            您的邮箱已经验证成功，请直接登录您的账户
          </p>
          <Link 
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all"
          >
            立即登录
            <ArrowRight className="w-5 h-5" />
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">验证成功！</h1>
          <p className="text-gray-600 mb-6">
            恭喜！您的邮箱已验证成功，可以开始使用所有功能
          </p>
          <Link 
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all"
          >
            立即登录
            <ArrowRight className="w-5 h-5" />
          </Link>
        </>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full max-w-md text-center">
      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
        <Mail className="w-10 h-10 text-indigo-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">正在加载...</h1>
      <p className="text-gray-600">请稍候</p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Suspense fallback={<LoadingFallback />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
