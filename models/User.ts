/**
 * User Model
 * 
 * 用户基础认证模型，包含订阅信息和使用统计
 * 
 * @module models/User
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

// TypeScript Interface
export interface IUser extends Document {
  email: string;
  name: string;
  password?: string;  // 添加密码字段
  image?: string;
  emailVerified?: Date;
  
  // OAuth提供商信息
  accounts?: {
    provider: string;
    providerAccountId: string;
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
  }[];
  
  // 订阅信息
  subscription: {
    tier: 'free' | 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'past_due' | 'trialing';
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    cancelAtPeriodEnd?: boolean;
  };
  
  // 使用统计
  usage: {
    analysesThisMonth: number;
    totalAnalyses: number;
    lastAnalysisDate?: Date;
    totalTokensUsed: number;
    totalCost: number;
  };
  
  // 账户状态
  isActive: boolean;
  isBlocked: boolean;
  blockReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, '邮箱地址为必填项'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, '请输入有效的邮箱地址'],
    },
    name: {
      type: String,
      required: [true, '用户名为必填项'],
      trim: true,
      maxlength: [100, '用户名不能超过100个字符'],
    },
    password: {
      type: String,
      select: false, // 默认不返回密码
    },
    image: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    
    // OAuth账户信息
    accounts: [{
      provider: {
        type: String,
        required: true,
      },
      providerAccountId: {
        type: String,
        required: true,
      },
      access_token: String,
      refresh_token: String,
      expires_at: Number,
    }],
    
    // 订阅信息
    subscription: {
      tier: {
        type: String,
        enum: ['free', 'basic', 'pro', 'enterprise'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'cancelled', 'past_due', 'trialing'],
        default: 'active',
      },
      currentPeriodStart: Date,
      currentPeriodEnd: Date,
      stripeCustomerId: String,
      stripeSubscriptionId: String,
      cancelAtPeriodEnd: {
        type: Boolean,
        default: false,
      },
    },
    
    // 使用统计
    usage: {
      analysesThisMonth: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalAnalyses: {
        type: Number,
        default: 0,
        min: 0,
      },
      lastAnalysisDate: Date,
      totalTokensUsed: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalCost: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    
    // 账户状态
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// 索引优化
UserSchema.index({ email: 1 });
UserSchema.index({ 'subscription.tier': 1 });
UserSchema.index({ 'subscription.status': 1 });
UserSchema.index({ createdAt: -1 });

// 虚拟字段
UserSchema.virtual('isPremium').get(function() {
  return ['basic', 'pro', 'enterprise'].includes(this.subscription.tier);
});

UserSchema.virtual('canAnalyze').get(function() {
  // 允许分析的条件：账户活跃、未被封禁、订阅有效
  return this.isActive && !this.isBlocked && this.subscription.status === 'active';
});

// 实例方法
UserSchema.methods.canPerformAnalysis = function(): boolean {
  // 检查是否还能进行分析
  const FREE_LIMIT = 10;
  const BASIC_LIMIT = 100;
  const PRO_LIMIT = 1000;
  const ENTERPRISE_LIMIT = -1; // 无限制
  
  const limits = {
    free: FREE_LIMIT,
    basic: BASIC_LIMIT,
    pro: PRO_LIMIT,
    enterprise: ENTERPRISE_LIMIT,
  };
  
  const limit = limits[this.subscription.tier as keyof typeof limits];
  
  // 企业版无限制
  if (limit === ENTERPRISE_LIMIT) return true;
  
  // 检查是否超出月度限制
  return this.usage.analysesThisMonth < limit;
};

UserSchema.methods.getRemainingAnalyses = function(): number {
  const limits = {
    free: 10,
    basic: 100,
    pro: 1000,
    enterprise: -1,
  };
  
  const limit = limits[this.subscription.tier as keyof typeof limits];
  
  if (limit === -1) return -1; // 无限制
  
  return Math.max(0, limit - this.usage.analysesThisMonth);
};

UserSchema.methods.resetMonthlyUsage = function(): void {
  const now = new Date();
  const lastMonth = this.usage.lastAnalysisDate;
  
  // 如果是新月，重置月度使用量
  if (!lastMonth || lastMonth.getMonth() !== now.getMonth()) {
    this.usage.analysesThisMonth = 0;
  }
};

// 静态方法
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findActiveSubscribers = function() {
  return this.find({
    'subscription.status': 'active',
    'subscription.tier': { $ne: 'free' },
  });
};

// 创建并导出模型
const User: Model<IUser> = 
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
