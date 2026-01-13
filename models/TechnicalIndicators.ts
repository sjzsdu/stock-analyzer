import mongoose from 'mongoose';

const technicalSchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true },
  date: Date,
  ma: { ma5: Number, ma10: Number, ma20: Number, ma60: Number },
  macd: { dif: Number, dea: Number, macd: Number },
  rsi: Number,
  kdj: { k: Number, d: Number, j: Number },
  bollinger: { upper: Number, middle: Number, lower: Number },
  volumeRatio: Number,
  kline: [[Number]]
}, { timestamps: true });

export default mongoose.models.TechnicalIndicators || mongoose.model('TechnicalIndicators', technicalSchema);
