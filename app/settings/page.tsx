/**
 * 用户设置页面
 * 
 * 管理用户账户、订阅、语言和模型偏好
 * 
 * @module app/settings/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  CreditCard, 
  Globe, 
  Brain, 
  Bell, 
  Shield,
  ChevronRight,
  Settings,
  LogOut,
  AlertCircle,
  CheckCircle,
  Zap,
  Crown,
  Loader2
} from 'lucide-react';
import LanguageSettings from '@/components/settings/LanguageSettings';
import ModelPreferences from '@/components/settings/ModelPreferences';

// 订阅层级信息
const SUBSCRIPTION_PLANS = [
  {
    tier: 'free',
    name: '免费版',
    price: '¥0',
    period: '永久',
    analyses: '10次/月',
    color: 'gray',
    features: ['基础股票分析', '标准分析速度', 'DeepSeek V3'],
  },
  {
    tier: 'basic',
    name: '基础版',
    price: '¥29',
    period: '/月',
    analyses: '100次/月',
    color: 'blue',
    features: ['完整公司数据', '优先分析速度', '分析历史保存', 'DeepSeek Reasoner'],
  },
  {
    tier: 'pro',
    name: '专业版',
    price: '¥99',
    period: '/月',
    analyses: '1000次/月',
    color: 'purple',
    features: ['所有数据访问', '最快分析速度', '高级技术分析', '多模型选择', 'GPT-4o Mini'],
  },
  {
    tier: 'enterprise',
    name: '企业版',
    price: '¥299',
    period: '/月',
    analyses: '无限',
    color: 'gold',
    features: ['无限AI分析', '专属客户支持', 'API访问', '白标定制', 'GPT-4o & Claude'],
  },
];

// 设置分类
const SETTINGS_TABS = [
  { id: 'profile', name: '账户信息', icon: User },
  { id: 'subscription', name: '订阅管理', icon: CreditCard },
  { id: 'language', name: '语言设置', icon: Globe },
  { id: 'model', name: '模型偏好', icon: Brain },
  { id: 'notifications', name: '通知设置', icon: Bell },
  { id: 'security', name: '安全设置', icon: Shield },
];

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [usageStats, setUsageStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 重定向未登录用户
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/settings');
    }
  }, [status, router]);
  
  // 获取使用统计
  useEffect(() => {
    if (session?.user?.id) {
      fetchUsageStats();
    }
  }, [session]);
  
  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/user/usage');
      const data = await response.json();
      if (data.success) {
        setUsageStats(data.data);
      }
    } catch (err) {
      console.error('获取使用统计失败:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/');
  };
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-gray-600">加载中...</span>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return null;
  }
  
  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.tier === usageStats?.tier) || SUBSCRIPTION_PLANS[0];
  
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
              <span className="text-gray-600">{session.user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>退出</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* 侧边栏 */}
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="space-y-1">
                {SETTINGS_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>
          
          {/* 主内容区 */}
          <main className="flex-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              
              {/* 账户信息 */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">账户信息</h2>
                  
                  <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{session.user?.name}</h3>
                      <p className="text-gray-600">{session.user?.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        <span className={`text-sm font-medium ${
                          currentPlan.tier === 'enterprise' ? 'text-yellow-600' :
                          currentPlan.tier === 'pro' ? 'text-purple-600' :
                          currentPlan.tier === 'basic' ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {currentPlan.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* 订阅管理 */}
              {activeTab === 'subscription' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">订阅管理</h2>
                  
                  {/* 当前计划 */}
                  <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm">当前计划</p>
                        <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
                        <p className="mt-2 text-white/90">
                          {currentPlan.price}{currentPlan.period} • {currentPlan.analyses}
                        </p>
                      </div>
                      <div className="text-right">
                        {usageStats && (
                          <>
                            <p className="text-white/80 text-sm">本月已使用</p>
                            <p className="text-3xl font-bold">
                              {usageStats.analysesThisMonth}/{usageStats.monthlyLimit === -1 ? '∞' : usageStats.monthlyLimit}
                            </p>
                            <p className="text-white/80 text-sm mt-1">次分析</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* 升级选项 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">升级计划</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {SUBSCRIPTION_PLANS.filter(p => p.tier !== currentPlan.tier).map((plan) => (
                        <div 
                          key={plan.tier}
                          className={`p-6 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg ${
                            plan.color === 'blue' ? 'border-blue-200 bg-blue-50' :
                            plan.color === 'purple' ? 'border-purple-200 bg-purple-50' :
                            'border-yellow-200 bg-yellow-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-bold text-gray-800">{plan.name}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              plan.color === 'blue' ? 'bg-blue-500 text-white' :
                              plan.color === 'purple' ? 'bg-purple-500 text-white' :
                              'bg-yellow-500 text-white'
                            }`}>
                              {plan.price}{plan.period}
                            </span>
                          </div>
                          <ul className="space-y-2 mb-4">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <button className={`w-full py-2 rounded-xl font-medium transition-colors ${
                            plan.color === 'blue' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                            plan.color === 'purple' ? 'bg-purple-500 text-white hover:bg-purple-600' :
                            'bg-yellow-500 text-white hover:bg-yellow-600'
                          }`}>
                            升级
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* 语言设置 */}
              {activeTab === 'language' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">语言设置</h2>
                  <LanguageSettings />
                </div>
              )}
              
              {/* 模型偏好 */}
              {activeTab === 'model' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">模型偏好</h2>
                  <ModelPreferences availableModels={usageStats?.availableModels || []} />
                </div>
              )}
              
              {/* 通知设置 */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">通知设置</h2>
                  <p className="text-gray-600">通知功能开发中...</p>
                </div>
              )}
              
              {/* 安全设置 */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">安全设置</h2>
                  <p className="text-gray-600">安全功能开发中...</p>
                </div>
              )}
              
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
