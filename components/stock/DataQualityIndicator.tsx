/**
 * 数据质量指标组件
 *
 * 显示数据采集的质量、时效性和完整性
 *
 * @module components/stock/DataQualityIndicator
 */

'use client';

import { CheckCircle, AlertTriangle, Clock, Database, TrendingUp } from 'lucide-react';

interface DataQualityIndicatorProps {
  data: {
    timestamp?: string;
    data_source?: string;
    symbol?: string;
    market?: string;
    // 数据完整性指标
    has_basic?: boolean;
    has_kline?: boolean;
    has_technical?: boolean;
    has_financial?: boolean;
    has_news?: boolean;
    // 数据质量分数
    quality_score?: number;
  };
}

function getQualityColor(score: number): string {
  if (score >= 90) return 'text-green-400 bg-green-500/10 border-green-500/30';
  if (score >= 70) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
  if (score >= 50) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
  return 'text-red-400 bg-red-500/10 border-red-500/30';
}

function getQualityLabel(score: number): string {
  if (score >= 90) return '优秀';
  if (score >= 70) return '良好';
  if (score >= 50) return '一般';
  return '较差';
}

function formatTimeAgo(timestamp: string): string {
  try {
    const now = new Date();
    const dataTime = new Date(timestamp);
    const diffMs = now.getTime() - dataTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return '刚刚更新';
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return dataTime.toLocaleDateString('zh-CN');
  } catch {
    return '未知';
  }
}

export default function DataQualityIndicator({ data }: DataQualityIndicatorProps) {
  const {
    timestamp,
    data_source,
    symbol,
    market,
    has_basic = false,
    has_kline = false,
    has_technical = false,
    has_financial = false,
    has_news = false,
    quality_score = 0
  } = data;

  // 计算数据完整性
  const dataItems = [
    { key: 'basic', label: '基本信息', has: has_basic },
    { key: 'kline', label: 'K线数据', has: has_kline },
    { key: 'technical', label: '技术指标', has: has_technical },
    { key: 'financial', label: '财务数据', has: has_financial },
    { key: 'news', label: '新闻资讯', has: has_news }
  ];

  const completedItems = dataItems.filter(item => item.has).length;
  const totalItems = dataItems.length;
  const completeness = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="glass-effect rounded-3xl overflow-hidden card-hover">
      {/* 标题 */}
      <div className="px-6 py-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          数据质量指标
        </h3>
        <p className="text-white/60 text-sm mt-1">
          {symbol} • {market} • {data_source || '未知来源'}
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 数据质量总分 */}
          <div className="space-y-4">
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
                getQualityColor(quality_score || completeness)
              }`}>
                <span className="text-2xl font-bold">
                  {quality_score || completeness}
                </span>
                <span className="text-sm">分</span>
              </div>
              <p className="text-white/60 text-sm mt-2">
                {getQualityLabel(quality_score || completeness)}
              </p>
            </div>

            {/* 数据时效性 */}
            {timestamp && (
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-white/90 font-medium">数据时效</span>
                </div>
                <p className="text-white/70 text-sm">
                  {formatTimeAgo(timestamp)}
                </p>
                <p className="text-white/50 text-xs mt-1">
                  更新时间: {new Date(timestamp).toLocaleString('zh-CN')}
                </p>
              </div>
            )}
          </div>

          {/* 数据完整性 */}
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-white/90 font-medium">数据完整性</span>
                <span className="text-white/60 text-sm ml-auto">
                  {completedItems}/{totalItems}
                </span>
              </div>

              <div className="space-y-2">
                {dataItems.map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">{item.label}</span>
                    {item.has ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">完整度</span>
                  <span className="text-white/90 font-medium">
                    {completeness}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: `${completeness}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 数据来源信息 */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-white/60 mb-1">数据来源</div>
              <div className="text-white/90 font-medium">{data_source || '未知'}</div>
            </div>
            <div className="text-center">
              <div className="text-white/60 mb-1">市场类型</div>
              <div className="text-white/90 font-medium">{market || '未知'}</div>
            </div>
            <div className="text-center">
              <div className="text-white/60 mb-1">股票代码</div>
              <div className="text-white/90 font-medium">{symbol || '未知'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}