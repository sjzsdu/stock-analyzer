'use client';

import { TrendingUp, TrendingDown, Building2, LineChart, DollarSign, Percent, PieChart, Calendar } from 'lucide-react';

interface StockBasic {
  name?: string;
  symbol?: string;
  market?: string;
  industry?: string;
}

interface StockOverviewProps {
  basic: StockBasic;
  currentPrice: number;
  changePercent: number;
  changeAmount: number;
  previousClose: number;
  volume: number;
  turnover: number;
  marketCap: string;
  circulatingCap: string;
  pe?: number;
  pb?: number;
  dividend?: number;
  roe?: number;
  high52w?: number;
  low52w?: number;
  latestNews?: string[];
  // 新增技术指标
  technicalIndicators?: {
    rsi?: number;
    macd?: number;
    macd_signal?: number;
    bollinger_upper?: number;
    bollinger_lower?: number;
    ma_5?: number;
    ma_20?: number;
  };
}

export default function StockOverviewCard({
  basic,
  currentPrice,
  changePercent,
  changeAmount,
  previousClose,
  volume,
  turnover,
  marketCap,
  circulatingCap,
  pe,
  pb,
  dividend,
  roe,
  high52w,
  low52w,
  latestNews = [],
  technicalIndicators
}: StockOverviewProps) {
  
  const isPositive = changePercent >= 0;
  
  // 颜色：上涨红色，下跌绿色（符合A股习惯）
  const priceColor = isPositive ? 'text-red-400' : 'text-green-400';
  const trendColor = isPositive ? 'text-red-400' : 'text-green-400';
  const trendBg = isPositive ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20';
  
  // 计算价格位置百分比
  const pricePosition = high52w && low52w 
    ? ((currentPrice - low52w) / (high52w - low52w)) * 100 
    : 50;

  // 格式化大数字
  const formatNumber = (num: number) => {
    if (!num || num === 0) return '--';
    if (num >= 100000000) return (num / 100000000).toFixed(2) + '亿';
    if (num >= 10000) return (num / 10000).toFixed(2) + '万';
    return num.toLocaleString();
  };

  // 格式化市值（支持字符串或数字）
  const formatMarketCap = (cap: string | number | undefined) => {
    if (!cap || cap === '--') return '--';
    const num = typeof cap === 'string' ? parseFloat(cap) : cap;
    if (!num || num === 0) return '--';
    if (num >= 100000000000) return (num / 100000000000).toFixed(2) + '万亿';
    if (num >= 100000000) return (num / 100000000).toFixed(2) + '亿';
    if (num >= 10000) return (num / 10000).toFixed(2) + '万';
    return num.toLocaleString();
  };

  return (
    <div className="glass-effect rounded-3xl p-6 card-hover">
      {/* 头部：基本信息 */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{basic.name || basic.symbol}</h2>
              <span className="text-white/60 text-lg">{basic.symbol}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                {basic.industry || '未知行业'}
              </span>
              <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                {basic.market === 'A' ? 'A股' : basic.market === 'HK' ? '港股' : '美股'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="w-6 h-6 text-red-400" />
            ) : (
              <TrendingDown className="w-6 h-6 text-green-400" />
            )}
            <span className={`text-3xl font-bold ${priceColor}`}>
              ¥{currentPrice.toFixed(2)}
            </span>
          </div>
          <div className={`flex items-center justify-end gap-2 mt-1 ${trendColor}`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-medium">
              {isPositive ? '+' : ''}{changeAmount.toFixed(2)} ({changePercent.toFixed(2)}%)
            </span>
          </div>
          <div className="text-white/50 text-sm mt-1">
            昨日收盘: ¥{previousClose.toFixed(2)}
          </div>
        </div>
      </div>

      {/* 实时行情数据条 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-white/60 mb-1">
            <LineChart className="w-4 h-4" />
            <span className="text-sm">成交量</span>
          </div>
          <div className="text-xl font-bold text-white">{formatNumber(volume)}</div>
          <div className="text-white/40 text-xs">手</div>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-white/60 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">成交额</span>
          </div>
          <div className="text-xl font-bold text-white">{formatNumber(turnover)}</div>
          <div className="text-white/40 text-xs">元</div>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-white/60 mb-1">
            <PieChart className="w-4 h-4" />
            <span className="text-sm">市值</span>
          </div>
          <div className="text-xl font-bold text-white">{formatMarketCap(marketCap)}</div>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-white/60 mb-1">
            <Percent className="w-4 h-4" />
            <span className="text-sm">流通市值</span>
          </div>
          <div className="text-xl font-bold text-white">{formatMarketCap(circulatingCap)}</div>
        </div>
      </div>

      {/* 估值指标和价格区间 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 估值指标 */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-400" />
            估值指标
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between items-center">
              <span className="text-white/60">PE(TTM)</span>
              <span className={`font-bold ${pe && pe < 10 ? 'text-green-400' : pe && pe < 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                {pe?.toFixed(2) || '--'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">PB</span>
              <span className={`font-bold ${pb && pb < 1 ? 'text-green-400' : pb && pb < 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                {pb?.toFixed(2) || '--'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">股息率</span>
              <span className="font-bold text-white">
                {dividend ? `${dividend.toFixed(2)}%` : '--'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">ROE</span>
              <span className={`font-bold ${roe && roe > 10 ? 'text-green-400' : 'text-white'}`}>
                {roe ? `${roe.toFixed(2)}%` : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* 价格区间 */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            价格区间（52周）
          </h3>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/60">¥{low52w?.toFixed(2) || '--'}</span>
              <span className="text-white/40">52周范围</span>
              <span className="text-white/60">¥{high52w?.toFixed(2) || '--'}</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all duration-500"
                style={{ width: '100%' }}
              />
              {/* 价格位置标记 */}
              <div 
                className="w-1 h-4 bg-white rounded-full -mt-3.5 relative"
                style={{ left: `${pricePosition}%`, transform: 'translateX(-50%)' }}
              />
            </div>
            <div className="text-center mt-2">
              <span className="text-white font-medium">
                当前价格位于 {pricePosition.toFixed(0)}% 分位
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 技术指标 */}
      {technicalIndicators && (
        <div className="bg-white/5 rounded-xl p-5 border border-white/10 mt-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-green-400" />
            技术指标
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* RSI */}
            {technicalIndicators.rsi !== undefined && (
              <div className="text-center">
                <div className="text-white/60 text-sm mb-1">RSI(14)</div>
                <div className={`font-bold text-lg ${
                  technicalIndicators.rsi >= 70 ? 'text-red-400' :
                  technicalIndicators.rsi >= 60 ? 'text-orange-400' :
                  technicalIndicators.rsi >= 40 ? 'text-yellow-400' :
                  technicalIndicators.rsi >= 30 ? 'text-orange-400' :
                  'text-green-400'
                }`}>
                  {technicalIndicators.rsi.toFixed(1)}
                </div>
                <div className="text-white/40 text-xs">
                  {technicalIndicators.rsi >= 70 ? '超买' :
                   technicalIndicators.rsi >= 60 ? '强势' :
                   technicalIndicators.rsi >= 40 ? '震荡' :
                   technicalIndicators.rsi >= 30 ? '弱势' : '超卖'}
                </div>
              </div>
            )}

            {/* MACD */}
            {technicalIndicators.macd !== undefined && (
              <div className="text-center">
                <div className="text-white/60 text-sm mb-1">MACD</div>
                <div className={`font-bold text-lg ${
                  technicalIndicators.macd > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {technicalIndicators.macd.toFixed(3)}
                </div>
                <div className="text-white/40 text-xs">
                  {technicalIndicators.macd > 0 ? '多头' : '空头'}
                </div>
              </div>
            )}

            {/* 布林带位置 */}
            {technicalIndicators.bollinger_upper !== undefined && technicalIndicators.bollinger_lower !== undefined && (
              <div className="text-center">
                <div className="text-white/60 text-sm mb-1">布林带</div>
                <div className={`font-bold text-lg ${
                  currentPrice >= technicalIndicators.bollinger_upper ? 'text-red-400' :
                  currentPrice <= technicalIndicators.bollinger_lower ? 'text-green-400' :
                  'text-yellow-400'
                }`}>
                  {currentPrice >= technicalIndicators.bollinger_upper ? '上轨' :
                   currentPrice <= technicalIndicators.bollinger_lower ? '下轨' : '中轨'}
                </div>
                <div className="text-white/40 text-xs">
                  {currentPrice >= technicalIndicators.bollinger_upper ? '压力' :
                   currentPrice <= technicalIndicators.bollinger_lower ? '支撑' : '平衡'}
                </div>
              </div>
            )}

            {/* MA对比 */}
            {technicalIndicators.ma_5 !== undefined && technicalIndicators.ma_20 !== undefined && (
              <div className="text-center">
                <div className="text-white/60 text-sm mb-1">均线</div>
                <div className={`font-bold text-lg ${
                  technicalIndicators.ma_5 > technicalIndicators.ma_20 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {technicalIndicators.ma_5 > technicalIndicators.ma_20 ? '多头' : '空头'}
                </div>
                <div className="text-white/40 text-xs">
                  MA5 vs MA20
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 最新动态 */}
      {latestNews.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span className="text-lg">📰</span>
            最新动态
          </h3>
          <div className="space-y-2">
            {latestNews.slice(0, 3).map((news, idx) => (
              <div key={idx} className="flex items-start gap-3 text-white/70 text-sm">
                <span className="text-purple-400 mt-1">•</span>
                <span>{news}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
