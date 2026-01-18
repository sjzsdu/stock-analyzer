/**
 * 分析历史记录组件
 * 
 * 展示用户的历史分析记录
 * 
 * @module components/history/AnalysisHistory
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  History, 
  Search, 
  Filter,
  Star,
  StarOff,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Calendar,
  BarChart2,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface AnalysisRecord {
  _id: string;
  symbol: string;
  analysisDate: string;
  analysisType: string;
  result: {
    overallScore: number;
    recommendation: string;
    summary: string;
    keyFactors: string[];
  };
  isFavorite: boolean;
  cache: {
    isCached: boolean;
    cacheExpiry: string;
  };
}

interface AnalysisHistoryProps {
  limit?: number;
  showHeader?: boolean;
  onRecordClick?: (record: AnalysisRecord) => void;
}

const RECOMMENDATION_CONFIG = {
  strong_buy: { label: '强烈买入', color: 'bg-green-500', textColor: 'text-green-600' },
  buy: { label: '买入', color: 'bg-green-300', textColor: 'text-green-600' },
  hold: { label: '持有', color: 'bg-gray-300', textColor: 'text-gray-600' },
  wait: { label: '观望', color: 'bg-yellow-300', textColor: 'text-yellow-600' },
  sell: { label: '卖出', color: 'bg-red-300', textColor: 'text-red-600' },
  strong_sell: { label: '强烈卖出', color: 'bg-red-500', textColor: 'text-red-600' },
};

function RecommendationBadge({ recommendation }: { recommendation: string }) {
  const config = RECOMMENDATION_CONFIG[recommendation as keyof typeof RECOMMENDATION_CONFIG];
  if (!config) return null;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} ${config.textColor}`}>
      {config.label}
    </span>
  );
}

function ScoreIndicator({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-600 bg-green-100';
    if (s >= 60) return 'text-blue-600 bg-blue-100';
    if (s >= 40) return 'text-yellow-600 bg-yellow-100';
    if (s >= 20) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };
  
  const getTrend = (s: number) => {
    if (s >= 80) return <TrendingUp className="w-4 h-4" />;
    if (s <= 20) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };
  
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${getColor(score)}`}>
      {getTrend(score)}
      <span className="font-bold">{score}</span>
    </div>
  );
}

export default function AnalysisHistory({ 
  limit = 10,
  showHeader = true,
  onRecordClick 
}: AnalysisHistoryProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  
  // 获取分析历史
  const fetchHistory = async (page = 1) => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/history');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (searchQuery) {
        params.set('symbol', searchQuery.toUpperCase());
      }
      
      if (filterFavorites) {
        params.set('favoritesOnly', 'true');
      }
      
      const response = await fetch(`/api/user/history?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setRecords(data.data);
        setPagination(prev => ({
          ...prev,
          page: data.pagination.page,
          totalPages: data.pagination.totalPages,
          total: data.pagination.total,
        }));
      } else {
        setError(data.error || '获取历史记录失败');
      }
      
      // 获取统计信息
      await fetchStats();
      
    } catch (err) {
      setError('获取历史记录失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 获取统计信息
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/user/history/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('获取统计失败:', err);
    }
  };
  
  // 初始化加载
  useEffect(() => {
    if (status === 'authenticated') {
      fetchHistory();
    }
  }, [status]);
  
  // 切换收藏
  const handleToggleFavorite = async (e: React.MouseEvent, recordId: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      const response = await fetch('/api/user/history', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: recordId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 更新本地状态
        setRecords(prev => prev.map(r => 
          r._id === recordId 
            ? { ...r, isFavorite: data.data.isFavorite }
            : r
        ));
      }
    } catch (err) {
      console.error('切换收藏失败:', err);
    }
  };
  
  // 处理记录点击
  const handleRecordClick = (record: AnalysisRecord) => {
    if (onRecordClick) {
      onRecordClick(record);
    } else {
      // 默认跳转到分析详情页，带上日期参数
      router.push(`/analyze/${record.symbol}?history=${record._id}&date=${encodeURIComponent(record.analysisDate)}`);
    }
  };
  
  // 筛选后的记录
  const filteredRecords = searchQuery
    ? records.filter(r => r.symbol.toUpperCase().includes(searchQuery.toUpperCase()))
    : records;
  
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-gray-600">加载分析历史...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* 头部 */}
      {showHeader && (
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5" />
                分析历史
              </h2>
              <p className="text-white/80 text-sm mt-1">
                {stats?.totalAnalyses || 0} 次分析记录
              </p>
            </div>
            
            {/* 统计信息 */}
            {stats && (
              <div className="flex gap-4 text-white/90 text-sm">
                <div className="text-center">
                  <p className="font-bold text-lg">{stats.uniqueSymbols}</p>
                  <p className="text-xs text-white/70">只股票</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">{stats.avgScore}</p>
                  <p className="text-xs text-white/70">平均分</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">{stats.favoritesCount}</p>
                  <p className="text-xs text-white/70">收藏</p>
                </div>
              </div>
            )}
          </div>
          
          {/* 搜索和筛选 */}
          <div className="flex gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索股票代码..."
                className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            
            <button
              onClick={() => setFilterFavorites(!filterFavorites)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                filterFavorites 
                  ? 'bg-yellow-400 text-yellow-900' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Star className="w-4 h-4" />
              <span className="text-sm">仅收藏</span>
            </button>
          </div>
        </div>
      )}
      
      {/* 错误提示 */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      {/* 记录列表 */}
      <div className="divide-y divide-gray-100">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center">
            <History className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">
              {filterFavorites ? '暂无收藏的分析记录' : '暂无分析记录'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              开始分析
            </Link>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div
              key={record._id}
              onClick={() => handleRecordClick(record)}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* 股票代码 */}
                <Link
                  href={`/analyze/${record.symbol}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-lg font-bold text-indigo-600 hover:text-indigo-700"
                >
                  {record.symbol}
                  <ChevronRight className="w-4 h-4" />
                </Link>
                
                {/* 推荐 */}
                <RecommendationBadge recommendation={record.result.recommendation} />
                
                {/* 分数 */}
                <ScoreIndicator score={record.result.overallScore} />
                
                {/* 日期 */}
                <div className="flex items-center gap-1 text-sm text-gray-500 ml-auto">
                  <Calendar className="w-4 h-4" />
                  {new Date(record.analysisDate).toLocaleDateString()}
                </div>
                
                {/* 收藏按钮 */}
                <button
                  onClick={(e) => handleToggleFavorite(e, record._id)}
                  className={`p-1 rounded-lg transition-colors ${
                    record.isFavorite
                      ? 'text-yellow-500 hover:text-yellow-600'
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                >
                  {record.isFavorite ? (
                    <Star className="w-5 h-5 fill-current" />
                  ) : (
                    <StarOff className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* 摘要 */}
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {record.result.summary}
              </p>
              
              {/* 关键因素 */}
              {record.result.keyFactors.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {record.result.keyFactors.slice(0, 3).map((factor, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
          <p className="text-sm text-gray-600">
            共 {pagination.total} 条记录
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchHistory(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <button
              onClick={() => fetchHistory(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
