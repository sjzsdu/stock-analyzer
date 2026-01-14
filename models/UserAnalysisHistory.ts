/**
 * User Analysis History Model
 * 
 * 用户分析历史记录，支持每日缓存和历史查询
 * 
 * @module models/UserAnalysisHistory
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

// TypeScript Interface
export interface IUserAnalysisHistory extends Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  
  // 分析日期
  analysisDate: Date;
  analysisType: string;
  
  // 模型信息
  aiModel: {
    provider: string;
    modelName: string;
  };
  
  // 分析结果摘要
  result: {
    overallScore: number;
    recommendation: string;
    summary: string;
    keyFactors: string[];
  };
  
  // 缓存信息
  cache: {
    isCached: boolean;
    cacheExpiry: Date;
    originalAnalysisId?: mongoose.Types.ObjectId;
  };
  
  // 标记
  isFavorite: boolean;
  tags: string[];
  notes?: string;
  
  // 分享状态
  shared: {
    isShared: boolean;
    shareUrl?: string;
    shareCount: number;
    sharedAt?: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const UserAnalysisHistorySchema = new Schema<IUserAnalysisHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    analysisDate: {
      type: Date,
      required: true,
      index: true,
    },
    analysisType: {
      type: String,
      enum: ['daily', 'weekly', 'technical', 'fundamental', 'custom'],
      default: 'daily',
    },
    aiModel: {
      provider: {
        type: String,
        required: true,
      },
      modelName: {
        type: String,
        required: true,
      },
    },
    result: {
      overallScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      recommendation: {
        type: String,
        required: true,
        enum: ['strong_buy', 'buy', 'hold', 'wait', 'sell', 'strong_sell'],
      },
      summary: {
        type: String,
        required: true,
      },
      keyFactors: [{
        type: String,
      }],
    },
    cache: {
      isCached: {
        type: Boolean,
        default: false,
      },
      cacheExpiry: {
        type: Date,
        required: true,
      },
      originalAnalysisId: {
        type: Schema.Types.ObjectId,
        ref: 'StockAnalysis',
      },
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    notes: {
      type: String,
      maxlength: 1000,
    },
    shared: {
      isShared: {
        type: Boolean,
        default: false,
      },
      shareUrl: String,
      shareCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      sharedAt: Date,
    },
  },
  {
    timestamps: true,
    collection: 'user_analysis_history',
  }
);

// 索引优化
UserAnalysisHistorySchema.index({ userId: 1, analysisDate: -1 });
UserAnalysisHistorySchema.index({ userId: 1, symbol: 1, analysisDate: -1 });
UserAnalysisHistorySchema.index({ userId: 1, isFavorite: 1 });
UserAnalysisHistorySchema.index({ userId: 1, 'result.recommendation': 1 });
UserAnalysisHistorySchema.index({ analysisDate: 1, cacheExpiry: 1 });

// 复合索引用于缓存查询
UserAnalysisHistorySchema.index({ userId: 1, symbol: 1, analysisDate: 1, analysisType: 1 });

// 静态方法：检查用户当日是否已分析该股票
UserAnalysisHistorySchema.statics.hasAnalyzedToday = async function(
  userId: string,
  symbol: string,
  analysisType: string = 'daily'
): Promise<{
  hasAnalyzed: boolean;
  existingAnalysis?: IUserAnalysisHistory;
}> {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  
  const existing = await this.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    symbol: symbol.toUpperCase(),
    analysisType,
    analysisDate: { $gte: startOfDay, $lt: endOfDay },
    'cache.cacheExpiry': { $gt: new Date() }, // 缓存未过期
  });
  
  return {
    hasAnalyzed: !!existing,
    existingAnalysis: existing,
  };
};

// 静态方法：保存分析结果
UserAnalysisHistorySchema.statics.saveAnalysis = async function(
  userId: string,
  data: {
    symbol: string;
    analysisType: string;
    aiModel: { provider: string; modelName: string };
    result: {
      overallScore: number;
      recommendation: string;
      summary: string;
      keyFactors: string[];
    };
    cacheHours?: number;
    originalAnalysisId?: string;
  }
) {
  const cacheHours = data.cacheHours || 24;
  const cacheExpiry = new Date();
  cacheExpiry.setHours(cacheExpiry.getHours() + cacheHours);
  
  return await this.create({
    userId: new mongoose.Types.ObjectId(userId),
    symbol: data.symbol.toUpperCase(),
    analysisDate: new Date(),
    analysisType: data.analysisType,
    aiModel: data.aiModel,
    result: data.result,
    cache: {
      isCached: true,
      cacheExpiry,
      originalAnalysisId: data.originalAnalysisId ? 
        new mongoose.Types.ObjectId(data.originalAnalysisId) : undefined,
    },
  });
};

// 静态方法：获取用户分析历史
UserAnalysisHistorySchema.statics.getUserHistory = async function(
  userId: string,
  options: {
    page?: number;
    limit?: number;
    symbol?: string;
    recommendation?: string;
    startDate?: Date;
    endDate?: Date;
    favoritesOnly?: boolean;
    sortBy?: 'date' | 'score' | 'symbol';
    sortOrder?: 'asc' | 'desc';
  } = {}
) {
  const {
    page = 1,
    limit = 20,
    symbol,
    recommendation,
    startDate,
    endDate,
    favoritesOnly = false,
    sortBy = 'date',
    sortOrder = 'desc',
  } = options;
  
  // 构建查询条件
  const query: any = {
    userId: new mongoose.Types.ObjectId(userId),
  };
  
  if (symbol) {
    query.symbol = symbol.toUpperCase();
  }
  
  if (recommendation) {
    query['result.recommendation'] = recommendation;
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
  const sortField = sortBy === 'date' ? 'analysisDate' : 
                    sortBy === 'score' ? 'result.overallScore' : 'symbol';
  sort[sortField] = sortOrder === 'asc' ? 1 : -1;
  
  // 分页查询
  const [analyses, total] = await Promise.all([
    this.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    this.countDocuments(query),
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
};

// 静态方法：获取用户分析统计
UserAnalysisHistorySchema.statics.getUserStats = async function(userId: string) {
  const stats = await this.aggregate([
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
        recommendationBreakdown: {
          $push: '$result.recommendation',
        },
        favoritesCount: {
          $sum: { $cond: ['$isFavorite', 1, 0] },
        },
        firstAnalysis: { $min: '$analysisDate' },
        lastAnalysis: { $max: '$analysisDate' },
      },
    },
    {
      $project: {
        _id: 0,
        totalAnalyses: 1,
        uniqueSymbolsCount: { $size: '$_id' === null ? [] : '$uniqueSymbols' },
        avgScore: { $round: ['$avgScore', 1] },
        favoritesCount: 1,
        firstAnalysis: 1,
        lastAnalysis: 1,
        recommendationStats: {
          $arrayToObject: {
            $map: {
              input: { $setUnion: ['$recommendationBreakdown', []] },
              as: 'rec',
              in: { k: '$$rec', v: { $size: { $filter: { input: '$recommendationBreakdown', as: 'r', cond: { $eq: ['$$r', '$$rec'] } } } } },
            },
          },
        },
      },
    },
  ]);
  
  return stats[0] || {
    totalAnalyses: 0,
    uniqueSymbolsCount: 0,
    avgScore: 0,
    favoritesCount: 0,
    recommendationStats: {},
  };
};

// 静态方法：切换收藏
UserAnalysisHistorySchema.statics.toggleFavorite = async function(analysisId: string, userId: string) {
  const analysis = await this.findOne({
    _id: new mongoose.Types.ObjectId(analysisId),
    userId: new mongoose.Types.ObjectId(userId),
  });
  
  if (!analysis) {
    throw new Error('Analysis not found');
  }
  
  analysis.isFavorite = !analysis.isFavorite;
  await analysis.save();
  
  return analysis;
};

// 静态方法：更新笔记
UserAnalysisHistorySchema.statics.updateNotes = async function(analysisId: string, userId: string, notes: string) {
  return await this.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(analysisId),
      userId: new mongoose.Types.ObjectId(userId),
    },
    {
      $set: { notes },
    },
    { new: true }
  );
};

// 静态方法：清理过期缓存
UserAnalysisHistorySchema.statics.cleanupExpiredCache = async function() {
  const result = await this.deleteMany({
    'cache.isCached': true,
    'cache.cacheExpiry': { $lt: new Date() },
    isFavorite: false,
    'shared.isShared': false,
  });
  
  return result.deletedCount;
};

// 创建并导出模型
const UserAnalysisHistory: Model<IUserAnalysisHistory> = 
  mongoose.models.UserAnalysisHistory || mongoose.model<IUserAnalysisHistory>('UserAnalysisHistory', UserAnalysisHistorySchema);

export default UserAnalysisHistory;
