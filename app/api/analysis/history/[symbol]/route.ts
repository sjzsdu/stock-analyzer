import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import StockAnalysis from '@/models/StockAnalysis';
import UserAnalysisHistory from '@/models/UserAnalysisHistory';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const resolvedParams = await params;
    const symbol = resolvedParams.symbol.trim().toUpperCase();
    const urlParams = new URL(request.url).searchParams;
    const analysisDate = urlParams.get('date');
    
    if (!symbol) {
      return NextResponse.json(
        { success: false, error: '股票代码不能为空' },
        { status: 400 }
      );
    }

    console.log(`[${new Date().toISOString()}] 获取分析历史: ${symbol}${analysisDate ? ` (日期: ${analysisDate})` : ''}`);
    
    // 连接数据库
    await connectDB();
    
    // 识别市场
    const market = identifyMarket(symbol);
    
    // 获取用户session
    const session = await getServerSession(authOptions);
    
    let analysisData = null;
    
    // 如果用户已登录，优先从用户历史获取
    if (session?.user?.id) {
      try {
        const query: any = {
          userId: new mongoose.Types.ObjectId(session.user.id),
          symbol: symbol,
        };
        
        // 如果有日期参数，添加日期过滤
        if (analysisDate) {
          const targetDate = new Date(analysisDate);
          // 查找指定日期的分析（当天的分析）
          const nextDay = new Date(targetDate);
          nextDay.setDate(nextDay.getDate() + 1);
          
          query.analysisDate = {
            $gte: targetDate,
            $lt: nextDay
          };
        }
        
        const userHistory = await UserAnalysisHistory.findOne(query)
        .sort(analysisDate ? {} : { analysisDate: -1 }) // 如果有日期参数，不需要排序
        .populate({
          path: 'cache.originalAnalysisId',
          model: StockAnalysis
        });
        
        if (userHistory && userHistory.cache?.originalAnalysisId) {
          const globalAnalysis = userHistory.cache.originalAnalysisId;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const globalDoc = globalAnalysis as any;
          if (globalDoc && typeof globalDoc === 'object' && 'toObject' in globalDoc) {
            analysisData = {
              ...globalDoc.toObject(),
              isFavorite: userHistory.isFavorite,
              tags: userHistory.tags,
              userAnalysisDate: userHistory.analysisDate,
            };
            console.log(`[${new Date().toISOString()}] 从用户历史获取分析结果`);
          }
        }
      } catch (error) {
        console.error('获取用户历史失败:', error);
      }
    }
    
    // 如果没有用户历史，从全局分析表获取
    if (!analysisData) {
      try {
        const query: any = {
          symbol: symbol,
          market: market,
        };
        
        // 如果有日期参数，添加日期过滤
        if (analysisDate) {
          const targetDate = new Date(analysisDate);
          // 查找指定日期的分析（当天的分析）
          const nextDay = new Date(targetDate);
          nextDay.setDate(nextDay.getDate() + 1);
          
          query.createdAt = {
            $gte: targetDate,
            $lt: nextDay
          };
        }
        
        const globalAnalysis = await StockAnalysis.findOne(query)
        .sort(analysisDate ? {} : { createdAt: -1 }) // 如果有日期参数，不需要排序
        .limit(1);
        
        if (globalAnalysis) {
          analysisData = globalAnalysis.toObject();
          console.log(`[${new Date().toISOString()}] 从全局分析表获取分析结果`);
        }
      } catch (error) {
        console.error('获取全局分析失败:', error);
      }
    }
    
    if (!analysisData) {
      return NextResponse.json({
        success: false,
        error: '暂无分析记录'
      });
    }
    
    // 检查数据是否过期（24小时）
    const analysisTime = new Date(analysisData.createdAt || analysisData.userAnalysisDate);
    const now = new Date();
    const hoursDiff = (now.getTime() - analysisTime.getTime()) / (1000 * 60 * 60);
    
    const isExpired = hoursDiff > 24;
    
    return NextResponse.json({
      success: true,
      data: analysisData,
      cached: !isExpired,
      expired: isExpired,
      ageHours: Math.round(hoursDiff * 10) / 10
    });
    
  } catch (error) {
    console.error('获取分析历史失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取分析历史失败' 
      },
      { status: 500 }
    );
  }
}

function identifyMarket(symbol: string): 'A' | 'HK' | 'US' {
  // 港股：.HK或纯数字（4位）
  if (symbol.includes('.HK') || /^\d{4}$/.test(symbol)) {
    return 'HK';
  }
  
  // 美股：纯字母且不包含.或中文
  if (/^[A-Za-z]+$/.test(symbol) && !symbol.includes('.')) {
    return 'US';
  }
  
  // 默认A股
  return 'A';
}