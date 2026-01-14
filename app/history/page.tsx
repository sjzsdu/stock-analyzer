/**
 * 分析历史页面
 * 
 * 用户查看和管理分析历史记录
 * 
 * @module app/history/page
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AnalysisHistory from '@/components/history/AnalysisHistory';
import { Zap, History } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // 重定向未登录用户
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/history');
    }
  }, [status, router]);
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">加载中...</span>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 顶部导航栏 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">股票分析AI</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/settings"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                设置
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-gray-600">{session.user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <History className="w-8 h-8 text-indigo-600" />
              分析历史
            </h1>
            <p className="text-gray-600 mt-2">
              查看您的股票分析记录，了解投资决策的历史轨迹
            </p>
          </div>
          
          {/* 分析历史组件 */}
          <AnalysisHistory showHeader={true} />
          
          {/* 快捷操作 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/"
              className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">开始新分析</h3>
                <p className="text-sm text-gray-500">分析新的股票，获取AI投资建议</p>
              </div>
            </Link>
            
            <Link
              href="/settings"
              className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">账户设置</h3>
                <p className="text-sm text-gray-500">管理您的偏好设置和订阅</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
