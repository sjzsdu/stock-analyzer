/**
 * 新闻组件
 *
 * 展示股票相关新闻
 *
 * @module components/stock/NewsFeed
 */

'use client';

import { Newspaper, ExternalLink, Clock } from 'lucide-react';

interface NewsItem {
  title: string;
  url: string;
  source: string;
  publish_date: string;
  sentiment?: string;
}

interface NewsFeedProps {
  news: NewsItem[];
  symbol: string;
  maxItems?: number;
}

function getSentimentColor(sentiment?: string): string {
  switch (sentiment?.toLowerCase()) {
    case 'positive':
      return 'text-green-400 bg-green-500/10 border-green-500/30';
    case 'negative':
      return 'text-red-400 bg-red-500/10 border-red-500/30';
    default:
      return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  }
}

function getSentimentIcon(sentiment?: string): string {
  switch (sentiment?.toLowerCase()) {
    case 'positive':
      return '📈';
    case 'negative':
      return '📉';
    default:
      return '📰';
  }
}

export default function NewsFeed({ news, symbol, maxItems = 10 }: NewsFeedProps) {
  if (!news || news.length === 0) {
    return (
      <div className="glass-effect rounded-3xl p-6 card-hover">
        <div className="text-center py-8">
          <Newspaper className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white/60 mb-2">暂无新闻数据</h3>
          <p className="text-white/40 text-sm">当前没有找到相关的新闻资讯</p>
        </div>
      </div>
    );
  }

  const displayNews = news.slice(0, maxItems);

  return (
    <div className="glass-effect rounded-3xl overflow-hidden card-hover">
      {/* 标题 */}
      <div className="px-6 py-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-orange-400" />
          最新资讯
        </h3>
        <p className="text-white/60 text-sm mt-1">{symbol} • 最近更新</p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {displayNews.map((item, index) => (
            <div
              key={index}
              className="group border border-white/10 rounded-xl p-4 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                {/* 情感图标 */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  getSentimentColor(item.sentiment)
                }`}>
                  {getSentimentIcon(item.sentiment)}
                </div>

                {/* 新闻内容 */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white/90 font-medium mb-2 line-clamp-2 group-hover:text-white transition-colors">
                    {item.title}
                  </h4>

                  <div className="flex items-center gap-4 text-sm text-white/50">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                      <span>{item.source}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.publish_date}</span>
                    </div>

                    {item.sentiment && (
                      <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        getSentimentColor(item.sentiment)
                      }`}>
                        {item.sentiment === 'positive' ? '利好' :
                         item.sentiment === 'negative' ? '利空' : '中性'}
                      </div>
                    )}
                  </div>
                </div>

                {/* 外部链接 */}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 hover:bg-orange-500/20 flex items-center justify-center text-white/40 hover:text-orange-400 transition-all duration-300 group/link"
                >
                  <ExternalLink className="w-4 h-4 group-hover/link:scale-110 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* 查看更多 */}
        {news.length > maxItems && (
          <div className="mt-6 text-center">
            <button className="px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-500/30 hover:border-orange-500/50 rounded-xl text-white/80 hover:text-white transition-all duration-300 flex items-center gap-2 mx-auto">
              <span>查看更多资讯</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}