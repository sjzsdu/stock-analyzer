/**
 * 分析缓存服务
 * 
 * 处理用户分析记录的缓存和查询
 * 
 * @module lib/analysis-cache
 */

import mongoose from 'mongoose';
import UserAnalysisHistory from '@/models/UserAnalysisHistory';
import StockAnalysis from '@/models/StockAnalysis';

// 缓存配置
const CACHE_CONFIG = {
  free: { hours: 24 },        // 免费用户缓存24小时
  basic: { hours: 48 },       // 基础用户缓存48小时
  pro: { hours: 72 },         // 专业用户缓存72小时
  enterprise: { hours: 168 }, // 企业用户缓存168小时（7天）
};

export interface AnalysisCacheResult {
  cached: boolean;
  analysis?: any;
  remainingAnalyses?: number;
  message?: string;
}

export interface SaveAnalysisParams {
  userId: string;
  symbol: string;
  market: string;
  analysisData: any;
  modelUsed: string;
  executionTime: number;
  tokensUsed?: number;
  cost?: number;
}

/**
 * 检查用户当日是否已有分析
 */
export async function checkUserAnalysisCache(
  userId: string,
  symbol: string,
  analysisType: string = 'daily'
): Promise<{
  hasCached: boolean;
  cachedAnalysis?: any;
  cacheExpiry?: Date;
}> {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    
    // 查询用户当日的分析记录
    const cached = await UserAnalysisHistory.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      symbol: symbol.toUpperCase(),
      analysisType,
      analysisDate: { $gte: startOfDay, $lt: endOfDay },
      'cache.cacheExpiry': { $gt: new Date() },
    }).populate('stockAnalysisId');
    
    if (cached && cached.cache?.originalAnalysisId) {
      return {
        hasCached: true,
        cachedAnalysis: cached.cache.originalAnalysisId,
        cacheExpiry: cached.cache.cacheExpiry,
      };
    }
    
    return { hasCached: false };
    
  } catch (error) {
    console.error('检查用户分析缓存失败:', error);
    return { hasCached: false };
  }
}

/**
 * 保存用户分析记录
 */
export async function saveUserAnalysis(params: SaveAnalysisParams): Promise<string> {
  const { 
    userId, 
    symbol, 
    market, 
    analysisData, 
    modelUsed, 
    executionTime,
    tokensUsed = 0,
    cost = 0 
  } = params;
  
  try {
    // 保存到全局分析表
    const stockAnalysis = await StockAnalysis.create({
      symbol: symbol.toUpperCase(),
      market,
      ...analysisData,
      createdAt: new Date(),
    });
    
    // 获取缓存时长配置
    const cacheHours = 24; // 默认24小时
    
    // 创建用户分析记录
    const userAnalysis = await UserAnalysisHistory.create({
      userId: new mongoose.Types.ObjectId(userId),
      symbol: symbol.toUpperCase(),
      analysisDate: new Date(),
      analysisType: 'daily',
      aiModel: {
        provider: 'deepseek',
        modelName: modelUsed,
      },
      result: {
        overallScore: analysisData.overallScore || 0,
        recommendation: analysisData.recommendation || 'hold',
        summary: analysisData.executiveSummary || '',
        keyFactors: analysisData.keyFactors || [],
      },
      cache: {
        isCached: true,
        cacheExpiry: new Date(Date.now() + cacheHours * 60 * 60 * 1000),
        originalAnalysisId: stockAnalysis._id,
      },
      isFavorite: false,
      tags: [],
    });
    
    return stockAnalysis._id.toString();
    
  } catch (error) {
    console.error('保存用户分析记录失败:', error);
    throw error;
  }
}

/**
 * 获取用户分析历史
 */
