/**
 * 新用户初始化
 * 
 * 用户注册后自动初始化相关记录
 * 
 * @module app/api/user/onboarding
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UserPreferences from '@/models/UserPreferences';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// POST 初始化新用户
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // 检查是否已初始化
    const existing = await UserPreferences.findOne({ 
      userId: new mongoose.Types.ObjectId(session.user.id) 
    });
    
    if (existing) {
      return NextResponse.json({
        success: true,
        message: '已初始化',
        data: existing,
      });
    }
    
    // 创建默认偏好
    const preferences = await UserPreferences.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      language: {
        interface: 'zh',
        analysis: 'auto',
        financialTerms: 'original',
        dateFormat: 'YYYY-MM-DD',
        numberFormat: 'US',
      },
      aiModel: {
        default: 'deepseek-v3',
        costOptimization: true,
        qualityPriority: 'balanced',
      },
      analysis: {
        defaultSymbolType: 'all',
        enableCache: true,
        cacheDuration: 24,
        enableNotifications: true,
        notificationTypes: {
          analysisComplete: true,
          priceAlert: false,
          newsAlert: false,
          weeklyReport: false,
        },
      },
      display: {
        theme: 'system',
        compactMode: false,
        showTechnicalIndicators: true,
        chartDefaultPeriod: '1Y',
        defaultCurrency: 'CNY',
      },
      privacy: {
        showHistoryInDashboard: true,
        allowAnalytics: true,
        showProfilePublicly: false,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: '初始化成功',
      data: preferences,
    });
    
  } catch (error) {
    console.error('初始化失败:', error);
    return NextResponse.json(
      { success: false, error: '初始化失败' },
      { status: 500 }
    );
  }
}
