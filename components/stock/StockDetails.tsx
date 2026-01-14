/**
 * 股票详情综合组件
 * 
 * 整合公司信息、财务指标等详情
 * 
 * @module components/stock/StockDetails
 */

'use client';

import { useState } from 'react';
import { 
  Building2, 
  BarChart3, 
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Clock,
  Database
} from 'lucide-react';
import CompanyInfo from './CompanyInfo';
import FinancialMetrics from './FinancialMetrics';

interface StockDetailsProps {
  symbol: string;
  name: string;
  data?: {
    // 基本信息
    basic?: {
      exchange?: string;
      listDate?: Date;
      industry?: string;
      sector?: string;
      area?: string;
      concept?: string[];
    };
    
    // 公司信息
    company?: {
      fullName?: string;
      shortName?: string;
      englishName?: string;
      province?: string;
      city?: string;
      address?: string;
      website?: string;
      email?: string;
      phone?: string;
      employees?: number;
      mainBusiness?: string;
      introduction?: string;
      chairman?: string;
      manager?: string;
      secretary?: string;
      registeredCapital?: number;
      setupDate?: Date;
    };
    
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
      roe?: number;
      netProfitMargin?: number;
      grossProfitMargin?: number;
      revenueYoy?: number;
      profitYoy?: number;
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
  loading?: boolean;
  lastUpdated?: Date;
  onRefresh?: () => void;
}

type TabType = 'overview' | 'financial' | 'all';

export default function StockDetails({ 
  symbol, 
  name, 
  data, 
  loading = false,
  lastUpdated,
  onRefresh 
}: StockDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [expanded, setExpanded] = useState(true);
  
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-gray-600">加载股票详情...</span>
        </div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <Database className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">暂无股票详情数据</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              加载详情
            </button>
          )}
        </div>
      </div>
    );
  }
  
  const hasCompanyData = !!(data.company || data.basic);
  const hasFinancialData = !!(data.valuation || data.financial || data.dupont);
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* 头部 */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              股票详情
            </h2>
            <p className="text-white/80 text-sm mt-1">
              {symbol} - {name}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* 更新时间 */}
            {lastUpdated && (
              <div className="flex items-center gap-1 text-white/80 text-sm">
                <Clock className="w-4 h-4" />
                <span>
                  更新于 {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            )}
            
            {/* 刷新按钮 */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-white" />
              </button>
            )}
            
            {/* 展开/收起 */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-white" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
        
        {/* Tab切换 */}
        <div className="flex gap-4 mt-4">
          {[
            { id: 'all', label: '全部', icon: FileText },
            { id: 'overview', label: '公司概况', icon: Building2, disabled: !hasCompanyData },
            { id: 'financial', label: '财务指标', icon: BarChart3, disabled: !hasFinancialData },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id as TabType)}
              disabled={tab.disabled}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600'
                  : tab.disabled
                  ? 'text-white/40 cursor-not-allowed'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* 内容区域 */}
      {expanded && (
        <div className="p-6 space-y-6">
          {/* 显示全部 */}
          {activeTab === 'all' && (
            <>
              {/* 公司概况 */}
              {hasCompanyData && (
                <CompanyInfo 
                  data={{ basic: data.basic, company: data.company }}
                  symbol={symbol}
                  name={name}
                />
              )}
              
              {/* 财务指标 */}
              {hasFinancialData && (
                <FinancialMetrics 
                  data={{ 
                    valuation: data.valuation, 
                    financial: data.financial,
                    dupont: data.dupont 
                  }}
                  symbol={symbol}
                />
              )}
            </>
          )}
          
          {/* 只显示公司概况 */}
          {activeTab === 'overview' && hasCompanyData && (
            <CompanyInfo 
              data={{ basic: data.basic, company: data.company }}
              symbol={symbol}
              name={name}
            />
          )}
          
          {/* 只显示财务指标 */}
          {activeTab === 'financial' && hasFinancialData && (
            <FinancialMetrics 
              data={{ 
                valuation: data.valuation, 
                financial: data.financial,
                dupont: data.dupont 
              }}
              symbol={symbol}
            />
          )}
          
          {/* 无数据提示 */}
          {((activeTab === 'overview' && !hasCompanyData) || 
            (activeTab === 'financial' && !hasFinancialData)) && (
            <div className="text-center py-12 text-gray-500">
              <Database className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p>暂无相关数据</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
