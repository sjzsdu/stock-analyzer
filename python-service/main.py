"""
股票数据采集和分析服务
使用AkShare、yFinance和CrewAI实现数据采集和AI分析
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
import asyncio
from datetime import datetime
import os
from dotenv import load_dotenv
from pathlib import Path
from data.collector import (
    collect_a_share_data,
    collect_hk_stock_data,
    collect_us_stock_data,
)
from agents.crew_agents import run_crew_analysis

# 优先加载项目根目录的 .env.local，然后加载当前目录的 .env
# 这样用户只需要在一个地方配置
project_root = Path(__file__).parent.parent
env_local_path = project_root / ".env.local"
env_path = Path(__file__).parent / ".env"

if env_local_path.exists():
    load_dotenv(env_local_path, override=True)
    print(f"✓ 加载环境变量: {env_local_path}")
elif env_path.exists():
    load_dotenv(env_path, override=True)
    print(f"✓ 加载环境变量: {env_path}")
else:
    print("⚠️ 警告: 未找到 .env.local 或 .env 配置文件")

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

    ⚠️ 重要说明：
    - 此接口只使用真实的 DeepSeek AI 分析
    - 如果没有配置有效的 DEEPSEEK_API_KEY，会返回错误
    - 不会自动回退到模拟数据模式
    """
    try:
        start_time = asyncio.get_event_loop().time()
        print(f"[{datetime.now()}] 开始CrewAI分析: {request.symbol}")

        # 使用CrewAI进行真正的AI分析
        # 如果 LLM 配置错误，这里会直接抛出错误，不会回退
        analysis_data = run_crew_analysis(request.symbol, request.stock_data)

        processing_time = asyncio.get_event_loop().time() - start_time
        print(f"[{datetime.now()}] AI分析完成，耗时: {processing_time:.2f}秒")

        return AnalysisResponse(
            success=True,
            data=analysis_data,
            message="分析完成",
            processing_time=processing_time,
        )
    except ValueError as ve:
        # 配置错误（API key 问题）
        print(f"AI分析配置错误: {ve}")
        raise HTTPException(status_code=500, detail=f"AI分析配置错误: {str(ve)}")
    except Exception as e:
        print(f"AI分析错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI分析失败: {str(e)}")


# ==================== 数据采集函数 ====================


async def collect_a_share(symbol: str) -> dict:
    """采集A股数据（使用AkShare）

    ⚠️ 如果数据采集失败，会抛出错误而不是使用模拟数据
    """
    try:
        result = await collect_a_share_data(symbol)
        if result.get("success"):
            return result
        else:
            error_msg = result.get("error", "未知错误")
            print(f"A股数据采集失败: {error_msg}")
            raise ValueError(f"A股数据采集失败: {error_msg}")
    except Exception as e:
        print(f"A股数据采集异常: {e}")
        raise ValueError(f"A股数据采集失败: {str(e)}")


async def collect_hk_stock(symbol: str) -> dict:
    """采集港股数据（使用yFinance）

    ⚠️ 如果数据采集失败，会抛出错误而不是使用模拟数据
    """
    try:
        result = await collect_hk_stock_data(symbol)
        if result.get("success"):
            return result
        else:
            error_msg = result.get("error", "未知错误")
            print(f"港股数据采集失败: {error_msg}")
            raise ValueError(f"港股数据采集失败: {error_msg}")
    except Exception as e:
        print(f"港股数据采集异常: {e}")
        raise ValueError(f"港股数据采集失败: {str(e)}")


async def collect_us_stock(symbol: str) -> dict:
    """采集美股数据（使用yFinance）

    ⚠️ 如果数据采集失败，会抛出错误而不是使用模拟数据
    """
    try:
        result = await collect_us_stock_data(symbol)
        if result.get("success"):
            return result
        else:
            error_msg = result.get("error", "未知错误")
            print(f"美股数据采集失败: {error_msg}")
            raise ValueError(f"美股数据采集失败: {error_msg}")
    except Exception as e:
        print(f"美股数据采集异常: {e}")
        raise ValueError(f"美股数据采集失败: {str(e)}")


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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
