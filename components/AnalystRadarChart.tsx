'use client';

import { useMemo } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Lightbulb } from 'lucide-react';

interface AnalystRadarChartProps {
  scores: {
    value: number;
    technical: number;
    growth: number;
    fundamental: number;
    risk: number;
    macro: number;
  };
  overallScore: number;
  confidence: number;
}

const roleNames = {
  value: '价值分析',
  technical: '技术分析',
  growth: '成长分析',
  fundamental: '基本面',
  risk: '风险评估',
  macro: '宏观分析'
};

const roleColors = {
  value: '#3b82f6',      // 蓝色
  technical: '#8b5cf6',  // 紫色
  growth: '#10b981',     // 绿色
  fundamental: '#f59e0b', // 橙色
  risk: '#ef4444',       // 红色
  macro: '#06b6d4'       // 青色
};

export default function AnalystRadarChart({ scores, overallScore, confidence }: AnalystRadarChartProps) {
  
  const data = useMemo(() => {
    return [
      { subject: roleNames.value, value: scores.value, fullMark: 100 },
      { subject: roleNames.technical, value: scores.technical, fullMark: 100 },
      { subject: roleNames.growth, value: scores.growth, fullMark: 100 },
      { subject: roleNames.fundamental, value: scores.fundamental, fullMark: 100 },
      { subject: roleNames.risk, value: scores.risk, fullMark: 100 },
      { subject: roleNames.macro, value: scores.macro, fullMark: 100 },
    ];
  }, [scores]);

  // 过滤掉0分，只保留有效评分
  const validScores = Object.entries(scores).filter(([_, score]) => score > 0);
  const maxScore = validScores.length > 0 ? Math.max(...validScores.map(([_, s]) => s)) : 0;
  const minScore = validScores.length > 0 ? Math.min(...validScores.map(([_, s]) => s)) : 0;
  const strongestRole = validScores.find(([_, s]) => s === maxScore)?.[0] || '';
  const weakestRole = validScores.find(([_, s]) => s === minScore)?.[0] || '';

  const getTrendIcon = (role: string) => {
    if (role === strongestRole) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (role === weakestRole) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-yellow-400" />;
  };

  const getTrendLabel = (role: string) => {
    if (role === strongestRole) return '最强';
    if (role === weakestRole) return '最弱';
    return '';
  };

  return (
    <div className="glass-effect rounded-2xl p-6 border border-blue-500/20 card-hover">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">多维度评分分析</h3>
          <p className="text-white/60 text-sm">六位AI分析师综合评分</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 雷达图 */}
        <div className="relative">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
              <PolarGrid stroke="#4b5563" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#4b5563' }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fill: '#6b7280', fontSize: 10 }}
                axisLine={{ stroke: '#374151' }}
              />
              <Radar
                name="评分"
                dataKey="value"
                stroke="#8b5cf6"
                strokeWidth={3}
                fill="#8b5cf6"
                fillOpacity={0.3}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.9)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                }}
                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                itemStyle={{ color: '#a78bfa' }}
                formatter={(value: number | undefined) => [`${value || 0}分`, '评分']}
              />
            </RadarChart>
          </ResponsiveContainer>
          
          {/* 中间显示综合评分 */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-4xl font-bold gradient-text">{overallScore.toFixed(0)}</div>
            <div className="text-white/50 text-xs">综合评分</div>
          </div>
        </div>

        {/* 评分详情 */}
        <div className="space-y-3">
          {Object.entries(scores).map(([role, score]) => (
            <div 
              key={role} 
              className={`p-3 rounded-xl border transition-all ${
                role === strongestRole 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : role === weakestRole 
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: roleColors[role as keyof typeof roleColors] }}
                  />
                  <span className="text-white font-medium">{roleNames[role as keyof typeof roleNames]}</span>
                  {getTrendLabel(role) && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      role === strongestRole 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {getTrendLabel(role)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(role)}
                  <span className={`text-xl font-bold ${
                    score >= 80 ? 'text-green-400' :
                    score >= 60 ? 'text-yellow-400' :
                    score >= 40 ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {score}
                  </span>
                </div>
              </div>
              
              {/* 进度条 */}
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${score}%`,
                    backgroundColor: roleColors[role as keyof typeof roleColors]
                  }}
                />
              </div>
            </div>
          ))}

          {/* 置信度 */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">整体置信度</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
                <span className="font-medium text-white">{confidence.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 分析要点 */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="font-medium text-green-300">最强维度</span>
            </div>
            <p className="text-white/70 text-sm">
              {roleNames[strongestRole as keyof typeof roleNames]}表现突出，
              得分 {maxScore}，是当前投资的主要亮点。
            </p>
          </div>
          
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              <span className="font-medium text-yellow-300">关注要点</span>
            </div>
            <p className="text-white/70 text-sm">
              {roleNames[weakestRole as keyof typeof roleNames]}得分 {minScore}，
              需要关注相关风险因素。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
