import mongoose from 'mongoose';

const financialDataSchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true },
  market: String,
  year: Number,
  quarter: String,
  revenue: Number,
  netProfit: Number,
  roe: Number,
  roic: Number,
  debtRatio: Number,
  currentRatio: Number,
  cashFlow: Number,
  eps: Number,
  bps: Number,
  history: {
    revenue: [Number],
    netProfit: [Number],
    roe: [Number],
    roic: [Number]
  }
}, { timestamps: true });

export default mongoose.models.FinancialData || mongoose.model('FinancialData', financialDataSchema);
