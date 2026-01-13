import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StockBasic from '@/models/StockBasic';
import StockAnalysis from '@/models/StockAnalysis';

export async function POST(request: NextRequest) {
  try {
    const { symbol } = await request.json();
    
    if (!symbol || symbol.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供股票代码' },
        { status: 400 }
      );
    }
    
    const symbolStr = symbol.trim();
    
    // 识别市场
    const market = identifyMarket(symbolStr);
    
    console.log(`[${new Date().toISOString()}] 分析请求: ${symbolStr}, 市场: ${market}`);
    
    // 连接数据库
    await connectDB();
    
    // 检查是否已有分析结果（1小时内）
    const existing = await StockAnalysis.findOne({
      symbol: symbolStr,
      market: market,
      createdAt: { $gte: new Date(Date.now() - 60*60*1000) }
    });
    
    if (existing) {
      console.log(`[${new Date().toISOString()}] 使用缓存的分析结果`);
      return NextResponse.json({ 
        success: true, 
        data: existing,
        cached: true 
      });
    }
    
    // 调用Python服务采集数据
    const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';
    
    console.log(`[${new Date().toISOString()}] 调用Python服务: ${PYTHON_API_URL}`);
    
    let stockData;
    try {
      const collectResponse = await fetch(`${PYTHON_API_URL}/api/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: symbolStr, market }),
        signal: AbortSignal.timeout(60000) // 60秒超时
      });
      
      const collectResult = await collectResponse.json();
      
      if (!collectResult.success) {
        throw new Error(collectResult.message || '数据采集失败');
      }
      
      stockData = collectResult.data;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Python服务调用失败:`, error);
      
      // 数据采集失败时，返回更详细的错误信息
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`数据采集失败: ${errorMessage}\n\n可能原因:\n1. Python服务未启动 (请检查 http://localhost:8000/docs)\n2. 网络连接问题\n3. 股票代码不存在\n\n请稍后重试，或联系管理员。`);
    }
    
    // 调用Python服务进行AI分析
    let analysisData;
    try {
      console.log(`[${new Date().toISOString()}] 开始AI分析...`);
      
      const analyzeResponse = await fetch(`${PYTHON_API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 注意：Python 服务使用 snake_case，所以字段名用 stock_data
        body: JSON.stringify({ symbol: symbolStr, stock_data: stockData }),
        signal: AbortSignal.timeout(300000) // 5分钟超时（AI分析可能需要较长时间）
      });
      
      if (!analyzeResponse.ok) {
        const errorText = await analyzeResponse.text();
        console.error(`API响应错误: ${analyzeResponse.status} - ${errorText}`);
        throw new Error(`AI分析服务返回错误 (${analyzeResponse.status}): ${errorText || '未知错误'}`);
      }
      
      const analyzeResult = await analyzeResponse.json();
      
      if (!analyzeResult.success) {
        throw new Error(analyzeResult.detail || analyzeResult.message || 'AI分析内部失败');
      }
      
      analysisData = analyzeResult.data;
      console.log(`[${new Date().toISOString()}] AI分析成功完成`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] AI分析调用失败:`, error);
      
      // AI分析失败时，返回更详细的错误信息
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`AI分析失败: ${errorMessage}\n\n可能原因:\n1. DeepSeek API 配置问题或额度不足\n2. 网络连接超时（AI分析可能需要2-5分钟）\n3. Python服务异常\n\n请稍后重试，或检查配置。`);
    }
    
    // 保存股票基本信息
    if (stockData.basic) {
      try {
        const stockBasic = new StockBasic({
          ...stockData.basic,
          market,
          lastUpdated: new Date()
        });
        await StockBasic.findOneAndUpdate(
          { symbol: symbolStr, market },
          { $set: stockData.basic },
          { upsert: true }
        );
      } catch (error) {
        console.error('保存基本信息失败:', error);
      }
    }
    
    // 保存分析结果
    const finalAnalysis = {
      ...analysisData,
      symbol: symbolStr,
      market,
      klineData: stockData.kline || [],
      stockBasic: stockData.basic || null,
      createdAt: new Date()
    };
    
    try {
      const stockAnalysis = new StockAnalysis(finalAnalysis);
      await stockAnalysis.save();
    } catch (error) {
      console.error('保存分析结果失败:', error);
    }
    
    console.log(`[${new Date().toISOString()}] 分析完成并保存`);
    
    return NextResponse.json({
      success: true,
      data: finalAnalysis,
      cached: false
    });
    
  } catch (error) {
    console.error('分析错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '分析失败，请稍后重试' 
      },
      { status: 500 }
    );
  }
}

function identifyMarket(symbol: string): 'A' | 'HK' | 'US' {
  // 港股：.HK或纯数字（4位）
  if (symbol.includes('.HK') || /^\d{4}$/.test(symbol)) {
    return 'HK';
  }
  
  // 美股：纯字母且不包含.或中文
  if (/^[A-Za-z]+$/.test(symbol) && !symbol.includes('.')) {
    return 'US';
  }
  
  // 默认A股
  return 'A';
}

function getRecommendationText(rec: string): string {
  const map: any = {
    strong_buy: '强烈买入',
    buy: '买入',
    hold: '持有',
    wait: '观望',
    sell: '卖出'
  };
  return map[rec] || rec;
}
