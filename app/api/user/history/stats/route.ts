/**
 * 用户分析统计API
 * 
 * 获取用户分析统计信息
 * 
 * @module app/api/user/history/stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserAnalysisStats } from '@/lib/analysis-cache';
import connectDB from '@/lib/mongodb';

// GET 获取用户分析统计
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
    
    const stats = await getUserAnalysisStats(session.user.id);
    
    return NextResponse.json({
      success: true,
      data: stats,
    });
    
  } catch (error) {
    console.error('获取分析统计失败:', error);
    return NextResponse.json(
      { success: false, error: '获取统计信息失败' },
      { status: 500 }
    );
  }
}
