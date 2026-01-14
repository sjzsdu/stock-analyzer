/**
 * Usage Tracking Model
 * 
 * 用户使用统计记录，用于追踪AI分析、API调用、Token使用和成本
 * 
 * @module models/UsageTracking
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

// TypeScript Interface
export interface IUsageTracking extends Document {
  userId: mongoose.Types.ObjectId;
  analysis: {
    symbol: string;
    type: 'daily' | 'weekly' | 'technical' | 'fundamental' | 'custom';
    analysisId?: mongoose.Types.ObjectId;
    resultSummary?: string;
    overallScore?: number;
    recommendation?: string;
  };
  aiModel: {
    provider: string;
    modelName: string;
    version?: string;
  };
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: {
    inputCost: number;
    outputCost: number;
    totalCost: number;
    currency: string;
  };
  execution: {
    startTime: Date;
    endTime?: Date;
    duration?: number;
  };
  cache: {
    isCached: boolean;
    cacheHit: boolean;
    cacheSource?: string;
    cacheAge?: number;
  };
  dataSource: {
    primary: string;
    secondary?: string;
    dataFreshness?: string;
  };
  status: 'success' | 'failed' | 'partial' | 'cached';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const UsageTrackingSchema = new Schema<IUsageTracking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    analysis: {
      symbol: {
        type: String,
        required: true,
        uppercase: true,
      },
      type: {
        type: String,
        enum: ['daily', 'weekly', 'technical', 'fundamental', 'custom'],
        default: 'daily',
      },
      analysisId: {
        type: Schema.Types.ObjectId,
        ref: 'StockAnalysis',
      },
      resultSummary: String,
      overallScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      recommendation: {
        type: String,
        enum: ['strong_buy', 'buy', 'hold', 'wait', 'sell', 'strong_sell'],
      },
    },
    aiModel: {
      provider: {
        type: String,
        required: true,
        enum: ['deepseek', 'openai', 'anthropic', 'local'],
      },
      modelName: {
        type: String,
        required: true,
      },
      version: String,
    },
    tokens: {
      input: {
        type: Number,
        default: 0,
        min: 0,
      },
      output: {
        type: Number,
        default: 0,
        min: 0,
      },
      total: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    cost: {
      inputCost: {
        type: Number,
        default: 0,
        min: 0,
      },
      outputCost: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalCost: {
        type: Number,
        default: 0,
        min: 0,
      },
      currency: {
        type: String,
        default: 'cny',
      },
    },
    execution: {
      startTime: {
        type: Date,
        required: true,
      },
      endTime: Date,
      duration: {
        type: Number,
        min: 0,
      },
    },
    cache: {
      isCached: {
        type: Boolean,
        default: false,
      },
      cacheHit: {
        type: Boolean,
        default: false,
      },
      cacheSource: String,
      cacheAge: Number,
    },
    dataSource: {
      primary: {
        type: String,
        required: true,
      },
      secondary: String,
      dataFreshness: String,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'partial', 'cached'],
      default: 'success',
    },
    errorMessage: String,
  },
  {
    timestamps: true,
    collection: 'usage_tracking',
  }
);

// 索引优化
UsageTrackingSchema.index({ userId: 1, createdAt: -1 });
UsageTrackingSchema.index({ 'analysis.symbol': 1, createdAt: -1 });
UsageTrackingSchema.index({ 'aiModel.provider': 1, 'aiModel.modelName': 1 });
UsageTrackingSchema.index({ 'analysis.type': 1, status: 1 });
UsageTrackingSchema.index({ 'cost.totalCost': 1 });
UsageTrackingSchema.index({ createdAt: -1 });
UsageTrackingSchema.index({ userId: 1, 'analysis.symbol': 1, createdAt: -1 });
UsageTrackingSchema.index({ userId: 1, createdAt: -1, status: 1 });

// 静态方法：记录分析使用
UsageTrackingSchema.statics.recordAnalysis = async function(
  userId: string,
  data: {
    symbol: string;
    type: string;
    model: { provider: string; modelName: string };
    tokens: { input: number; output: number; total: number };
    cost: { inputCost: number; outputCost: number; totalCost: number };
    executionTime: number;
    dataSource: string;
    status: string;
  }
) {
  return await this.create({
    userId: new mongoose.Types.ObjectId(userId),
    analysis: {
      symbol: data.symbol.toUpperCase(),
      type: data.type,
    },
    aiModel: data.model,
    tokens: data.tokens,
    cost: data.cost,
    execution: {
      startTime: new Date(),
      endTime: new Date(),
      duration: data.executionTime,
    },
    dataSource: {
      primary: data.dataSource,
    },
    status: data.status,
  });
};

// 静态方法：获取用户月度统计
UsageTrackingSchema.statics.getUserMonthlyStats = async function(
  userId: string,
  year: number,
  month: number
) {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  
  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        status: { $in: ['success', 'cached'] },
      },
    },
    {
      $group: {
        _id: null,
        totalAnalyses: { $sum: 1 },
        totalTokens: { $sum: '$tokens.total' },
        totalCost: { $sum: '$cost.totalCost' },
        avgExecutionTime: { $avg: '$execution.duration' },
        symbolBreakdown: {
          $push: '$analysis.symbol',
        },
        modelBreakdown: {
          $push: '$aiModel.modelName',
        },
      },
    },
  ]);
  
  return stats[0] || {
    totalAnalyses: 0,
    totalTokens: 0,
    totalCost: 0,
    avgExecutionTime: 0,
    symbolBreakdown: [],
    modelBreakdown: [],
  };
};

// 静态方法：获取用户最常分析的股票
UsageTrackingSchema.statics.getTopAnalyzedSymbols = async function(
  userId: string,
  limit: number = 10
) {
  const results = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: { $in: ['success', 'cached'] },
      },
    },
    {
      $group: {
        _id: '$analysis.symbol',
        count: { $sum: 1 },
        avgScore: { $avg: '$analysis.overallScore' },
        lastAnalyzed: { $max: '$createdAt' },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: limit,
    },
  ]);
  
  return results;
};

// 静态方法：计算用户总成本
UsageTrackingSchema.statics.calculateUserTotalCost = async function(userId: string) {
  const result = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: 'success',
      },
    },
    {
      $group: {
        _id: null,
        totalCost: { $sum: '$cost.totalCost' },
        totalInputTokens: { $sum: '$tokens.input' },
        totalOutputTokens: { $sum: '$tokens.output' },
        analysisCount: { $sum: 1 },
      },
    },
  ]);
  
  return result[0] || {
    totalCost: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    analysisCount: 0,
  };
};

// 静态方法：按模型分组的使用统计
UsageTrackingSchema.statics.getUsageByModel = async function(userId: string) {
  return await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: { $in: ['success', 'cached'] },
      },
    },
    {
      $group: {
        _id: {
          provider: '$aiModel.provider',
          model: '$aiModel.modelName',
        },
        count: { $sum: 1 },
        totalTokens: { $sum: '$tokens.total' },
        totalCost: { $sum: '$cost.totalCost' },
        avgExecutionTime: { $avg: '$execution.duration' },
      },
    },
    {
      $sort: { 'totalCost': -1 },
    },
  ]);
};

// 创建并导出模型
const UsageTracking: Model<IUsageTracking> = 
  mongoose.models.UsageTracking || mongoose.model<IUsageTracking>('UsageTracking', UsageTrackingSchema);

export default UsageTracking;
// 注意：模型定价常量请查看 python-service/constants/model_pricing.py
