/**
 * 用户分析历史API
 * 
 * 查询用户分析记录、历史统计等
 * 
 * @module app/api/user/history
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import analysisCache, { 
  getUserAnalysisHistory, 
  getUserAnalysisStats,
  toggleAnalysisFavorite 
} from '@/lib/analysis-cache';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// GET 获取用户分析历史
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const symbol = searchParams.get('symbol') || undefined;
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')!) 
      : undefined;
    const endDate = searchParams.get('endDate') 
      ? new Date(searchParams.get('endDate')!) 
      : undefined;
    const favoritesOnly = searchParams.get('favoritesOnly') === 'true';
    const sortBy = (searchParams.get('sortBy') as 'date' | 'score') || 'date';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    
    await connectDB();
    
    const result = await getUserAnalysisHistory(session.user.id, {
      page,
      limit,
      symbol,
      startDate,
      endDate,
      favoritesOnly,
      sortBy,
      sortOrder,
    });
    
    return NextResponse.json({
      success: true,
      data: result.analyses,
      pagination: result.pagination,
    });
    
  } catch (error) {
    console.error('获取分析历史失败:', error);
    return NextResponse.json(
      { success: false, error: '获取历史记录失败' },
      { status: 500 }
    );
  }
}

// PATCH 切换收藏
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }
    
    const { analysisId } = await request.json();
    
    if (!analysisId) {
      return NextResponse.json(
        { success: false, error: '请提供分析ID' },
        { status: 400 }
      );
    }
    
    const analysis = await toggleAnalysisFavorite(analysisId, session.user.id);
    
    return NextResponse.json({
      success: true,
      data: {
        isFavorite: analysis.isFavorite,
      },
      message: analysis.isFavorite ? '已添加到收藏' : '已取消收藏',
    });
    
  } catch (error: any) {
    console.error('切换收藏失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '操作失败' },
      { status: 500 }
    );
  }
}