export async function getUserAnalysisHistory(
  userId: string,
  options: {
    page?: number;
    limit?: number;
    symbol?: string;
    startDate?: Date;
    endDate?: Date;
    favoritesOnly?: boolean;
    sortBy?: 'date' | 'score';
    sortOrder?: 'asc' | 'desc';
  } = {}
) {
  const {
    page = 1,
    limit = 20,
    symbol,
    startDate,
    endDate,
    favoritesOnly = false,
    sortBy = 'date',
    sortOrder = 'desc',
  } = options;
  
  try {
    const query: any = {
      userId: new mongoose.Types.ObjectId(userId),
    };
    
    if (symbol) {
      query.symbol = symbol.toUpperCase();
    }
    
    if (startDate || endDate) {
      query.analysisDate = {};
      if (startDate) query.analysisDate.$gte = startDate;
      if (endDate) query.analysisDate.$lte = endDate;
    }
    
    if (favoritesOnly) {
      query.isFavorite = true;
    }
    
    // 排序
    const sort: any = {};
    sort[sortBy === 'date' ? 'analysisDate' : 'result.overallScore'] = sortOrder === 'asc' ? 1 : -1;
    
    const [analyses, total] = await Promise.all([
      UserAnalysisHistory.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      UserAnalysisHistory.countDocuments(query),
    ]);
    
    return {
      analyses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
    
  } catch (error) {
    console.error('获取用户分析历史失败:', error);
    throw error;
  }
}

/**
 * 获取用户分析统计
 */
export async function getUserAnalysisStats(userId: string) {
  try {
    const stats = await UserAnalysisHistory.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          totalAnalyses: { $sum: 1 },
          uniqueSymbols: { $addToSet: '$symbol' },
          avgScore: { $avg: '$result.overallScore' },
          favoritesCount: {
            $sum: { $cond: ['$isFavorite', 1, 0] },
          },
          lastAnalysis: { $max: '$analysisDate' },
          recommendationBreakdown: {
            $push: '$result.recommendation',
          },
        },
      },
    ]);
    
    if (stats.length === 0) {
      return {
        totalAnalyses: 0,
        uniqueSymbols: 0,
        avgScore: 0,
        favoritesCount: 0,
        lastAnalysis: null,
        recommendations: {},
      };
    }
    
    const s = stats[0];
    
    // 统计各推荐次数
    const recommendations: Record<string, number> = {};
    s.recommendationBreakdown.forEach((rec: string) => {
      recommendations[rec] = (recommendations[rec] || 0) + 1;
    });
    
    return {
      totalAnalyses: s.totalAnalyses,
      uniqueSymbols: s.uniqueSymbols.length,
      avgScore: Math.round((s.avgScore || 0) * 10) / 10,
      favoritesCount: s.favoritesCount,
      lastAnalysis: s.lastAnalysis,
      recommendations,
    };
    
  } catch (error) {
    console.error('获取用户分析统计失败:', error);
    throw error;
  }
}

/**
 * 切换收藏
 */
export async function toggleAnalysisFavorite(analysisId: string, userId: string) {
  try {
    const analysis = await UserAnalysisHistory.findOne({
      _id: new mongoose.Types.ObjectId(analysisId),
      userId: new mongoose.Types.ObjectId(userId),
    });
    
    if (!analysis) {
      throw new Error('分析记录不存在');
    }
    
    analysis.isFavorite = !analysis.isFavorite;
    await analysis.save();
    
    return analysis;
    
  } catch (error) {
    console.error('切换收藏失败:', error);
    throw error;
  }
}

/**
 * 删除分析记录
 */
export async function deleteAnalysisRecord(analysisId: string, userId: string) {
  try {
    const result = await UserAnalysisHistory.deleteOne({
      _id: new mongoose.Types.ObjectId(analysisId),
      userId: new mongoose.Types.ObjectId(userId),
      isFavorite: false, // 只能删除非收藏记录
    });
    
    return result.deletedCount > 0;
    
  } catch (error) {
    console.error('删除分析记录失败:', error);
    throw error;
  }
}

export default {
  checkUserAnalysisCache,
  saveUserAnalysis,
  getUserAnalysisHistory,
  getUserAnalysisStats,
  toggleAnalysisFavorite,
  deleteAnalysisRecord,
  CACHE_CONFIG,
};
