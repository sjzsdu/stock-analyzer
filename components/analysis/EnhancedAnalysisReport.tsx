'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Target, BarChart3, Shield, Globe, DollarSign, Activity, Eye, Lightbulb } from 'lucide-react';

interface AgentResult {
  agent: string;
  summary: string;
  score: number;
  confidence: number;
  recommendation: string;
  key_factors: string[];
  risks: string[];
  details: any;
  raw_output: string;
}

interface EnhancedAnalysisReportProps {
  agentResults: AgentResult[];
  overallScore: number;
  recommendation: string;
  confidenceScore: number;
  keyFactors: string[];
  symbol: string;
  stockName: string;
}

const agentConfig = {
  value: {
    name: '价值分析',
    icon: DollarSign,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: '基于DCF、相对估值等方法评估内在价值'
  },
  technical: {
    name: '技术分析',
    icon: Activity,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    description: '分析价格趋势、支撑阻力、技术指标信号'
  },
  growth: {
    name: '成长分析',
    icon: TrendingUp,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    description: '评估营收利润增长的可持续性和质量'
  },
  fundamental: {
    name: '基本面分析',
    icon: BarChart3,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    description: '剖析盈利能力、运营效率、资产质量'
  },
  risk: {
    name: '风险评估',
    icon: Shield,
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    description: '识别和量化市场风险、行业风险、公司特有风险'
  },
  macro: {
    name: '宏观分析',
    icon: Globe,
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    description: '评估宏观经济周期对投资的影响'
  }
};

export default function EnhancedAnalysisReport({
  agentResults,
  overallScore,
  recommendation,
  confidenceScore,
  keyFactors,
  symbol,
  stockName
}: EnhancedAnalysisReportProps) {
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set(['value']));
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed'>('summary');

  const toggleAgent = (agentType: string) => {
    const newExpanded = new Set(expandedAgents);
    if (newExpanded.has(agentType)) {
      newExpanded.delete(agentType);
    } else {
      newExpanded.add(agentType);
    }
    setExpandedAgents(newExpanded);
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'strong_buy':
      case 'buy':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'sell':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <Minus className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getRecommendationText = (rec: string) => {
    const map = {
      strong_buy: '强烈买入',
      buy: '买入',
      hold: '持有',
      wait: '观望',
      sell: '卖出'
    };
    return map[rec as keyof typeof map] || rec;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'from-green-500 to-green-600';
    if (confidence >= 60) return 'from-yellow-500 to-yellow-600';
    if (confidence >= 40) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'summary'
              ? 'text-white border-b-2 border-purple-500'
              : 'text-white/60 hover:text-white'
          }`}
        >
          分析摘要
        </button>
        <button
          onClick={() => setActiveTab('detailed')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'detailed'
              ? 'text-white border-b-2 border-purple-500'
              : 'text-white/60 hover:text-white'
          }`}
        >
          详细分析
        </button>
      </div>

      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Overall Summary */}
          <div className="glass-effect rounded-3xl p-8 border border-purple-500/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{symbol} - {stockName}</h2>
                <p className="text-white/60">AI多维度深度分析报告</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Overall Score */}
              <div className="text-center">
                <div className={`text-6xl font-bold bg-gradient-to-r ${getConfidenceColor(confidenceScore)} bg-clip-text text-transparent mb-2`}>
                  {overallScore.toFixed(1)}
                </div>
                <div className="text-white/60">综合评分</div>
              </div>

              {/* Recommendation */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getRecommendationIcon(recommendation)}
                  <span className="text-2xl font-bold text-white">
                    {getRecommendationText(recommendation)}
                  </span>
                </div>
                <div className="text-white/60">投资建议</div>
              </div>

              {/* Confidence */}
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {confidenceScore.toFixed(1)}%
                </div>
                <div className="text-white/60">置信度</div>
              </div>
            </div>

            {/* Key Factors */}
            {keyFactors && keyFactors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  关键投资要点
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {keyFactors.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                      <span className="text-purple-400 font-bold mt-0.5 flex-shrink-0">{idx + 1}.</span>
                      <span className="text-white/80 leading-relaxed">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agent Scores Overview */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                各维度评分
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {agentResults.map((agent) => {
                  const config = agentConfig[agent.agent as keyof typeof agentConfig];
                  if (!config) return null;

                  const Icon = config.icon;
                  return (
                    <div key={agent.agent} className={`p-4 rounded-xl border ${config.bgColor} ${config.borderColor}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-5 h-5 text-white" />
                        <span className="font-medium text-white">{config.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-2xl font-bold ${getScoreColor(agent.score)}`}>
                          {agent.score}
                        </span>
                        <span className="text-white/60 text-sm">
                          置信度 {agent.confidence?.toFixed(1) || 0}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'detailed' && (
        <div className="space-y-4">
          {agentResults.map((agent) => {
            const config = agentConfig[agent.agent as keyof typeof agentConfig];
            if (!config) return null;

            const Icon = config.icon;
            const isExpanded = expandedAgents.has(agent.agent);

            return (
              <div key={agent.agent} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${config.borderColor} ${config.bgColor}`}>
                <div
                  className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => toggleAgent(agent.agent)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${config.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{config.name}</h3>
                        <p className="text-white/60 text-sm">{config.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getScoreColor(agent.score)}`}>
                          {agent.score}
                        </div>
                        <div className="text-white/60 text-sm">评分</div>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-bold text-white">
                          {agent.confidence}%
                        </div>
                        <div className="text-white/60 text-sm">置信度</div>
                      </div>

                      <div className="transition-transform duration-300">
                        {isExpanded ?
                          <ChevronUp className="w-6 h-6 text-white/40" /> :
                          <ChevronDown className="w-6 h-6 text-white/40" />
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 bg-white/5 backdrop-blur-sm border-t border-white/10">
                    {/* Summary */}
                    {agent.summary && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Eye className="w-4 h-4 text-purple-400" />
                          分析摘要
                        </h4>
                        <p className="text-white/80 leading-relaxed">{agent.summary}</p>
                      </div>
                    )}

                    {/* Key Factors */}
                    {agent.key_factors && agent.key_factors.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          关键发现
                        </h4>
                        <ul className="space-y-2">
                          {agent.key_factors.map((factor, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-white/80 bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                              <span className="text-purple-400 font-bold mt-0.5 flex-shrink-0">{idx + 1}.</span>
                              <span className="leading-relaxed">{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Risks */}
                    {agent.risks && agent.risks.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          风险因素
                        </h4>
                        <ul className="space-y-2">
                          {agent.risks.map((risk, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-white/80 bg-red-500/5 backdrop-blur-sm p-3 rounded-lg border border-red-500/10">
                              <span className="text-red-400 font-bold mt-0.5 flex-shrink-0">{idx + 1}.</span>
                              <span className="leading-relaxed">{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Raw Output */}
                    {agent.raw_output && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-400" />
                          完整分析报告
                        </h4>
                        <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-white/10 max-h-96 overflow-y-auto">
                          <pre className="text-white/80 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                            {agent.raw_output}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}