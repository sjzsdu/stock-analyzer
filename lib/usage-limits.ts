/**
 * 使用限制服务
 * 
 * 检查用户订阅层级、分析次数限制、API调用频率等
 * 
 * @module lib/usage-limits
 */

import User from '@/models/User';
import mongoose from 'mongoose';

/**
 * 使用限制检查结果
 */
export interface UsageLimitResult {
  allowed: boolean;
  reason?: string;
  remaining?: number;
  limit?: number;
  resetDate?: Date;
  tier?: string;
}

/**
 * 订阅层级配置
 */
export const SUBSCRIPTION_CONFIG = {
  free: {
    analysesPerMonth: 10,
    apiCallsPerDay: 50,
    dataRetentionDays: 30,
    availableModels: ['deepseek-v3'] as string[],
  },
  basic: {
    analysesPerMonth: 100,
    apiCallsPerDay: 200,
    dataRetentionDays: 365,
    availableModels: ['deepseek-v3', 'deepseek-v3-reasoner'] as string[],
  },
  pro: {
    analysesPerMonth: 1000,
    apiCallsPerDay: 1000,
    dataRetentionDays: 730,
    availableModels: ['deepseek-v3', 'deepseek-v3-reasoner', 'gpt-4o-mini'] as string[],
  },
  enterprise: {
    analysesPerMonth: -1,
    apiCallsPerDay: 10000,
    dataRetentionDays: -1,
    availableModels: ['deepseek-v3', 'deepseek-v3-reasoner', 'gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet'] as string[],
  },
} as const;

/**
 * 使用限制服务类
 */
class UsageLimitService {
  /**
   * 检查用户是否可以进行分析
   */
  static async checkAnalysisLimit(userId: string): Promise<UsageLimitResult> {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return { allowed: false, reason: '用户不存在' };
      }
      
      // 检查账户状态
      if (!user.isActive) {
        return { allowed: false, reason: '账户已被禁用' };
      }
      
      if (user.isBlocked) {
        return { allowed: false, reason: `账户已被封禁：${user.blockReason || '未知原因'}` };
      }
      
      // 检查订阅状态
      if (user.subscription.status !== 'active' && user.subscription.status !== 'trialing') {
        return { allowed: false, reason: '订阅已过期，请续订', tier: user.subscription.tier };
      }
      
      const tier = user.subscription.tier as keyof typeof SUBSCRIPTION_CONFIG;
      const config = SUBSCRIPTION_CONFIG[tier];
      
      // 企业版无限制
      if (config.analysesPerMonth === -1) {
        return { allowed: true, remaining: -1, tier };
      }
      
      // 检查月度使用量
      const now = new Date();
      const lastAnalysis = user.usage.lastAnalysisDate;
      
      // 如果是新月份，重置使用量
      if (lastAnalysis && lastAnalysis.getMonth() !== now.getMonth()) {
        user.usage.analysesThisMonth = 0;
        await user.save();
      }
      
      const remaining = Math.max(0, config.analysesPerMonth - user.usage.analysesThisMonth);
      
      if (user.usage.analysesThisMonth >= config.analysesPerMonth) {
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return {
          allowed: false,
          reason: `本月分析次数已用完（${config.analysesPerMonth}次/月）`,
          remaining: 0,
          limit: config.analysesPerMonth,
          resetDate: nextMonth,
          tier,
        };
      }
      
      return { allowed: true, remaining, limit: config.analysesPerMonth, tier };
      
    } catch (error) {
      console.error('检查分析限制失败:', error);
      return { allowed: false, reason: '系统错误，请稍后重试' };
    }
  }
  
  /**
   * 增加分析使用计数
   */
  static async incrementAnalysisUsage(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (user) {
      user.usage.analysesThisMonth += 1;
      user.usage.totalAnalyses += 1;
      user.usage.lastAnalysisDate = new Date();
      await user.save();
    }
  }
  
  /**
   * 检查API调用频率限制
   */
  static async checkApiRateLimit(userId: string): Promise<UsageLimitResult> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { allowed: false, reason: '用户不存在' };
      }
      
      const tier = user.subscription.tier as keyof typeof SUBSCRIPTION_CONFIG;
      const config = SUBSCRIPTION_CONFIG[tier];
      
      // 企业版无限制
      const apiCallsPerDay = config.apiCallsPerDay as number;
      if (apiCallsPerDay === -1) {
        return { allowed: true, remaining: -1, tier };
      }
      
      return { allowed: true, remaining: config.apiCallsPerDay, limit: config.apiCallsPerDay, tier };
      
    } catch (error) {
      console.error('检查API限制失败:', error);
      return { allowed: false, reason: '系统错误' };
    }
  }
  
  /**
   * 检查模型访问权限
   */
  static async checkModelAccess(userId: string, modelName: string): Promise<{
    allowed: boolean;
    reason?: string;
    availableModels?: string[];
  }> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { allowed: false, reason: '用户不存在' };
      }
      
      const tier = user.subscription.tier as keyof typeof SUBSCRIPTION_CONFIG;
      const config = SUBSCRIPTION_CONFIG[tier];
      
      if (config.availableModels.includes(modelName)) {
        return { allowed: true, availableModels: config.availableModels };
      }
      
      return {
        allowed: false,
        reason: `当前订阅无法使用该模型（${modelName}）。可用模型：${config.availableModels.join(', ')}`,
        availableModels: config.availableModels,
      };
      
    } catch (error) {
      console.error('检查模型权限失败:', error);
      return { allowed: false, reason: '系统错误' };
    }
  }
  
  /**
   * 获取用户使用统计
   */
  static async getUserUsageStats(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;
      
      const tier = user.subscription.tier as keyof typeof SUBSCRIPTION_CONFIG;
      const config = SUBSCRIPTION_CONFIG[tier];
      
      return {
        tier,
        status: user.subscription.status,
        analysesThisMonth: user.usage.analysesThisMonth,
        totalAnalyses: user.usage.totalAnalyses,
        monthlyLimit: config.analysesPerMonth,
        monthlyRemaining: config.analysesPerMonth === -1 ? -1 : Math.max(0, config.analysesPerMonth - user.usage.analysesThisMonth),
        availableModels: config.availableModels,
        dataRetentionDays: config.dataRetentionDays,
        lastAnalysisDate: user.usage.lastAnalysisDate,
      };
      
    } catch (error) {
      console.error('获取使用统计失败:', error);
      return null;
    }
  }
}

export default UsageLimitService;
