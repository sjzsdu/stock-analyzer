'use client';

import React, { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';

interface AnalysisSummaryProps {
  content: string;
}

export default function AnalysisSummary({ content }: AnalysisSummaryProps) {
  return (
    <div className="glass-effect rounded-2xl p-6 border border-purple-500/20 card-hover">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">AI分析摘要</h3>
          <p className="text-white/60 text-sm">由多Agent系统综合生成</p>
        </div>
      </div>

      <div className="prose prose-invert prose-lg max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-h1:text-2xl prose-h1:text-purple-400 prose-h1:mb-4
                    prose-h2:text-xl prose-h2:text-blue-400 prose-h2:mb-3 prose-h2:mt-6
                    prose-h3:text-lg prose-h3:text-green-400 prose-h3:mb-2 prose-h3:mt-4
                    prose-p:text-white/80 prose-p:leading-relaxed prose-p:mb-4
                    prose-strong:text-yellow-300 prose-strong:font-bold
                    prose-em:text-purple-300 prose-em:italic
                    prose-ul:list-none prose-ul:space-y-3 prose-ul:my-4
                    prose-ol:list-decimal prose-ol:space-y-2 prose-ol:my-4 prose-ol:pl-4
                    prose-li:relative prose-li:pl-8
                    prose-blockquote:border-l-4 prose-blockquote:border-purple-500/50
                    prose-blockquote:bg-white/5 prose-blockquote:rounded-r-lg prose-blockquote:p-4 prose-blockquote:my-4
                    prose-code:bg-white/10 prose-code:text-purple-300 prose-code:rounded prose-code:px-2 prose-code:py-1
                    prose-pre:bg-black/30 prose-pre:rounded-lg prose-pre:p-4">
        
        <ReactMarkdown
          components={{
            // 自定义标题样式
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                {children}
              </h1>
            ),
            
            h2: ({ children }) => (
              <h2 className="text-xl font-bold text-blue-400 mb-3 mt-6 flex items-center gap-2">
                {String(children).includes('优势') || String(children).includes('机会') ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : String(children).includes('风险') || String(children).includes('警告') ? (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                ) : (
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                )}
                {children}
              </h2>
            ),
            
            // 自定义列表样式
            ul: ({ children }) => (
              <ul className="space-y-3 my-4">
                {React.Children.map(children, (child) => (
                  <li className="flex items-start gap-3 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90 leading-relaxed">{child}</span>
                  </li>
                ))}
              </ul>
            ),
            
            // 自定义有序列表
            ol: ({ children }) => (
              <ol className="space-y-2 my-4 list-decimal list-inside">
                {React.Children.map(children, (child, idx) => (
                  <li className="flex items-start gap-3 bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                    <span className="text-purple-400 font-bold min-w-[1.5rem]">{idx + 1}.</span>
                    <span className="text-white/90">{child}</span>
                  </li>
                ))}
              </ol>
            ),
            
            // 自定义段落
            p: ({ children }) => (
              <p className="text-white/80 leading-relaxed mb-4">{children}</p>
            ),
            
            // 自定义强调
            strong: ({ children }) => (
              <span className="font-bold text-yellow-300 bg-yellow-300/10 px-2 py-0.5 rounded">
                {children}
              </span>
            ),
            
            // 自定义斜体
            em: ({ children }) => (
              <span className="italic text-purple-300">{children}</span>
            ),
            
            // 自定义引用块
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-purple-500/50 bg-white/5 rounded-r-lg p-4 my-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-white/90">{children}</div>
                </div>
              </blockquote>
            ),
            
            // 自定义链接
            a: ({ href, children }) => (
              <a 
                href={href as string} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline transition-colors"
              >
                {children}
              </a>
            ),
            
            // 自定义水平线
            hr: () => (
              <hr className="border-white/10 my-6" />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
