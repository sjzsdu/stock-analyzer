import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  symbol: String,
  title: String,
  content: String,
  url: String,
  source: String,
  publishDate: Date,
  sentiment: { 
    type: Number,
    confidence: Number 
  }
}, { timestamps: true });

newsSchema.index({ symbol: 1, publishDate: -1 });

export default mongoose.models.NewsData || mongoose.model('NewsData', newsSchema);
