/**
 * User Preferences Model
 * 
 * 用户个性化设置，包含语言、模型选择、通知偏好等
 * 
 * @module models/UserPreferences
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

// TypeScript Interface
export interface IUserPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  
  // 语言设置
  language: {
    interface: 'zh' | 'en';
    analysis: 'zh' | 'en' | 'auto';
    financialTerms: 'original' | 'translated' | 'bilingual';
    dateFormat: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';
    numberFormat: 'US' | 'CN' | 'EU';
  };
  
  // AI模型偏好 (避免使用model属性名)
  aiModel: {
    default: string;
    valueAnalysis?: string;
    technicalAnalysis?: string;
    growthAnalysis?: string;
    riskAnalysis?: string;
    macroAnalysis?: string;
    costOptimization: boolean;
    qualityPriority: 'speed' | 'balanced' | 'quality';
  };
  
  // 分析设置
  analysis: {
    defaultSymbolType: 'A-share' | 'HK' | 'US' | 'all';
    enableCache: boolean;
    cacheDuration: number;
    enableNotifications: boolean;
    notificationTypes: {
      analysisComplete: boolean;
      priceAlert: boolean;
      newsAlert: boolean;
      weeklyReport: boolean;
    };
  };
  
  // 显示设置
  display: {
    theme: 'light' | 'dark' | 'system';
    compactMode: boolean;
    showTechnicalIndicators: boolean;
    chartDefaultPeriod: '1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX';
    defaultCurrency: 'CNY' | 'USD' | 'HKD';
  };
  
  // 隐私设置
  privacy: {
    showHistoryInDashboard: boolean;
    allowAnalytics: boolean;
    showProfilePublicly: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const UserPreferencesSchema = new Schema<IUserPreferences>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'User',
    },
    
    // 语言设置
    language: {
      interface: {
        type: String,
        enum: ['zh', 'en'],
        default: 'zh',
      },
      analysis: {
        type: String,
        enum: ['zh', 'en', 'auto'],
        default: 'auto',
      },
      financialTerms: {
        type: String,
        enum: ['original', 'translated', 'bilingual'],
        default: 'original',
      },
      dateFormat: {
        type: String,
        enum: ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY'],
        default: 'YYYY-MM-DD',
      },
      numberFormat: {
        type: String,
        enum: ['US', 'CN', 'EU'],
        default: 'US',
      },
    },
    
    // AI模型偏好
    aiModel: {
      default: {
        type: String,
        default: 'deepseek-v3',
      },
      valueAnalysis: String,
      technicalAnalysis: String,
      growthAnalysis: String,
      riskAnalysis: String,
      macroAnalysis: String,
      costOptimization: {
        type: Boolean,
        default: true,
      },
      qualityPriority: {
        type: String,
        enum: ['speed', 'balanced', 'quality'],
        default: 'balanced',
      },
    },
    
    // 分析设置
    analysis: {
      defaultSymbolType: {
        type: String,
        enum: ['A-share', 'HK', 'US', 'all'],
        default: 'all',
      },
      enableCache: {
        type: Boolean,
        default: true,
      },
      cacheDuration: {
        type: Number,
        default: 24,
        min: 1,
        max: 168,
      },
      enableNotifications: {
        type: Boolean,
        default: true,
      },
      notificationTypes: {
        analysisComplete: {
          type: Boolean,
          default: true,
        },
        priceAlert: {
          type: Boolean,
          default: false,
        },
        newsAlert: {
          type: Boolean,
          default: false,
        },
        weeklyReport: {
          type: Boolean,
          default: false,
        },
      },
    },
    
    // 显示设置
    display: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      compactMode: {
        type: Boolean,
        default: false,
      },
      showTechnicalIndicators: {
        type: Boolean,
        default: true,
      },
      chartDefaultPeriod: {
        type: String,
        enum: ['1M', '3M', '6M', '1Y', '5Y', 'MAX'],
        default: '1Y',
      },
      defaultCurrency: {
        type: String,
        enum: ['CNY', 'USD', 'HKD'],
        default: 'CNY',
      },
    },
    
    // 隐私设置
    privacy: {
      showHistoryInDashboard: {
        type: Boolean,
        default: true,
      },
      allowAnalytics: {
        type: Boolean,
        default: true,
      },
      showProfilePublicly: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
    collection: 'user_preferences',
  }
);

// 索引优化
UserPreferencesSchema.index({ userId: 1 }, { unique: true });

// 静态方法
UserPreferencesSchema.statics.findByUserId = function(userId: string) {
  return this.findOne({ userId: new mongoose.Types.ObjectId(userId) });
};

UserPreferencesSchema.statics.getDefaultPreferences = function() {
  return {
    language: {
      interface: 'zh',
      analysis: 'auto',
      financialTerms: 'original',
      dateFormat: 'YYYY-MM-DD',
      numberFormat: 'US',
    },
    aiModel: {
      default: 'deepseek-v3',
      costOptimization: true,
      qualityPriority: 'balanced',
    },
    analysis: {
      defaultSymbolType: 'all',
      enableCache: true,
      cacheDuration: 24,
      enableNotifications: true,
      notificationTypes: {
        analysisComplete: true,
        priceAlert: false,
        newsAlert: false,
        weeklyReport: false,
      },
    },
    display: {
      theme: 'system',
      compactMode: false,
      showTechnicalIndicators: true,
      chartDefaultPeriod: '1Y',
      defaultCurrency: 'CNY',
    },
    privacy: {
      showHistoryInDashboard: true,
      allowAnalytics: true,
      showProfilePublicly: false,
    },
  };
};

// 创建并导出模型
const UserPreferences: Model<IUserPreferences> = 
  mongoose.models.UserPreferences || mongoose.model<IUserPreferences>('UserPreferences', UserPreferencesSchema);

export default UserPreferences;
