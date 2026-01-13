"""
股票数据采集和分析服务
使用AkShare、yFinance和CrewAI实现数据采集和AI分析
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import asyncio
from datetime import datetime
import os
from dotenv import load_dotenv
from data.collector import (
    collect_a_share_data,
    collect_hk_stock_data,
    collect_us_stock_data,
)
from agents.crew_agents import run_crew_analysis

load_dotenv()

app = FastAPI(
    title="Stock Data & Analysis API",
    description="股票数据采集和AI分析服务",
    version="1.0.0",
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 请求/响应模型
class StockRequest(BaseModel):
    symbol: str
    market: str  # 'A', 'HK', 'US'


class StockDataResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    message: Optional[str] = None
    timestamp: str


class AnalysisRequest(BaseModel):
    symbol: str
    stock_data: dict


class AnalysisResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    message: Optional[str] = None
    processing_time: float


@app.get("/")
async def root():
    """根路径"""
    return {
        "service": "Stock Data & Analysis API",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/api/collect", response_model=StockDataResponse)
async def collect_stock_data(request: StockRequest):
    """
    采集股票数据的主入口

    根据市场类型调用不同的数据源：
    - A股：AkShare
    - 港股：yFinance
    - 美股：yFinance
    """
    try:
        print(
            f"[{datetime.now()}] 开始采集数据: {request.symbol}, 市场: {request.market}"
        )

        if request.market == "A":
            data = await collect_a_share(request.symbol)
        elif request.market == "HK":
            data = await collect_hk_stock(request.symbol)
        elif request.market == "US":
            data = await collect_us_stock(request.symbol)
        else:
            raise HTTPException(
                status_code=400, detail=f"不支持的市场类型: {request.market}"
            )

        print(f"[{datetime.now()}] 数据采集完成")

        return StockDataResponse(
            success=True,
            data=data,
            message="数据采集成功",
            timestamp=datetime.now().isoformat(),
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"数据采集错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"数据采集失败: {str(e)}")


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_stock(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """
    使用CrewAI进行多Agent分析
    """
    try:
        start_time = asyncio.get_event_loop().time()
        print(f"[{datetime.now()}] 开始CrewAI分析: {request.symbol}")

        # 暂时使用模拟分析，CrewAI集成待完善
        analysis_data = await generate_mock_analysis(request.symbol)

        processing_time = asyncio.get_event_loop().time() - start_time

        print(f"[{datetime.now()}] AI分析完成，耗时: {processing_time:.2f}秒")

        return AnalysisResponse(
            success=True,
            data=analysis_data,
            message="分析完成",
            processing_time=processing_time,
        )
    except Exception as e:
        print(f"AI分析错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI分析失败: {str(e)}")


# ==================== 数据采集函数 ====================


async def collect_a_share(symbol: str) -> dict:
    """采集A股数据（使用AkShare）"""
    try:
        result = await collect_a_share_data(symbol)
        if result.get("success"):
            return result
        else:
            print(f"A股数据采集失败: {result.get('error')}")
            return generate_mock_stock_data(symbol, "A")
    except Exception as e:
        print(f"A股数据采集异常: {e}")
        return generate_mock_stock_data(symbol, "A")


async def collect_hk_stock(symbol: str) -> dict:
    """采集港股数据（使用yFinance）"""
    try:
        result = await collect_hk_stock_data(symbol)
        if result.get("success"):
            return result
        else:
            print(f"港股数据采集失败: {result.get('error')}")
            return generate_mock_stock_data(symbol, "HK")
    except Exception as e:
        print(f"港股数据采集异常: {e}")
        return generate_mock_stock_data(symbol, "HK")


async def collect_us_stock(symbol: str) -> dict:
    """采集美股数据（使用yFinance）"""
    try:
        result = await collect_us_stock_data(symbol)
        if result.get("success"):
            return result
        else:
            print(f"美股数据采集失败: {result.get('error')}")
            return generate_mock_stock_data(symbol, "US")
    except Exception as e:
        print(f"美股数据采集异常: {e}")
        return generate_mock_stock_data(symbol, "US")


def process_basic_info(data, market: str) -> dict:
    """处理基本信息"""
    if market == "A":
        return {
            "symbol": data.get("代码", ""),
            "name": data.get("名称", ""),
            "market": "A",
            "currentPrice": float(data.get("最新价", 0) or 0),
            "marketCap": parse_chinese_number(data.get("总市值", "")),
            "peRatio": float(data.get("市盈率-动态", 0) or 0),
            "pbRatio": float(data.get("市净率", 0) or 0),
            "dividendYield": float(data.get("股息率", 0) or 0),
            "volume": float(data.get("成交量", 0) or 0),
            "turnoverRate": float(data.get("换手率", 0) or 0),
        }
    else:
        # 港股/美股使用yFinance返回的data
        return {
            "symbol": data.get("symbol", ""),
            "name": data.get("longName", data.get("shortName", "")),
            "market": market,
            "currentPrice": float(data.get("currentPrice", 0) or 0),
            "marketCap": float(data.get("marketCap", 0) or 0),
            "peRatio": float(data.get("forwardPE", 0) or 0),
            "pbRatio": float(data.get("priceToBook", 0) or 0),
            "dividendYield": float(data.get("dividendYield", 0) or 0),
            "volume": float(data.get("volume", 0) or 0),
            "currency": data.get("currency", "USD"),
        }


def process_kline_data(df) -> list:
    """转换K线数据格式"""
    kline = []
    if df is None or len(df) == 0:
        return kline

    for idx, row in df.iterrows():
        kline.append(
            [
                int(row["日期"].timestamp() * 1000),
                float(row["开盘"]),
                float(row["最高"]),
                float(row["最低"]),
                float(row["收盘"]),
                int(row["成交量"]),
            ]
        )
    return kline


def process_yfinance_kline(df) -> list:
    """处理yFinance的K线数据"""
    kline = []
    if df is None or len(df) == 0:
        return kline

    df = df.reset_index()
    for idx, row in df.iterrows():
        kline.append(
            [
                int(row["Date"].timestamp() * 1000),
                float(row["Open"]),
                float(row["High"]),
                float(row["Low"]),
                float(row["Close"]),
                int(row["Volume"]),
            ]
        )
    return kline


def process_financial_data(df) -> dict:
    """处理财务数据"""
    if df is None or len(df) == 0:
        return {}

    if isinstance(df, dict):
        return df

    try:
        latest = df.iloc[0] if len(df) > 0 else {}
        return {
            "revenue": float(latest.get("营业收入", 0) or 0),
            "netProfit": float(latest.get("净利润", 0) or 0),
            "roe": float(latest.get("净资产收益率", 0) or 0),
            "roic": float(latest.get("投资回报率", 0) or 0),
            "debtRatio": float(latest.get("资产负债率", 0) or 0),
            "currentRatio": float(latest.get("流动比率", 0) or 0),
        }
    except:
        return {}


def parse_chinese_number(text: str) -> float:
    """解析中文数字（如：1.23万亿）"""
    if not text or not isinstance(text, str):
        return 0

    text = text.replace(",", "")
    if "万亿" in text:
        return float(text.replace("万亿", "")) * 1e12
    elif "亿" in text:
        return float(text.replace("亿", "")) * 1e8
    elif "万" in text:
        return float(text.replace("万", "")) * 1e4
    else:
        try:
            return float(text)
        except:
            return 0


def generate_mock_stock_data(symbol: str, market: str) -> dict:
    """生成模拟股票数据（用于MVP测试）"""
    import pandas as pd
    import numpy as np

    np.random.seed(hash(symbol) % 10000)

    base_price = 10 + np.random.random() * 90
    dates = pd.date_range(end=datetime.now(), periods=500, freq="D")

    kline = []
    price = base_price
    for date in dates:
        change = np.random.normal(0, 0.02)
        price = price * (1 + change)
        high = price * (1 + abs(np.random.normal(0, 0.01)))
        low = price * (1 - abs(np.random.normal(0, 0.01)))
        volume = int(np.random.random() * 1000000)

        kline.append(
            [
                int(date.timestamp() * 1000),
                float(price),
                float(high),
                float(low),
                float(price * (1 + np.random.normal(0, 0.005))),
                volume,
            ]
        )

    return {
        "basic": {
            "symbol": symbol,
            "name": f"{symbol}模拟股票",
            "market": market,
            "currentPrice": float(kline[-1][4] if kline else base_price),
            "marketCap": base_price * 1000000000 * (1 + np.random.random()),
            "peRatio": 10 + np.random.random() * 40,
            "pbRatio": 1 + np.random.random() * 5,
            "dividendYield": np.random.random() * 5,
            "volume": kline[-1][5] if kline else 100000,
        },
        "kline": kline[-100:],  # 最近100天
        "financial": {
            "revenue": 1000000000 * (1 + np.random.random()),
            "netProfit": 100000000 * (1 + np.random.random()),
            "roe": 10 + np.random.random() * 20,
            "debtRatio": 30 + np.random.random() * 40,
        },
    }


async def generate_mock_analysis(symbol: str) -> dict:
    """生成模拟分析结果（MVP阶段）"""
    import numpy as np

    np.random.seed(hash(symbol) % 10000 + 1)

    scores = {
        "value": 70 + np.random.random() * 20,
        "technical": 60 + np.random.random() * 25,
        "growth": 65 + np.random.random() * 25,
        "fundamental": 70 + np.random.random() * 20,
        "risk": 60 + np.random.random() * 30,
        "macro": 55 + np.random.random() * 30,
    }

    overall_score = (
        scores["value"] * 0.25
        + scores["technical"] * 0.15
        + scores["growth"] * 0.20
        + scores["fundamental"] * 0.15
        + scores["risk"] * 0.15
        + scores["macro"] * 0.10
    )

    if overall_score >= 85:
        recommendation = "strong_buy"
    elif overall_score >= 75:
        recommendation = "buy"
    elif overall_score >= 60:
        recommendation = "hold"
    elif overall_score >= 50:
        recommendation = "wait"
    else:
        recommendation = "sell"

    return {
        "overallScore": float(f"{overall_score:.1f}"),
        "recommendation": recommendation,
        "confidence": float(f"{75 + np.random.random() * 15:.1f}"),
        "summary": f"基于多维度分析，{symbol}当前综合评分为{overall_score:.1f}分。价值面显示良好估值水平，技术面呈现{'向上' if scores['technical'] > 70 else '震荡'}趋势，成长性具备潜力。建议{'买入' if recommendation in ['buy', 'strong_buy'] else '观望' if recommendation == 'wait' else '持有' if recommendation == 'hold' else '卖出'}。",
        "roleAnalysis": [
            {
                "role": "value",
                "score": int(scores["value"]),
                "analysis": f"从价值投资角度分析，该股票当前PE处于{'合理' if 10 < scores['value'] < 25 else '偏低' if scores['value'] <= 10 else '偏高'}区间，具备一定的安全边际。",
                "keyPoints": ["PE比率合理", "分红稳定", "ROE保持高位"],
            },
            {
                "role": "technical",
                "score": int(scores["technical"]),
                "analysis": f"技术面上，股价目前位于{'上升通道' if scores['technical'] > 70 else '震荡区间'}。MACD显示{'金叉' if scores['technical'] > 70 else '死叉'}信号。",
                "keyPoints": ["MACD出现信号", "RSI显示多头", "均线提供支撑"],
            },
            {
                "role": "growth",
                "score": int(scores["growth"]),
                "analysis": f"成长性方面，公司营收保持{'快速增长' if scores['growth'] > 75 else '稳定增长'}。行业处于发展期。",
                "keyPoints": ["营收持续增长", "市场份额提升", "行业前景良好"],
            },
            {
                "role": "fundamental",
                "score": int(scores["fundamental"]),
                "analysis": "公司基本面扎实，商业模式清晰，具备显著的护城河。",
                "keyPoints": ["品牌优势显著", "技术领先", "管理层优秀"],
            },
            {
                "role": "risk",
                "score": int(scores["risk"]),
                "analysis": "风险方面，需关注行业政策变化和市场竞争，财务结构相对稳健。",
                "keyPoints": ["行业政策风险", "市场竞争加剧", "财务状况健康"],
            },
            {
                "role": "macro",
                "score": int(scores["macro"]),
                "analysis": "宏观环境整体向好，货币政策宽松，经济处于复苏阶段。",
                "keyPoints": ["货币政策有利", "经济周期积极", "汇率影响可控"],
            },
        ],
        "risks": [
            "行业政策变化可能带来监管风险",
            "市场竞争加剧可能影响盈利能力",
            "宏观经济波动可能影响估值",
        ],
        "opportunities": [
            "行业增长空间巨大",
            "公司具备技术领先优势",
            "市场份额提升空间大",
        ],
        "model": "Mock Analysis (MVP)",
        "processingTime": 30.0,
        "tokenUsage": {"input": 5000, "output": 3000},
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
