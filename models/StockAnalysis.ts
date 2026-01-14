import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true },
  market: String,
  stockName: String,
  overallScore: Number,
  recommendation: {
    type: String,
    enum: ['strong_buy', 'buy', 'hold', 'wait', 'sell', 'strong_sell']
  },
  confidence: Number, // Legacy field for backward compatibility
  confidenceScore: Number, // New enhanced confidence score
  summary: String,
  executiveSummary: String, // Enhanced summary
  keyFactors: [String], // Consolidated key factors
  roleAnalysis: [{
    role: {
      type: String,
      enum: ['value', 'technical', 'growth', 'fundamental', 'risk', 'macro']
    },
    score: Number,
    analysis: String,
    keyPoints: [String]
  }],
  // Enhanced agent results with detailed analysis
  agentResults: [{
    agent: {
      type: String,
      enum: ['value', 'technical', 'growth', 'fundamental', 'risk', 'macro']
    },
    summary: String,
    score: Number,
    confidence: Number,
    recommendation: String,
    key_factors: [String],
    risks: [String],
    details: mongoose.Schema.Types.Mixed,
    raw_output: String
  }],
  risks: [String],
  opportunities: [String],
  model: String,
  processingTime: Number,
  tokenUsage: {
    input: Number,
    output: Number
  },
  generatedAt: Date
}, { timestamps: true });

export default mongoose.models.StockAnalysis || mongoose.model('StockAnalysis', analysisSchema);
