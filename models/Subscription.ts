/**
 * Subscription Model
 * 
 * 用户订阅管理，包含订阅层级、周期、使用限制等
 * 
 * @module models/Subscription
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

// TypeScript Interface
export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'paused';
  stripe: {
    customerId?: string;
    subscriptionId?: string;
    priceId?: string;
    productId?: string;
  };
  period: {
    interval: 'month' | 'quarter' | 'year';
    start?: Date;
    end?: Date;
    currentCycleStart?: Date;
    currentCycleEnd?: Date;
    usedAnalyses: number;
    usedApiCalls: number;
  };
  limits: {
    analysesPerPeriod: number;
    apiCallsPerDay: number;
    dataRetentionDays: number;
    modelAccess: string[];
    features: string[];
  };
  payment: {
    currency: string;
    amount: number;
    lastPaymentDate?: Date;
    lastPaymentStatus?: 'succeeded' | 'failed' | 'pending';
    failedPaymentAttempts: number;
    nextPaymentRetry?: Date;
  };
  pendingChange?: {
    newTier: string;
    effectiveDate: Date;
    prorationAmount: number;
  };
  trial?: {
    isTrial: boolean;
    trialStart?: Date;
    trialEnd?: Date;
    trialUsed: boolean;
  };
  cancellation?: {
    cancelledAt?: Date;
    cancelReason?: string;
    feedback?: string;
    reactivatable: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'User',
    },
    tier: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'past_due', 'trialing', 'paused'],
      default: 'active',
    },
    stripe: {
      customerId: String,
      subscriptionId: String,
      priceId: String,
      productId: String,
    },
    period: {
      interval: {
        type: String,
        enum: ['month', 'quarter', 'year'],
        default: 'month',
      },
      start: Date,
      end: Date,
      currentCycleStart: Date,
      currentCycleEnd: Date,
      usedAnalyses: {
        type: Number,
        default: 0,
        min: 0,
      },
      usedApiCalls: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    limits: {
      analysesPerPeriod: {
        type: Number,
        default: 10,
        min: -1,
      },
      apiCallsPerDay: {
        type: Number,
        default: 50,
        min: -1,
      },
      dataRetentionDays: {
        type: Number,
        default: 30,
        min: -1,
      },
      modelAccess: [String],
      features: [String],
    },
    payment: {
      currency: {
        type: String,
        default: 'cny',
      },
      amount: {
        type: Number,
        default: 0,
        min: 0,
      },
      lastPaymentDate: Date,
      lastPaymentStatus: {
        type: String,
        enum: ['succeeded', 'failed', 'pending'],
      },
      failedPaymentAttempts: {
        type: Number,
        default: 0,
        min: 0,
      },
      nextPaymentRetry: Date,
    },
    pendingChange: {
      newTier: String,
      effectiveDate: Date,
      prorationAmount: Number,
    },
    trial: {
      isTrial: {
        type: Boolean,
        default: false,
      },
      trialStart: Date,
      trialEnd: Date,
      trialUsed: {
        type: Boolean,
        default: false,
      },
    },
    cancellation: {
      cancelledAt: Date,
      cancelReason: String,
      feedback: String,
      reactivatable: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
    collection: 'subscriptions',
  }
);

// 索引优化
SubscriptionSchema.index({ userId: 1 }, { unique: true });
SubscriptionSchema.index({ tier: 1, status: 1 });
SubscriptionSchema.index({ 'period.currentCycleEnd': 1 });
SubscriptionSchema.index({ status: 1, 'cancellation.reactivatable': 1 });

// 实例方法：检查是否还能进行分析
SubscriptionSchema.methods.canAnalyze = function(): boolean {
  if (this.status !== 'active' && this.status !== 'trialing') {
    return false;
  }
  const limit = this.limits.analysesPerPeriod;
  if (limit === -1) return true;
  return this.period.usedAnalyses < limit;
};

// 实例方法：获取剩余分析次数
SubscriptionSchema.methods.getRemainingAnalyses = function(): number {
  const limit = this.limits.analysesPerPeriod;
  if (limit === -1) return -1;
  return Math.max(0, limit - this.period.usedAnalyses);
};

// 实例方法：记录分析使用
SubscriptionSchema.methods.recordAnalysis = async function(): Promise<void> {
  this.period.usedAnalyses += 1;
  await this.save();
};

// 实例方法：记录API调用
SubscriptionSchema.methods.recordApiCall = async function(): Promise<boolean> {
  const limit = this.limits.apiCallsPerDay;
  if (limit === -1) {
    this.period.usedApiCalls += 1;
    await this.save();
    return true;
  }
  
  const now = new Date();
  const lastReset = this.period.currentCycleStart;
  const isNewDay = now.getDate() !== lastReset?.getDate() || 
                   now.getMonth() !== lastReset?.getMonth();
  
  if (isNewDay && lastReset) {
    this.period.usedApiCalls = 1;
  } else if (this.period.usedApiCalls < limit) {
    this.period.usedApiCalls += 1;
  } else {
    return false;
  }
  
  await this.save();
  return true;
};

// 创建并导出模型
const Subscription: Model<ISubscription> = 
  mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

export default Subscription;

// 订阅层级配置
export const SUBSCRIPTION_TIERS = {
  free: {
    name: '免费版',
    price: 0,
    analysesPerMonth: 10,
    apiCallsPerDay: 50,
    dataRetentionDays: 30,
    modelAccess: ['deepseek-v3'],
    features: ['基础股票分析', '标准分析速度'],
  },
  basic: {
    name: '基础版',
    price: 29,
    analysesPerMonth: 100,
    apiCallsPerDay: 200,
    dataRetentionDays: 365,
    modelAccess: ['deepseek-v3', 'deepseek-reasoner'],
    features: ['100次AI分析', '完整公司数据', '优先分析速度', '分析历史保存'],
  },
  pro: {
    name: '专业版',
    price: 99,
    analysesPerMonth: 1000,
    apiCallsPerDay: 1000,
    dataRetentionDays: 730,
    modelAccess: ['deepseek-v3', 'deepseek-reasoner', 'gpt-4o-mini'],
    features: ['1000次AI分析', '所有数据访问', '最快分析速度', '高级技术分析', '多模型选择'],
  },
  enterprise: {
    name: '企业版',
    price: 299,
    analysesPerMonth: -1,
    apiCallsPerDay: 10000,
    dataRetentionDays: -1,
    modelAccess: ['deepseek-v3', 'deepseek-reasoner', 'gpt-4o', 'claude-3.5'],
    features: ['无限AI分析', '专属客户支持', 'API访问', '白标定制', '团队协作'],
  },
} as const;
