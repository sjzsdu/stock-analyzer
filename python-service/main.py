"""
股票数据采集和分析服务
使用AkShare、yFinance和CrewAI实现数据采集和AI分析
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import asyncio
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path

from data.collector import (
    collect_a_share_data,
    collect_hk_stock_data,
    collect_us_stock_data,
)
from agents.crew_agents import run_crew_analysis
from utils.config import config

# 加载环境变量
project_root = Path(__file__).parent.parent
env_local_path = project_root / ".env.local"
env_path = Path(__file__).parent / ".env"

if env_local_path.exists():
    load_dotenv(env_local_path, override=True)
    print(f"Loaded env: {env_local_path}")
elif env_path.exists():
    load_dotenv(env_path, override=True)
    print(f"Loaded env: {env_path}")
else:
    print("Warning: No .env.local or .env found")

# 获取配置
cfg = config()

app = FastAPI(
    title=cfg.API_TITLE,
    description="股票数据采集和AI分析服务",
    version=cfg.API_VERSION,
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=cfg.CORS_ALLOW_ORIGINS,
    allow_credentials=cfg.CORS_ALLOW_CREDENTIALS,
    allow_methods=cfg.CORS_ALLOW_METHODS,
    allow_headers=cfg.CORS_ALLOW_HEADERS,
)


# ==================== 请求/响应模型 ====================


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


# ==================== 市场配置 ====================

MARKET_COLLECTORS = {
    "A": collect_a_share_data,
    "HK": collect_hk_stock_data,
    "US": collect_us_stock_data,
}

MARKET_NAMES = {
    "A": "A股",
    "HK": "港股",
    "US": "美股",
}


# ==================== 统一的数据采集函数 ====================


async def collect_stock_data_by_market(symbol: str, market: str) -> dict:
    """
    统一的数据采集函数

    Args:
        symbol: 股票代码
        market: 市场类型 ('A', 'HK', 'US')

    Returns:
        采集结果字典
    """
    collector = MARKET_COLLECTORS.get(market.lower())

    if not collector:
        raise ValueError(f"Unsupported market type: {market}")

    result = await collector(symbol)

    if result.get("success"):
        return result
    else:
        error_msg = result.get("error", "Unknown error")
        raise ValueError(
            f"{MARKET_NAMES.get(market, market)} data collection failed: {error_msg}"
        )


# ==================== API 端点 ====================


@app.get("/")
async def root():
    """根路径"""
    return {
        "service": "Stock Data & Analysis API",
        "status": "running",
        "version": cfg.API_VERSION,
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
            f"[{datetime.now()}] Collecting data: {request.symbol}, Market: {request.market}"
        )

        # 使用统一的采集函数
        data = await collect_stock_data_by_market(request.symbol, request.market)

        print(f"[{datetime.now()}] Data collection complete")

        return StockDataResponse(
            success=True,
            data=data,
            message="Data collection successful",
            timestamp=datetime.now().isoformat(),
        )
    except ValueError as ve:
        print(f"Data collection error: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Data collection error: {e}")
        raise HTTPException(status_code=500, detail=f"Data collection failed: {str(e)}")


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_stock(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """
    使用CrewAI进行多Agent分析

    IMPORTANT:
    - This endpoint uses real DeepSeek AI analysis
    - Returns error if DEEPSEEK_API_KEY is not configured
    """
    try:
        start_time = asyncio.get_event_loop().time()
        print(f"[{datetime.now()}] Starting CrewAI analysis: {request.symbol}")

        # 使用CrewAI进行真正的AI分析
        analysis_data = run_crew_analysis(request.symbol, request.stock_data)

        processing_time = asyncio.get_event_loop().time() - start_time
        print(f"[{datetime.now()}] AI analysis complete, time: {processing_time:.2f}s")

        return AnalysisResponse(
            success=True,
            data=analysis_data,
            message="Analysis complete",
            processing_time=processing_time,
        )
    except ValueError as ve:
        print(f"AI analysis config error: {ve}")
        raise HTTPException(
            status_code=500, detail=f"AI analysis config error: {str(ve)}"
        )
    except Exception as e:
        print(f"AI analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(
        app,
        host=cfg.API_HOST,
        port=cfg.API_PORT,
        reload=cfg.API_DEBUG,
    )
