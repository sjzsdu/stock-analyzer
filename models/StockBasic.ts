import mongoose from 'mongoose';

const stockBasicSchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true },
  name: { type: String, required: true },
  market: { 
    type: String, 
    enum: ['A', 'HK', 'US'], 
    required: true 
  },
  currentPrice: Number,
  marketCap: Number,
  peRatio: Number,
  pbRatio: Number,
  dividendYield: Number,
  volume: Number,
  turnoverRate: Number,
  exchange: String,
  currency: String,
  lastUpdated: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  collection: 'stock_basics'
});

stockBasicSchema.index({ symbol: 1, market: 1 });

export default mongoose.models.StockBasic || mongoose.model('StockBasic', stockBasicSchema);
