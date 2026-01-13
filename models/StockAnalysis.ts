import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true },
  market: String,
  overallScore: Number,
  recommendation: { 
    type: String, 
    enum: ['strong_buy', 'buy', 'hold', 'wait', 'sell'] 
  },
  confidence: Number,
  summary: String,
  roleAnalysis: [{
    role: { 
      type: String, 
      enum: ['value', 'technical', 'growth', 'fundamental', 'risk', 'macro'] 
    },
    score: Number,
    analysis: String,
    keyPoints: [String]
  }],
  risks: [String],
  opportunities: [String],
  model: String,
  processingTime: Number,
  tokenUsage: {
    input: Number,
    output: Number
  }
}, { timestamps: true });

export default mongoose.models.StockAnalysis || mongoose.model('StockAnalysis', analysisSchema);
