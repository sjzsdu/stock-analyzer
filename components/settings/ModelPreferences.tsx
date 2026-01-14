/**
 * 模型偏好设置组件
 * 
 * 管理AI模型选择和偏好
 * 
 * @module components/settings/ModelPreferences
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Brain, Zap, Check, Loader2, Save, AlertCircle, Info } from 'lucide-react';

interface ModelPreferencesProps {
  availableModels: string[];
}

const MODEL_INFO: Record<string, {
  name: string;
  provider: string;
  description: string;
  strengths: string[];
}> = {
  'deepseek-v3': {
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    description: '性价比最高的通用模型',
    strengths: ['中文理解优秀', '成本低', '推理能力强'],
  },
  'deepseek-v3-reasoner': {
    name: 'DeepSeek V3 Reasoner',
    provider: 'DeepSeek',
    description: '深度推理模型，适合复杂分析',
    strengths: ['深度推理', '复杂分析', '长文本处理'],
  },
  'gpt-4o': {
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'OpenAI最新旗舰模型',
    strengths: ['准确性高', '英文优秀', '生态完善'],
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: '快速高效的轻量级模型',
    strengths: ['速度快', '成本低', '日常任务'],
  },
  'claude-3-5-sonnet': {
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: '擅长长文本分析',
    strengths: ['长文本理解', '安全性高', '分析深度'],
  },
};

export default function ModelPreferences({ availableModels }: ModelPreferencesProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [preferences, setPreferences] = useState({
    default: 'deepseek-v3',
    value: 'deepseek-v3-reasoner',
    technical: 'deepseek-v3',
    growth: 'deepseek-v3-reasoner',
    costOptimization: true,
    qualityPriority: 'balanced' as 'speed' | 'balanced' | 'quality',
  });
  
  // 加载设置
  useEffect(() => {
    if (session?.user?.id) {
      loadPreferences();
    }
  }, [session]);
  
  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      const data = await response.json();
      if (data.success && data.data) {
        setPreferences({
          default: data.data.aiModel?.default || 'deepseek-v3',
          value: data.data.aiModel?.valueAnalysis || 'deepseek-v3-reasoner',
          technical: data.data.aiModel?.technicalAnalysis || 'deepseek-v3',
          growth: data.data.aiModel?.growthAnalysis || 'deepseek-v3-reasoner',
          costOptimization: data.data.aiModel?.costOptimization ?? true,
          qualityPriority: data.data.aiModel?.qualityPriority || 'balanced',
        });
      }
    } catch (error) {
      console.error('加载模型偏好失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 保存设置
  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiModel: preferences }),
      });
      
      const data = await response.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('保存模型偏好失败:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }
  
  // 获取可用的模型选项
  const getAvailableOptions = (current: string) => {
    if (availableModels.length > 0) {
      return availableModels.map(m => ({
        value: m,
        ...MODEL_INFO[m] || { name: m, provider: 'Unknown', description: '', strengths: [] }
      }));
    }
    // 默认选项
    return Object.entries(MODEL_INFO).map(([value, info]) => ({
      value,
      ...info
    }));
  };
  
  return (
    <div className="space-y-6">
      {/* 默认模型 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Brain className="w-4 h-4 inline-block mr-2" />
          默认AI模型
        </label>
        <div className="grid grid-cols-2 gap-3">
          {getAvailableOptions(preferences.default).map((model) => (
            <button
              key={model.value}
              onClick={() => setPreferences({ ...preferences, default: model.value })}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                preferences.default === model.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">{model.name}</span>
                {preferences.default === model.value && (
                  <Check className="w-5 h-5 text-indigo-500" />
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{model.provider}</p>
            </button>
          ))}
        </div>
      </div>
      
      {/* 分析类型专用模型 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">各类型分析专用模型</h3>
        <div className="space-y-4">
          
          {/* 价值分析 */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              价值分析模型
              <span className="text-gray-400 font-normal ml-2">适合估值、DCF分析</span>
            </label>
            <select
              value={preferences.value}
              onChange={(e) => setPreferences({ ...preferences, value: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {getAvailableOptions(preferences.value).map((model) => (
                <option key={model.value} value={model.value}>
                  {model.name} - {model.description}
                </option>
              ))}
            </select>
          </div>
          
          {/* 技术分析 */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              技术分析模型
              <span className="text-gray-400 font-normal ml-2">适合图表、指标分析</span>
            </label>
            <select
              value={preferences.technical}
              onChange={(e) => setPreferences({ ...preferences, technical: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {getAvailableOptions(preferences.technical).map((model) => (
                <option key={model.value} value={model.value}>
                  {model.name} - {model.description}
                </option>
              ))}
            </select>
          </div>
          
          {/* 成长分析 */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              成长分析模型
              <span className="text-gray-400 font-normal ml-2">适合业绩、增长分析</span>
            </label>
            <select
              value={preferences.growth}
              onChange={(e) => setPreferences({ ...preferences, growth: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {getAvailableOptions(preferences.growth).map((model) => (
                <option key={model.value} value={model.value}>
                  {model.name} - {model.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* 质量优先级 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Zap className="w-4 h-4 inline-block mr-2" />
          质量与速度平衡
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'speed', label: '速度优先', description: '使用轻量模型，快速响应' },
            { value: 'balanced', label: '平衡', description: '兼顾质量和速度' },
            { value: 'quality', label: '质量优先', description: '使用高级模型，详细分析' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setPreferences({ ...preferences, qualityPriority: option.value as any })}
              className={`p-4 rounded-xl border-2 transition-all ${
                preferences.qualityPriority === option.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium">{option.label}</span>
              <p className="text-sm text-gray-500 mt-1">{option.description}</p>
              {preferences.qualityPriority === option.value && (
                <Check className="w-5 h-5 mx-auto mt-2 text-indigo-500" />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* 成本优化 */}
      <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.costOptimization}
              onChange={(e) => setPreferences({ ...preferences, costOptimization: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-medium text-gray-800">成本优化模式</span>
          </label>
          <p className="text-sm text-gray-600 mt-1">
            启用后，系统会在分析质量相近时自动选择成本更低的模型
          </p>
        </div>
      </div>
      
      {/* 当前模型信息 */}
      {availableModels.length === 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">订阅级别限制</p>
            <p className="text-sm text-yellow-700 mt-1">
              您的当前订阅级别可用模型有限。升级订阅可解锁更多模型选择。
            </p>
          </div>
        </div>
      )}
      
      {/* 保存按钮 */}
      <div className="pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{isSaving ? '保存中...' : '保存设置'}</span>
        </button>
        
        {saved && (
          <p className="inline-flex items-center gap-2 ml-4 text-green-600">
            <Check className="w-5 h-5" />
            设置已保存
          </p>
        )}
      </div>
    </div>
  );
}
