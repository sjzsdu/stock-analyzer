/**
 * 用户使用统计API
 * 
 * 获取用户的使用统计信息
 * 
 * @module app/api/user/usage
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import { SUBSCRIPTION_CONFIG } from '@/lib/usage-limits';
import connectDB from '@/lib/mongodb';

// GET 获取用户使用统计
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
    
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }
    
    const tier = user.subscription.tier as keyof typeof SUBSCRIPTION_CONFIG;
    const config = SUBSCRIPTION_CONFIG[tier];
    
    // 检查是否需要重置月度使用量
    const now = new Date();
    const lastAnalysis = user.usage.lastAnalysisDate;
    
    if (lastAnalysis && lastAnalysis.getMonth() !== now.getMonth()) {
      user.usage.analysesThisMonth = 0;
      await user.save();
    }
    
    return NextResponse.json({
      success: true,
      data: {
        tier: user.subscription.tier,
        status: user.subscription.status,
        analysesThisMonth: user.usage.analysesThisMonth,
        totalAnalyses: user.usage.totalAnalyses,
        monthlyLimit: config.analysesPerMonth,
        monthlyRemaining: config.analysesPerMonth === -1 ? -1 : Math.max(0, config.analysesPerMonth - user.usage.analysesThisMonth),
        availableModels: config.availableModels,
        dataRetentionDays: config.dataRetentionDays,
        lastAnalysisDate: user.usage.lastAnalysisDate,
      },
    });
    
  } catch (error) {
    console.error('获取使用统计失败:', error);
    return NextResponse.json(
      { success: false, error: '获取统计失败' },
      { status: 500 }
    );
  }
}
