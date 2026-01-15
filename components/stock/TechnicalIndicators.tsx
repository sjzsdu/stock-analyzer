/**
 * 技术指标组件
 *
 * 展示移动平均线、振荡器、布林带等技术指标
 *
 * @module components/stock/TechnicalIndicators
 */

'use client';

import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Target,
  Zap,
  Waves,
  Eye
} from 'lucide-react';

interface TechnicalIndicatorsProps {
  data: {
    // 移动平均线
    ma_5?: number;
    ma_10?: number;
    ma_20?: number;
    ma_60?: number;
    ma_120?: number;

    // 振荡器
    rsi?: number;
    macd?: number;
    macd_signal?: number;
    macd_hist?: number;

    // 布林带
    bollinger_upper?: number;
    bollinger_middle?: number;
    bollinger_lower?: number;

    // 其他指标
    atr?: number;
    obv?: number;
  };
  currentPrice?: number;
  symbol: string;
}

function IndicatorCard({
  title,
  icon: Icon,
  children,
  trend
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}) {
  const trendColors = {
    up: 'border-green-500/30 bg-green-500/5',
    down: 'border-red-500/30 bg-red-500/5',
    neutral: 'border-blue-500/30 bg-blue-500/5'
  };

  return (
    <div className={`rounded-xl p-4 border ${trend ? trendColors[trend] : 'border-white/10 bg-white/5'}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-purple-400" />
        <h4 className="font-medium text-white/90">{title}</h4>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function IndicatorRow({
  label,
  value,
  unit = '',
  compareValue,
  showTrend = true
}: {
  label: string;
  value?: number;
  unit?: string;
  compareValue?: number;
  showTrend?: boolean;
}) {
  if (value === undefined || value === null) {
    return (
      <div className="flex justify-between items-center">
        <span className="text-sm text-white/60">{label}</span>
        <span className="text-white/40">--</span>
      </div>
    );
  }

  let trend: 'up' | 'down' | 'neutral' = 'neutral';
  if (showTrend && compareValue !== undefined) {
    if (value > compareValue) trend = 'up';
    else if (value < compareValue) trend = 'down';
  }

  const trendIcons = {
    up: <TrendingUp className="w-3 h-3 text-green-400" />,
    down: <TrendingDown className="w-3 h-3 text-red-400" />,
    neutral: null
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-white/60">{label}</span>
      <div className="flex items-center gap-1">
        {showTrend && trendIcons[trend]}
        <span className={`font-medium ${
          trend === 'up' ? 'text-green-400' :
          trend === 'down' ? 'text-red-400' :
          'text-white/90'
        }`}>
          {value.toFixed(2)}{unit}
        </span>
      </div>
    </div>
  );
}

function getRSIStatus(rsi?: number): { status: string; color: string; description: string } {
  if (!rsi) return { status: '未知', color: 'text-white/40', description: '' };

  if (rsi >= 70) return {
    status: '超买',
    color: 'text-red-400',
    description: '可能存在回调风险'
  };
  if (rsi >= 60) return {
    status: '强势',
    color: 'text-orange-400',
    description: '上涨动能较强'
  };
  if (rsi >= 40) return {
    status: '震荡',
    color: 'text-yellow-400',
    description: '价格在合理区间'
  };
  if (rsi >= 30) return {
    status: '弱势',
    color: 'text-orange-400',
    description: '下跌动能较强'
  };
  return {
    status: '超卖',
    color: 'text-green-400',
    description: '可能存在反弹机会'
  };
}

function getMACDStatus(macd?: number, signal?: number, hist?: number): { status: string; color: string; description: string } {
  if (!macd || !signal || !hist) return { status: '未知', color: 'text-white/40', description: '' };

  if (hist > 0 && macd > signal) return {
    status: '多头',
    color: 'text-green-400',
    description: '上涨趋势明显'
  };
  if (hist < 0 && macd < signal) return {
    status: '空头',
    color: 'text-red-400',
    description: '下跌趋势明显'
  };
  return {
    status: '震荡',
    color: 'text-yellow-400',
    description: '趋势不明确'
  };
}

export default function TechnicalIndicators({ data, currentPrice, symbol }: TechnicalIndicatorsProps) {
  const {
    ma_5, ma_10, ma_20, ma_60, ma_120,
    rsi, macd, macd_signal, macd_hist,
    bollinger_upper, bollinger_middle, bollinger_lower,
    atr, obv
  } = data || {};

  // 计算布林带位置
  let bollingerPosition = '未知';
  let bollingerColor = 'text-white/40';
  if (currentPrice && bollinger_upper && bollinger_lower) {
    if (currentPrice >= bollinger_upper) {
      bollingerPosition = '上轨';
      bollingerColor = 'text-red-400';
    } else if (currentPrice <= bollinger_lower) {
      bollingerPosition = '下轨';
      bollingerColor = 'text-green-400';
    } else {
      bollingerPosition = '中轨';
      bollingerColor = 'text-yellow-400';
    }
  }

  const rsiStatus = getRSIStatus(rsi);
  const macdStatus = getMACDStatus(macd, macd_signal, macd_hist);

  return (
    <div className="glass-effect rounded-3xl overflow-hidden card-hover">
      {/* 标题 */}
      <div className="px-6 py-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          技术指标分析
        </h3>
        <p className="text-white/60 text-sm mt-1">{symbol}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* 移动平均线 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <IndicatorCard title="移动平均线" icon={TrendingUp}>
            <IndicatorRow label="MA5" value={ma_5} compareValue={currentPrice} />
            <IndicatorRow label="MA10" value={ma_10} compareValue={currentPrice} />
            <IndicatorRow label="MA20" value={ma_20} compareValue={currentPrice} />
            <IndicatorRow label="MA60" value={ma_60} compareValue={currentPrice} />
            <IndicatorRow label="MA120" value={ma_120} compareValue={currentPrice} />
          </IndicatorCard>

          {/* RSI指标 */}
          <IndicatorCard
            title="RSI 相对强弱指数"
            icon={Activity}
            trend={rsi && rsi >= 70 ? 'down' : rsi && rsi <= 30 ? 'up' : 'neutral'}
          >
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-white/60">RSI(14)</span>
                <span className={`font-bold text-lg ${rsiStatus.color}`}>
                  {rsi?.toFixed(2) || '--'}
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    rsi && rsi >= 70 ? 'bg-red-500' :
                    rsi && rsi >= 60 ? 'bg-orange-500' :
                    rsi && rsi >= 40 ? 'bg-yellow-500' :
                    rsi && rsi >= 30 ? 'bg-orange-400' :
                    rsi ? 'bg-green-500' : 'bg-white/20'
                  }`}
                  style={{ width: rsi ? `${Math.min(rsi, 100)}%` : '0%' }}
                ></div>
              </div>
            </div>
            <div className="text-xs text-white/50">
              <span className={`font-medium ${rsiStatus.color}`}>{rsiStatus.status}</span>
              {rsiStatus.description && <span className="ml-1">• {rsiStatus.description}</span>}
            </div>
          </IndicatorCard>
        </div>

        {/* MACD指标 */}
        {(macd !== undefined || macd_signal !== undefined || macd_hist !== undefined) && (
          <IndicatorCard
            title="MACD 指数平滑异同移动平均线"
            icon={Waves}
            trend={macd_hist && macd_hist > 0 ? 'up' : macd_hist && macd_hist < 0 ? 'down' : 'neutral'}
          >
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center">
                <div className="text-xs text-white/60 mb-1">MACD</div>
                <div className={`font-bold ${macd && macd > 0 ? 'text-green-400' : macd && macd < 0 ? 'text-red-400' : 'text-white/90'}`}>
                  {macd?.toFixed(4) || '--'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-white/60 mb-1">Signal</div>
                <div className={`font-bold ${macd_signal && macd_signal > 0 ? 'text-green-400' : macd_signal && macd_signal < 0 ? 'text-red-400' : 'text-white/90'}`}>
                  {macd_signal?.toFixed(4) || '--'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-white/60 mb-1">Histogram</div>
                <div className={`font-bold ${macd_hist && macd_hist > 0 ? 'text-green-400' : macd_hist && macd_hist < 0 ? 'text-red-400' : 'text-white/90'}`}>
                  {macd_hist?.toFixed(4) || '--'}
                </div>
              </div>
            </div>
            <div className="text-xs text-white/50">
              <span className={`font-medium ${macdStatus.color}`}>{macdStatus.status}</span>
              {macdStatus.description && <span className="ml-1">• {macdStatus.description}</span>}
            </div>
          </IndicatorCard>
        )}

        {/* 布林带 */}
        {(bollinger_upper !== undefined || bollinger_middle !== undefined || bollinger_lower !== undefined) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IndicatorCard title="布林带 (Bollinger Bands)" icon={Target}>
              <IndicatorRow label="上轨" value={bollinger_upper} />
              <IndicatorRow label="中轨" value={bollinger_middle} />
              <IndicatorRow label="下轨" value={bollinger_lower} />
              {currentPrice && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">价格位置</span>
                    <span className={`font-medium ${bollingerColor}`}>
                      {bollingerPosition}
                    </span>
                  </div>
                </div>
              )}
            </IndicatorCard>

            {/* 其他指标 */}
            <IndicatorCard title="其他指标" icon={Zap}>
              <IndicatorRow label="ATR(14)" value={atr} unit="" />
              <IndicatorRow label="OBV" value={obv} unit="" showTrend={false} />
            </IndicatorCard>
          </div>
        )}

        {/* 技术分析总结 */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-5 h-5 text-purple-400" />
            <h4 className="font-medium text-white/90">技术分析总结</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-white/60 mb-1">趋势强度</div>
              <div className={`font-medium ${
                (macd_hist && macd_hist > 0) || (rsi && rsi > 60) ? 'text-green-400' :
                (macd_hist && macd_hist < 0) || (rsi && rsi < 40) ? 'text-red-400' :
                'text-yellow-400'
              }`}>
                {((macd_hist && macd_hist > 0) || (rsi && rsi > 60)) ? '强势' :
                 ((macd_hist && macd_hist < 0) || (rsi && rsi < 40)) ? '弱势' :
                 '震荡'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/60 mb-1">支撑阻力</div>
              <div className={`font-medium ${bollingerColor}`}>
                {bollingerPosition === '上轨' ? '压力位' :
                 bollingerPosition === '下轨' ? '支撑位' :
                 '中性区间'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/60 mb-1">波动性</div>
              <div className={`font-medium ${
                atr && atr > 2 ? 'text-red-400' :
                atr && atr > 1 ? 'text-yellow-400' :
                atr ? 'text-green-400' : 'text-white/40'
              }`}>
                {atr && atr > 2 ? '高波动' :
                 atr && atr > 1 ? '中波动' :
                 atr ? '低波动' : '未知'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}