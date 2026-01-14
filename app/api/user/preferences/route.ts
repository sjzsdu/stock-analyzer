/**
 * 用户偏好API
 * 
 * 获取和更新用户偏好设置
 * 
 * @module app/api/user/preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UserPreferences from '@/models/UserPreferences';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

// 默认偏好设置
const DEFAULT_PREFERENCES = {
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
};

// GET 获取用户偏好
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const preferences = await UserPreferences.findOne({ 
      userId: new mongoose.Types.ObjectId(session.user.id) 
    });
    
    if (!preferences) {
      return NextResponse.json({
        success: true,
        data: DEFAULT_PREFERENCES,
      });
    }
    
    return NextResponse.json({
      success: true,
      data: preferences,
    });
    
  } catch (error) {
    console.error('获取用户偏好失败:', error);
    return NextResponse.json(
      { success: false, error: '获取偏好失败' },
      { status: 500 }
    );
  }
}

// PUT 更新用户偏好
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    await connectDB();
    
    // 更新偏好
    const preferences = await UserPreferences.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(session.user.id) },
      { $set: body },
      { new: true, upsert: true, runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      data: preferences,
      message: '偏好已更新',
    });
    
  } catch (error) {
    console.error('更新用户偏好失败:', error);
    return NextResponse.json(
      { success: false, error: '更新偏好失败' },
      { status: 500 }
    );
  }
}
