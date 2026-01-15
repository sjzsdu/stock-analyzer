'use client';

import { 
  ShieldAlert, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Activity
} from 'lucide-react';

interface DataPoint {
  label: string;
  value: string;
}

interface RiskOpportunityCardProps {
  type: 'risk' | 'opportunity';
  title: string;
  description: string;
  dataPoints?: DataPoint[];
  impact: {
    severity?: 'high' | 'medium' | 'low';
    confidence: number;
    timeframe: 'short' | 'medium' | 'long';
    controllability?: 'high' | 'medium' | 'low';
    urgency?: 'high' | 'medium' | 'low';
  };
  suggestion: string;
}

interface SeverityConfig {
  high: { color: string; bg: string; border: string; label: string };
  medium: { color: string; bg: string; border: string; label: string };
  low: { color: string; bg: string; border: string; label: string };
}

const severityConfig: Record<string, SeverityConfig['high']> = {
  high: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', label: '高' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', label: '中' },
  low: { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', label: '低' }
};

const timeframeConfig = {
  short: { label: '短期', color: 'text-red-400' },
  medium: { label: '中期', color: 'text-yellow-400' },
  long: { label: '长期', color: 'text-green-400' }
};

export default function RiskOpportunityCard({
  type,
  title,
  description,
  dataPoints = [],
  impact,
  suggestion
}: RiskOpportunityCardProps) {
  
  const isRisk = type === 'risk';
  const config = isRisk ? severityConfig.risk : severityConfig.opportunity;
  const icon = isRisk ? <ShieldAlert className="w-7 h-7" /> : <Lightbulb className="w-7 h-7" />;
  const bgGradient = isRisk 
    ? 'from-red-500/10 to-orange-500/10' 
    : 'from-green-500/10 to-emerald-500/10';
  const borderColor = isRisk ? 'border-red-500/20' : 'border-green-500/20';

  return (
    <div className={`glass-effect rounded-3xl p-6 border ${borderColor} card-hover`}>
      {/* 头部 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
            isRisk 
              ? 'bg-gradient-to-br from-red-500 to-orange-600' 
              : 'bg-gradient-to-br from-green-500 to-emerald-600'
          }`}>
            {icon}
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isRisk ? 'text-red-400' : 'text-green-400'}`}>
              {title}
            </h3>
            <p className="text-white/60 text-sm">
              {isRisk ? '需要关注的风险因素' : '值得关注的机会点'}
            </p>
          </div>
        </div>
        
        {/* 严重程度标签 */}
        {impact.severity && (
          <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            severityConfig[impact.severity].bg
          } ${severityConfig[impact.severity].color}`}>
            ⚡ 严重: {severityConfig[impact.severity].label}
          </div>
        )}
      </div>

      {/* 详细描述 */}
      <p className="text-white/80 leading-relaxed mb-6">
        {description}
      </p>

      {/* 数据支撑 */}
      {dataPoints.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white/60 text-sm mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            数据支撑
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dataPoints.map((point, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
              >
                <span className="text-white/60 text-sm">{point.label}</span>
                <span className="text-white font-medium">{point.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 影响评估 */}
      <div className="mb-6 pt-4 border-t border-white/10">
        <h4 className="text-white/60 text-sm mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          影响评估
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {/* 置信度 */}
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-2">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-white/10"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={`${impact.confidence * 1.76} 176`}
                  className={isRisk ? 'text-red-400' : 'text-green-400'}
                />
              </svg>
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold">
                {impact.confidence.toFixed(1)}%
              </span>
            </div>
            <span className="text-white/60 text-xs">置信度</span>
          </div>

          {/* 影响周期 */}
          <div className="text-center bg-white/5 rounded-xl p-3">
            <div className={`text-2xl font-bold mb-1 ${timeframeConfig[impact.timeframe].color}`}>
              {impact.timeframe === 'short' ? '⚡' : impact.timeframe === 'medium' ? '📊' : '📈'}
            </div>
            <span className="text-white/60 text-xs">影响周期</span>
            <div className={`text-sm font-medium ${timeframeConfig[impact.timeframe].color}`}>
              {timeframeConfig[impact.timeframe].label}
            </div>
          </div>

          {/* 可控性 */}
          {impact.controllability && (
            <div className="text-center bg-white/5 rounded-xl p-3">
              <div className={`text-2xl font-bold mb-1 ${
                impact.controllability === 'high' ? 'text-green-400' :
                impact.controllability === 'medium' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {impact.controllability === 'high' ? '🎯' : impact.controllability === 'medium' ? '⚖️' : '🚩'}
              </div>
              <span className="text-white/60 text-xs">可控性</span>
              <div className={`text-sm font-medium ${
                impact.controllability === 'high' ? 'text-green-400' :
                impact.controllability === 'medium' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {impact.controllability === 'high' ? '高' : impact.controllability === 'medium' ? '中' : '低'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 应对建议 */}
      <div className={`rounded-xl p-4 border ${
        isRisk 
          ? 'bg-red-500/10 border-red-500/20' 
          : 'bg-green-500/10 border-green-500/20'
      }`}>
        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
          {isRisk ? (
            <>
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              应对建议
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 text-green-400" />
              投资建议
            </>
          )}
        </h4>
        <p className="text-white/80 leading-relaxed">
          {suggestion}
        </p>
      </div>
    </div>
  );
}
