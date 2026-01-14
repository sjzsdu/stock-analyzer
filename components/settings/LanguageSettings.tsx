/**
 * 语言设置组件
 * 
 * 管理界面语言和AI分析输出语言
 * 
 * @module components/settings/LanguageSettings
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Globe, Check, Loader2, Save } from 'lucide-react';

type InterfaceLanguage = 'zh' | 'en';
type AnalysisLanguage = 'zh' | 'en' | 'auto';

export default function LanguageSettings() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [settings, setSettings] = useState({
    interface: 'zh' as InterfaceLanguage,
    analysis: 'auto' as AnalysisLanguage,
    financialTerms: 'original',
    dateFormat: 'YYYY-MM-DD',
    numberFormat: 'US',
  });
  
  // 加载设置
  useEffect(() => {
    if (session?.user?.id) {
      loadSettings();
    }
  }, [session]);
  
  const loadSettings = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      const data = await response.json();
      if (data.success && data.data) {
        setSettings({
          interface: data.data.language?.interface || 'zh',
          analysis: data.data.language?.analysis || 'auto',
          financialTerms: data.data.language?.financialTerms || 'original',
          dateFormat: data.data.language?.dateFormat || 'YYYY-MM-DD',
          numberFormat: data.data.language?.numberFormat || 'US',
        });
      }
    } catch (error) {
      console.error('加载语言设置失败:', error);
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
        body: JSON.stringify({ language: settings }),
      });
      
      const data = await response.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('保存语言设置失败:', error);
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
  
  return (
    <div className="space-y-6">
      {/* 界面语言 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Globe className="w-4 h-4 inline-block mr-2" />
          界面语言
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'zh', label: '中文', flag: '🇨🇳' },
            { value: 'en', label: 'English', flag: '🇺🇸' },
          ].map((lang) => (
            <button
              key={lang.value}
              onClick={() => setSettings({ ...settings, interface: lang.value as InterfaceLanguage })}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                settings.interface === lang.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-medium">{lang.label}</span>
              {settings.interface === lang.value && (
                <Check className="w-5 h-5 ml-auto text-indigo-500" />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* AI分析输出语言 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          AI分析输出语言
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'auto', label: '跟随界面' },
            { value: 'zh', label: '中文' },
            { value: 'en', label: 'English' },
          ].map((lang) => (
            <button
              key={lang.value}
              onClick={() => setSettings({ ...settings, analysis: lang.value as AnalysisLanguage })}
              className={`p-4 rounded-xl border-2 transition-all ${
                settings.analysis === lang.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium">{lang.label}</span>
              {settings.analysis === lang.value && (
                <Check className="w-5 h-5 mx-auto mt-2 text-indigo-500" />
              )}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {settings.analysis === 'auto' 
            ? 'AI分析结果将使用与界面相同的语言' 
            : `AI分析结果将使用${settings.analysis === 'zh' ? '中文' : '英文'}输出`}
        </p>
      </div>
      
      {/* 金融术语显示 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          金融术语显示
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'original', label: '保持原样' },
            { value: 'translated', label: '翻译为中文' },
            { value: 'bilingual', label: '双语显示' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSettings({ ...settings, financialTerms: option.value })}
              className={`p-4 rounded-xl border-2 transition-all ${
                settings.financialTerms === option.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium">{option.label}</span>
              {settings.financialTerms === option.value && (
                <Check className="w-5 h-5 mx-auto mt-2 text-indigo-500" />
              )}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          例如：P/E ratio显示为「市盈率/PE比率/PE Ratio」
        </p>
      </div>
      
      {/* 数字格式 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          数字格式
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'US', label: '1,234.56', example: '美式' },
            { value: 'CN', label: '1.234,56', example: '中式' },
            { value: 'EU', label: '1 234,56', example: '欧式' },
          ].map((format) => (
            <button
              key={format.value}
              onClick={() => setSettings({ ...settings, numberFormat: format.value })}
              className={`p-4 rounded-xl border-2 transition-all ${
                settings.numberFormat === format.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium">{format.example}</span>
              <span className="block text-sm text-gray-500 mt-1">{format.label}</span>
              {settings.numberFormat === format.value && (
                <Check className="w-5 h-5 mx-auto mt-2 text-indigo-500" />
              )}
            </button>
          ))}
        </div>
      </div>
      
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
