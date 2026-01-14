/**
 * 公司详情组件
 * 
 * 展示公司基本信息、业务范围、管理层等
 * 
 * @module components/stock/CompanyInfo
 */

'use client';

import { 
  Building2, 
  Globe, 
  MapPin, 
  Users, 
  Briefcase, 
  Calendar,
  Link as LinkIcon,
  Mail,
  Phone,
  Factory
} from 'lucide-react';

interface CompanyInfoProps {
  data: {
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
  };
  symbol: string;
  name: string;
}

export default function CompanyInfo({ data, symbol, name }: CompanyInfoProps) {
  const { basic, company } = data || {};
  
  if (!company && !basic) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600" />
          公司信息
        </h3>
        <p className="text-gray-500 text-center py-8">
          暂无公司信息
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* 标题 */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          公司信息
        </h3>
        <p className="text-white/80 text-sm mt-1">{symbol} - {name}</p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* 公司名称 */}
        {company?.fullName && (
          <div>
            <p className="text-sm text-gray-500 mb-1">公司全称</p>
            <p className="text-lg font-medium text-gray-800">{company.fullName}</p>
          </div>
        )}
        
        {/* 主营业务 */}
        {company?.mainBusiness && (
          <div>
            <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              主营业务
            </p>
            <p className="text-gray-700 leading-relaxed">
              {company.mainBusiness}
            </p>
          </div>
        )}
        
        {/* 公司简介 */}
        {company?.introduction && (
          <div>
            <p className="text-sm text-gray-500 mb-2">公司简介</p>
            <p className="text-gray-700 leading-relaxed line-clamp-4">
              {company.introduction}
            </p>
          </div>
        )}
        
        {/* 概念板块 */}
        {basic?.concept && basic.concept.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-2">概念板块</p>
            <div className="flex flex-wrap gap-2">
              {basic.concept.map((concept, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* 管理层信息 */}
        {(company?.chairman || company?.manager || company?.secretary) && (
          <div>
            <p className="text-sm text-gray-500 mb-3">管理层</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {company.chairman && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">董事长</p>
                  <p className="font-medium text-gray-800">{company.chairman}</p>
                </div>
              )}
              {company.manager && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">总经理</p>
                  <p className="font-medium text-gray-800">{company.manager}</p>
                </div>
              )}
              {company.secretary && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">董秘</p>
                  <p className="font-medium text-gray-800">{company.secretary}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* 基本信息网格 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          {/* 上市日期 */}
          {company?.setupDate && (
            <div className="text-center">
              <Calendar className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">成立日期</p>
              <p className="font-medium text-gray-800">
                {new Date(company.setupDate).toLocaleDateString()}
              </p>
            </div>
          )}
          
          {/* 注册资本 */}
          {company?.registeredCapital && (
            <div className="text-center">
              <Factory className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">注册资本</p>
              <p className="font-medium text-gray-800">
                {(company.registeredCapital / 100000000).toFixed(2)}亿
              </p>
            </div>
          )}
          
          {/* 员工人数 */}
          {company?.employees && (
            <div className="text-center">
              <Users className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">员工人数</p>
              <p className="font-medium text-gray-800">
                {company.employees.toLocaleString()}
              </p>
            </div>
          )}
          
          {/* 所属行业 */}
          {basic?.industry && (
            <div className="text-center">
              <Briefcase className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">所属行业</p>
              <p className="font-medium text-gray-800 truncate">
                {basic.industry}
              </p>
            </div>
          )}
        </div>
        
        {/* 联系信息 */}
        {(company?.website || company?.email || company?.phone || company?.address) && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 mb-3">联系方式</p>
            <div className="space-y-2">
              {company.website && (
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span className="truncate">{company.website}</span>
                </a>
              )}
              {company.email && (
                <a 
                  href={`mailto:${company.email}`}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                >
                  <Mail className="w-4 h-4" />
                  <span>{company.email}</span>
                </a>
              )}
              {company.phone && (
                <a 
                  href={`tel:${company.phone}`}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                >
                  <Phone className="w-4 h-4" />
                  <span>{company.phone}</span>
                </a>
              )}
              {company.address && (
                <p className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    {company.province}{company.city}{company.address}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
