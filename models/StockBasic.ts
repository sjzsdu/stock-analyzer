/**
 * StockBasic Model - 增强版
 * 
 * 包含公司基本信息、财务指标、市场数据等
 * 
 * @module models/StockBasic
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

// TypeScript Interface
export interface IStockBasic extends Document {
  symbol: string;
  name: string;
  market: 'A' | 'HK' | 'US';
  
  // 基本信息
  basic: {
    exchange: string;
    listDate: Date;
    delistDate?: Date;
    exchangeName: string;
    industry?: string;
    sector?: string;
    fullIndustry?: string;
    concept?: string[];
    area?: string;
  };
  
  // 公司信息
  company: {
    fullName?: string;
    shortName?: string;
    englishName?: string;
    province?: string;
    city?: string;
    address?: string;
    website?: string;
    email?: string;
    phone?: string;
    fax?: string;
    zipCode?: string;
    employees?: number;
    office?: string;
    businessScope?: string;
    mainBusiness?: string;
    introduction?: string;
    chairman?: string;
    manager?: string;
    secretary?: string;
    registeredCapital?: number;
    paidInCapital?: number;
    setupDate?: Date;
    provinceCode?: string;
    cityCode?: string;
    introductionHtml?: string;
  };
  
  // 股价数据
  price: {
    current: number;
    open: number;
    high: number;
    low: number;
    preClose: number;
    change: number;
    changePercent: number;
    volume: number;
    amount: number;
    turnoverRate: number;
    transactionStatus: string;
    updateTime: Date;
  };
  
  // 估值指标
  valuation: {
    marketCap: number;
    circulatingMarketCap?: number;
    pe: number;
    peTtm?: number;
    pb?: number;
    ps?: number;
    pcf?: number;
    ev?: number;
    evToEbitda?: number;
    evToRevenue?: number;
    dividendYield?: number;
    dividendPerShare?: number;
    eps: number;
    epsYoy?: number;
    epsQoq?: number;
    bvps?: number;
    hts?: number;
    psTtm?: number;
  };
  
  // 财务指标
  financial: {
    // 盈利能力
    roe?: number;
    roeWeighted?: number;
    netProfitMargin?: number;
    grossProfitMargin?: number;
    operatingProfitMargin?: number;
    netProfitMarginTt?: number;
    
    // 成长性
    revenueYoy?: number;
    profitYoy?: number;
    revenueQoq?: number;
    profitQoq?: number;
    totalAssetsYoy?: number;
    netAssetsYoy?: number;
    
    // 运营能力
    inventoryTurnover?: number;
    receivablesTurnover?: number;
    currentAssetTurnover?: number;
    totalAssetTurnover?: number;
    
    // 偿债能力
    currentRatio?: number;
    quickRatio?: number;
    cashRatio?: number;
    debtToAsset?: number;
    debtToEquity?: number;
    interestCoverageRatio?: number;
    
    // 现金流
    operatingCashFlowToRevenue?: number;
    netCashFlowToOperatingCashFlow?: number;
    freeCashFlowToOperatingCashFlow?: number;
  };
  
  // 杜邦分析
  dupont: {
    roe: number;
    netProfitMargin: number;
    totalAssetTurnover: number;
    equityMultiplier: number;
    roa?: number;
  };
  
  // 分红送股
  dividend: {
    type?: string;
    plan?: string;
    bonusShareRatio?: number;
    rightsIssueRatio?: number;
    cashDividendRatio?: number;
    dividendPerShare?: number;
    recordDate?: Date;
    exDate?: Date;
    paymentDate?: Date;
    announcementDate?: Date;
    lastUpdate?: Date;
  };
  
  // 限售解禁
  restricted: {
    restrictedShares?: number;
    restrictedRatio?: number;
    liftShares?: number;
    liftRatio?: number;
    liftDate?: Date;
  };
  
  // 机构持仓
  holders: {
    totalShares?: number;
    totalRatio?: number;
    tradableShares?: number;
    tradableRatio?: number;
    updateDate?: Date;
  };
  
  // 53周高低
  range52Week: {
    low: number;
    high: number;
    lowDate?: Date;
    highDate?: Date;
  };
  
  // 其他指标
  others: {
    beta?: number;
    volatility?: number;
    averageVolume?: number;
    averageTurnover?: number;
    listingStatus?: string;
    status?: string;
    sentiment?: number;
  };
  
  // 原始数据
  rawData?: {
    source: string;
    rawInfo?: any;
    collectedAt: Date;
  };
  
  // 统计
  statistics: {
    updateCount: number;
    lastAnalysisDate?: Date;
    dataCompleteness: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const StockBasicSchema = new Schema<IStockBasic>(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    market: {
      type: String,
      enum: ['A', 'HK', 'US'],
      required: true,
    },
    
    // 基本信息
    basic: {
      exchange: String,
      listDate: Date,
      delistDate: Date,
      exchangeName: String,
      industry: String,
      sector: String,
      fullIndustry: String,
      concept: [String],
      area: String,
    },
    
    // 公司信息
    company: {
      fullName: String,
      shortName: String,
      englishName: String,
      province: String,
      city: String,
      address: String,
      website: String,
      email: String,
      phone: String,
      fax: String,
      zipCode: String,
      employees: Number,
      office: String,
      businessScope: String,
      mainBusiness: String,
      introduction: String,
      chairman: String,
      manager: String,
      secretary: String,
      registeredCapital: Number,
      paidInCapital: Number,
      setupDate: Date,
      provinceCode: String,
      cityCode: String,
      introductionHtml: String,
    },
    
    // 股价数据
    price: {
      current: Number,
      open: Number,
      high: Number,
      low: Number,
      preClose: Number,
      change: Number,
      changePercent: Number,
      volume: Number,
      amount: Number,
      turnoverRate: Number,
      transactionStatus: String,
      updateTime: Date,
    },
    
    // 估值指标
    valuation: {
      marketCap: Number,
      circulatingMarketCap: Number,
      pe: Number,
      peTtm: Number,
      pb: Number,
      ps: Number,
      pcf: Number,
      ev: Number,
      evToEbitda: Number,
      evToRevenue: Number,
      dividendYield: Number,
      dividendPerShare: Number,
      eps: Number,
      epsYoy: Number,
      epsQoq: Number,
      bvps: Number,
      hts: Number,
      psTtm: Number,
    },
    
    // 财务指标
    financial: {
      // 盈利能力
      roe: Number,
      roeWeighted: Number,
      netProfitMargin: Number,
      grossProfitMargin: Number,
      operatingProfitMargin: Number,
      netProfitMarginTt: Number,
      
      // 成长性
      revenueYoy: Number,
      profitYoy: Number,
      revenueQoq: Number,
      profitQoq: Number,
      totalAssetsYoy: Number,
      netAssetsYoy: Number,
      
      // 运营能力
      inventoryTurnover: Number,
      receivablesTurnover: Number,
      currentAssetTurnover: Number,
      totalAssetTurnover: Number,
      
      // 偿债能力
      currentRatio: Number,
      quickRatio: Number,
      cashRatio: Number,
      debtToAsset: Number,
      debtToEquity: Number,
      interestCoverageRatio: Number,
      
      // 现金流
      operatingCashFlowToRevenue: Number,
      netCashFlowToOperatingCashFlow: Number,
      freeCashFlowToOperatingCashFlow: Number,
    },
    
    // 杜邦分析
    dupont: {
      roe: Number,
      netProfitMargin: Number,
      totalAssetTurnover: Number,
      equityMultiplier: Number,
      roa: Number,
    },
    
    // 分红送股
    dividend: {
      type: String,
      plan: String,
      bonusShareRatio: Number,
      rightsIssueRatio: Number,
      cashDividendRatio: Number,
      dividendPerShare: Number,
      recordDate: Date,
      exDate: Date,
      paymentDate: Date,
      announcementDate: Date,
      lastUpdate: Date,
    },
    
    // 限售解禁
    restricted: {
      restrictedShares: Number,
      restrictedRatio: Number,
      liftShares: Number,
      liftRatio: Number,
      liftDate: Date,
    },
    
    // 机构持仓
    holders: {
      totalShares: Number,
      totalRatio: Number,
      tradableShares: Number,
      tradableRatio: Number,
      updateDate: Date,
    },
    
    // 53周高低
    range52Week: {
      low: Number,
      high: Number,
      lowDate: Date,
      highDate: Date,
    },
    
    // 其他指标
    others: {
      beta: Number,
      volatility: Number,
      averageVolume: Number,
      averageTurnover: Number,
      listingStatus: String,
      status: String,
      sentiment: Number,
    },
    
    // 原始数据
    rawData: {
      source: String,
      rawInfo: Schema.Types.Mixed,
      collectedAt: Date,
    },
    
    // 统计
    statistics: {
      updateCount: { type: Number, default: 0 },
      lastAnalysisDate: Date,
      dataCompleteness: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    collection: 'stock_basics',
  }
);

// 索引
StockBasicSchema.index({ symbol: 1, market: 1 });
StockBasicSchema.index({ 'basic.industry': 1 });
StockBasicSchema.index({ 'basic.area': 1 });
StockBasicSchema.index({ 'valuation.marketCap': -1 });
StockBasicSchema.index({ 'price.current': -1 });
StockBasicSchema.index({ 'financial.roe': -1 });
StockBasicSchema.index({ createdAt: -1 });
StockBasicSchema.index({ updatedAt: -1 });

// 静态方法
StockBasicSchema.statics.findBySymbol = function(symbol: string, market: string = 'A') {
  return this.findOne({ symbol: symbol.toUpperCase(), market });
};

StockBasicSchema.statics.getStockWithDetails = async function(symbol: string) {
  return await this.findOne({ symbol: symbol.toUpperCase() })
    .select('-rawData.rawInfo'); // 不返回原始数据
};

StockBasicSchema.statics.searchByIndustry = function(industry: string, limit: number = 20) {
  return this.find({ 'basic.industry': industry })
    .sort({ 'valuation.marketCap': -1 })
    .limit(limit);
};

StockBasicSchema.statics.getTopByRoe = function(limit: number = 20, minRoe: number = 10) {
  return this.find({ 'financial.roe': { $gte: minRoe } })
    .sort({ 'financial.roe': -1 })
    .limit(limit);
};

// 虚拟字段
StockBasicSchema.virtual('isChinaConcept').get(function() {
  return this.basic?.concept?.some((c: string) => 
    ['新能源', '互联网', '消费', '医药', '科技'].includes(c)
  ) || false;
});

StockBasicSchema.virtual('dataCompletenessScore').get(function() {
  const score = {
    company: this.company?.fullName ? 20 : 0,
    financial: this.financial?.roe ? 20 : 0,
    valuation: this.valuation?.pe ? 20 : 0,
    dividend: this.dividend?.plan ? 20 : 0,
    holders: this.holders?.totalShares ? 20 : 0,
  };
  return Math.min(100, Object.values(score).reduce((a, b) => a + b, 0));
});

// 创建并导出模型
const StockBasic: Model<IStockBasic> = 
  mongoose.models.StockBasic || mongoose.model<IStockBasic>('StockBasic', StockBasicSchema);

export default StockBasic;
