/**
 * 财务指标组件
 * 
 * 展示估值、盈利能力、成长性、偿债能力等财务指标
 * 
 * @module components/stock/FinancialMetrics
 */

'use client';

import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  DollarSign,
  Percent,
  BarChart3,
  PieChart,
  Activity,
  Target
} from 'lucide-react';

interface FinancialMetricsProps {
  data: {
    // 估值指标
    valuation?: {
      marketCap?: number;
      pe?: number;
      pb?: number;
      ps?: number;
      ev?: number;
      dividendYield?: number;
      eps?: number;
    };
    
    // 财务指标
    financial?: {
      // 盈利能力
      roe?: number;
      netProfitMargin?: number;
      grossProfitMargin?: number;
      
      // 成长性
      revenueYoy?: number;
      profitYoy?: number;
      
      // 偿债能力
      currentRatio?: number;
      quickRatio?: number;
      debtToEquity?: number;
    };
    
    // 杜邦分析
    dupont?: {
      roe?: number;
      netProfitMargin?: number;
      totalAssetTurnover?: number;
      equityMultiplier?: number;
    };
  };
  symbol: string;
}

function TrendIndicator({ value, suffix = '' }: { value?: number; suffix?: string }) {
  if (value === undefined || value === null) {
    return (
      <span className="flex items-center gap-1 text-gray-400">
        <Minus className="w-4 h-4" />
        <span>--</span>
      </span>
    );
  }
  
  const isPositive = value > 0;
  const isNegative = value < 0;
  
  return (
    <span className={`flex items-center gap-1 font-medium ${
      isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
    }`}>
      {isPositive && <TrendingUp className="w-4 h-4" />}
      {isNegative && <TrendingDown className="w-4 h-4" />}
      <span>
        {isNegative ? '' : ''}
        {value.toFixed(2)}{suffix}
      </span>
    </span>
  );
}

function MetricCard({ 
  title, 
  icon: Icon, 
  children 
}: { 
  title: string; 
  icon: any; 
  children: React.ReactNode 
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-indigo-600" />
        <h4 className="font-medium text-gray-800">{title}</h4>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function MetricRow({ label, value, unit = '' }: { label: string; value?: number; unit?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}</span>
      <TrendIndicator value={value} suffix={unit} />
    </div>
  );
}

export default function FinancialMetrics({ data, symbol }: FinancialMetricsProps) {
  const { valuation, financial, dupont } = data || {};
  
  if (!valuation && !financial && !dupont) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          财务指标
        </h3>
        <p className="text-gray-500 text-center py-8">
          暂无财务指标数据
        </p>
      </div>
    );
  }
  
  // 格式化市值
  const formatMarketCap = (value?: number) => {
    if (!value) return '--';
    if (value >= 1000000000000) {
      return `${(value / 1000000000000).toFixed(2)}万亿`;
    } else if (value >= 100000000) {
      return `${(value / 100000000).toFixed(2)}亿`;
    } else if (value >= 10000) {
      return `${(value / 10000).toFixed(2)}万`;
    }
    return value.toLocaleString();
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* 标题 */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          财务指标
        </h3>
        <p className="text-white/80 text-sm mt-1">{symbol}</p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* 估值指标 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 市值 */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-indigo-600" />
              <span className="text-sm text-gray-600">总市值</span>
            </div>
            <p className="text-xl font-bold text-gray-800">
              {formatMarketCap(valuation?.marketCap)}
            </p>
          </div>
          
          {/* 市盈率 */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">市盈率</span>
            </div>
            <p className="text-xl font-bold text-gray-800">
              {valuation?.pe?.toFixed(2) || '--'}
            </p>
          </div>
          
          {/* 市净率 */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">市净率</span>
            </div>
            <p className="text-xl font-bold text-gray-800">
              {valuation?.pb?.toFixed(2) || '--'}
            </p>
          </div>
          
          {/* 股息率 */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600">股息率</span>
            </div>
            <p className="text-xl font-bold text-gray-800">
              {valuation?.dividendYield ? `${valuation.dividendYield.toFixed(2)}%` : '--'}
            </p>
          </div>
        </div>
        
        {/* 详细指标网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 盈利能力 */}
          <MetricCard title="盈利能力" icon={Activity}>
            <MetricRow label="净资产收益率" value={financial?.roe} unit="%" />
            <MetricRow label="净利率" value={financial?.netProfitMargin} unit="%" />
            <MetricRow label="毛利率" value={financial?.grossProfitMargin} unit="%" />
          </MetricCard>
          
          {/* 成长性 */}
          <MetricCard title="成长能力" icon={TrendingUp}>
            <MetricRow label="营收增长" value={financial?.revenueYoy} unit="%" />
            <MetricRow label="利润增长" value={financial?.profitYoy} unit="%" />
          </MetricCard>
          
          {/* 偿债能力 */}
          <MetricCard title="偿债能力" icon={PieChart}>
            <MetricRow label="流动比率" value={financial?.currentRatio} />
            <MetricRow label="速动比率" value={financial?.quickRatio} />
            <MetricRow label="资产负债率" value={financial?.debtToEquity} unit="%" />
          </MetricCard>
        </div>
        
        {/* 杜邦分析 */}
        {dupont && (dupont.roe || dupont.netProfitMargin || dupont.totalAssetTurnover || dupont.equityMultiplier) && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              杜邦分析
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-indigo-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">ROE</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {dupont.roe?.toFixed(2) || '--'}%
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">净利率</p>
                <p className="text-2xl font-bold text-purple-600">
                  {dupont.netProfitMargin?.toFixed(2) || '--'}%
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">总资产周转</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dupont.totalAssetTurnover?.toFixed(2) || '--'}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">权益乘数</p>
                <p className="text-2xl font-bold text-green-600">
                  {dupont.equityMultiplier?.toFixed(2) || '--'}
                </p>
              </div>
            </div>
            
            {/* ROE分解说明 */}
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-800">ROE分解：</span>
                ROE = 净利率({dupont.netProfitMargin?.toFixed(2) || '--'}%) × 
                总资产周转({dupont.totalAssetTurnover?.toFixed(2) || '--'}) × 
                权益乘数({dupont.equityMultiplier?.toFixed(2) || '--'})
              </p>
              <p className="text-sm text-gray-500 mt-2">
                较高的ROE通常表明公司具有良好的盈利能力
              </p>
            </div>
          </div>
        )}
        
        {/* 每股收益 */}
        {valuation?.eps && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">每股收益(EPS)</p>
                  <p className="text-lg font-bold text-gray-800">
                    ¥{valuation.eps.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
