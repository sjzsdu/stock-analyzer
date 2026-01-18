"""
股票数据采集和分析服务
使用AkShare、yFinance和CrewAI实现数据采集和AI分析
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import uvicorn
import asyncio
import json
import uuid
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pathlib import Path
import time
from collections import defaultdict
from typing import Dict, Tuple

from data.enhanced_collector import (
    collect_a_share_data,
    collect_hk_stock_data,
    collect_us_stock_data,
    StockAnalysisResult,
    stock_result_to_dict,
)
from data.progress import (
    ProgressTracker,
    ProgressStage,
    create_progress_tracker,
    get_progress,
    update_progress,
    stage_start,
    stage_check_cache,
    stage_collect_basic,
    stage_collect_kline,
    stage_calculate_technical,
    stage_collect_financial,
    stage_collect_news,
    stage_ai_value,
    stage_ai_technical,
    stage_ai_growth,
    stage_ai_fundamental,
    stage_ai_risk,
    stage_ai_macro,
    stage_synthesize,
    stage_complete,
    stage_error,
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


# ==================== 速率限制器 ====================


class RateLimiter:
    """简单的内存速率限制器"""

    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, list] = defaultdict(list)

    def _cleanup_old_requests(self, client_id: str):
        """清理过期的请求记录"""
        now = time.time()
        cutoff = now - self.window_seconds
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id] if req_time > cutoff
        ]

    def is_allowed(self, client_id: str) -> Tuple[bool, int]:
        """
        检查是否允许请求

        Returns:
            (is_allowed, remaining_requests)
        """
        self._cleanup_old_requests(client_id)
        current_count = len(self.requests[client_id])

        if current_count >= self.max_requests:
            return False, 0

        self.requests[client_id].append(time.time())
        remaining = self.max_requests - current_count - 1
        return True, max(0, remaining)

    def get_retry_after(self, client_id: str) -> int:
        """获取需要等待的秒数"""
        self._cleanup_old_requests(client_id)
        if len(self.requests[client_id]) < self.max_requests:
            return 0

        oldest = min(self.requests[client_id])
        retry_after = int(self.window_seconds - (time.time() - oldest)) + 1
        return max(1, retry_after)


rate_limiter = RateLimiter(max_requests=10, window_seconds=60)


def check_rate_limit(client_id: str) -> Optional[int]:
    """检查速率限制，返回需要等待的秒数（如果被限制）"""
    is_allowed, remaining = rate_limiter.is_allowed(client_id)
    if not is_allowed:
        return rate_limiter.get_retry_after(client_id)
    return None


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
    market_key = market.upper()
    collector = MARKET_COLLECTORS.get(market_key)

    if not collector:
        raise ValueError(f"Unsupported market type: {market}")

    result: StockAnalysisResult = await collector(symbol)
    result_dict = stock_result_to_dict(result)

    if result.success:
        return result_dict
    else:
        error_msg = result.error or "Unknown error"
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
async def collect_stock_data(request: StockRequest, request_obj: Request):
    """
    采集股票数据的主入口

    根据市场类型调用不同的数据源：
    - A股：AkShare
    - 港股：yFinance
    - 美股：yFinance
    """
    client_id = request_obj.client.host if request_obj.client else "unknown"

    retry_after = check_rate_limit(client_id)
    if retry_after:
        raise HTTPException(
            status_code=429, detail=f"请求过于频繁，请等待 {retry_after} 秒后重试"
        )

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
async def analyze_stock(
    request: AnalysisRequest, background_tasks: BackgroundTasks, request_obj: Request
):
    """
    使用CrewAI进行多Agent分析

    IMPORTANT:
    - This endpoint uses real DeepSeek AI analysis
    - Returns error if DEEPSEEK_API_KEY is not configured
    """
    client_id = request_obj.client.host if request_obj.client else "unknown"

    retry_after = check_rate_limit(client_id)
    if retry_after:
        raise HTTPException(
            status_code=429, detail=f"请求过于频繁，请等待 {retry_after} 秒后重试"
        )

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


class AnalysisJob:
    """分析任务状态"""

    jobs: dict = {}
    MAX_JOBS = 500
    JOB_TTL = 3600

    @classmethod
    def cleanup_expired(cls):
        """清理过期任务"""
        cutoff = datetime.now() - timedelta(seconds=cls.JOB_TTL)
        expired_keys = [
            k
            for k, v in cls.jobs.items()
            if datetime.fromisoformat(v["created_at"]) < cutoff
        ]
        for k in expired_keys:
            del cls.jobs[k]
        return len(expired_keys)

    @classmethod
    def enforce_limits(cls):
        """强制执行任务数量限制"""
        if len(cls.jobs) <= cls.MAX_JOBS:
            return
        sorted_jobs = sorted(
            cls.jobs.items(), key=lambda x: datetime.fromisoformat(x[1]["created_at"])
        )
        excess_count = len(cls.jobs) - cls.MAX_JOBS
        for k, _ in sorted_jobs[:excess_count]:
            del cls.jobs[k]

    @classmethod
    def create(cls, symbol: str, market: str) -> str:
        """创建新任务，自动清理过期任务并强制限制"""
        cls.cleanup_expired()
        cls.enforce_limits()
        job_id = str(uuid.uuid4())
        cls.jobs[job_id] = {
            "symbol": symbol,
            "market": market,
            "status": "pending",
            "progress": 0,
            "stage": "starting",
            "message": "开始分析...",
            "result": None,
            "error": None,
            "created_at": datetime.now().isoformat(),
        }
        return job_id

    @classmethod
    def update(cls, job_id: str, stage: str, progress: int, message: str):
        if job_id in cls.jobs:
            cls.jobs[job_id].update(
                {
                    "stage": stage,
                    "progress": progress,
                    "message": message,
                }
            )

    @classmethod
    def complete(cls, job_id: str, result: dict):
        if job_id in cls.jobs:
            cls.jobs[job_id].update(
                {
                    "status": "completed",
                    "progress": 100,
                    "stage": "complete",
                    "message": "分析完成!",
                    "result": result,
                }
            )

    @classmethod
    def fail(cls, job_id: str, error: str):
        if job_id in cls.jobs:
            cls.jobs[job_id].update(
                {
                    "status": "failed",
                    "stage": "error",
                    "message": f"错误: {error}",
                    "error": error,
                }
            )

    @classmethod
    def get(cls, job_id: str) -> Optional[dict]:
        return cls.jobs.get(job_id)


@app.get("/api/analyze/progress/{job_id}")
async def get_analysis_progress(job_id: str):
    """
    获取分析进度 (轮询接口)
    """
    job = AnalysisJob.get(job_id)
    if not job:
        return {"error": "Job not found", "job_id": job_id}
    return job


@app.get("/api/analyze/stream/{job_id}")
async def stream_analysis_progress(job_id: str, request: Request):
    """
    SSE流式推送分析进度
    """

    async def event_generator():
        job = AnalysisJob.get(job_id)
        if not job:
            yield f"data: {json.dumps({'error': 'Job not found', 'job_id': job_id})}\n\n"
            return

        max_retries = 300  # 5分钟最大等待时间
        retry_count = 0
        last_progress = -1

        while retry_count < max_retries:
            job = AnalysisJob.get(job_id)
            if not job:
                yield f"data: {json.dumps({'error': 'Job cancelled', 'job_id': job_id})}\n\n"
                break

            # 检查是否完成或失败
            if job["status"] == "completed":
                yield f"data: {json.dumps({'stage': 'complete', 'progress': 100, 'message': '分析完成!', 'result': job.get('result')})}\n\n"
                break
            elif job["status"] == "failed":
                yield f"data: {json.dumps({'stage': 'error', 'progress': -1, 'message': job.get('message', '分析失败'), 'error': job.get('error')})}\n\n"
                break

            # 只在进度更新时发送
            if job["progress"] != last_progress:
                last_progress = job["progress"]
                yield f"data: {json.dumps(job)}\n\n"

            # 检查客户端是否断开连接
            if await request.is_disconnected():
                break

            await asyncio.sleep(1)
            retry_count += 1

        # 清理任务
        if job_id in AnalysisJob.jobs:
            del AnalysisJob.jobs[job_id]

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/api/analyze/async")
async def analyze_stock_async(request: StockRequest, request_obj: Request):
    """
    异步分析接口 - 返回job_id用于SSE进度追踪
    """
    client_id = request_obj.client.host if request_obj.client else "unknown"

    retry_after = check_rate_limit(client_id)
    if retry_after:
        raise HTTPException(
            status_code=429, detail=f"请求过于频繁，请等待 {retry_after} 秒后重试"
        )

    symbol = request.symbol
    market = request.market

    job_id = AnalysisJob.create(symbol, market)

    async def run_analysis():
        try:
            # 阶段1: 检查缓存
            AnalysisJob.update(job_id, "check_cache", 5, "检查缓存中...")
            result = await collect_a_share_data(symbol)
            if result.success and result.timestamp:
                try:
                    result_time = datetime.fromisoformat(result.timestamp)
                    if (datetime.now() - result_time).total_seconds() < 24 * 3600:
                        AnalysisJob.update(job_id, "check_cache", 10, "使用缓存数据")
                        AnalysisJob.complete(job_id, stock_result_to_dict(result))
                        return
                except:
                    pass

            # 阶段2: 采集数据
            AnalysisJob.update(job_id, "collect_basic", 15, "采集股票基本信息...")
            stock_result = await collect_a_share_data(symbol)
            stock_data = stock_result_to_dict(stock_result)
            if not stock_data.get("success"):
                raise ValueError(stock_data.get("error", "数据采集失败"))

            AnalysisJob.update(job_id, "collect_kline", 25, "采集K线数据...")

            AnalysisJob.update(job_id, "calculate_technical", 35, "计算技术指标...")

            AnalysisJob.update(job_id, "collect_financial", 45, "采集财务数据...")

            AnalysisJob.update(job_id, "collect_news", 50, "采集新闻资讯...")

            # 阶段3: AI分析
            AnalysisJob.update(job_id, "ai_analysis", 55, "AI分析中...")
            analysis_result = run_crew_analysis(symbol, stock_data)

            AnalysisJob.update(job_id, "ai_value", 65, "价值分析完成")

            AnalysisJob.update(job_id, "ai_technical", 75, "技术分析完成")

            AnalysisJob.update(job_id, "ai_growth", 85, "成长分析完成")

            AnalysisJob.update(job_id, "ai_risk", 90, "风险评估完成")

            # 合并结果
            final_result = {
                **stock_data,
                **analysis_result,
                "timestamp": datetime.now().isoformat(),
            }

            AnalysisJob.update(job_id, "complete", 100, "分析完成!")
            AnalysisJob.complete(job_id, final_result)

        except Exception as e:
            error_msg = str(e)
            print(f"[{datetime.now()}] 分析失败: {error_msg}")
            import traceback

            traceback.print_exc()
            AnalysisJob.fail(job_id, error_msg)

    task = asyncio.create_task(run_analysis())
    task.add_done_callback(
        lambda t: print(
            f"[{datetime.now()}] 任务 {job_id} 完成, 状态: {'成功' if not t.exception() else '失败'}"
        )
        if not t.cancelled()
        else None
    )

    return {
        "success": True,
        "job_id": job_id,
        "message": "分析任务已启动，请使用 /api/analyze/stream/{job_id} 获取进度",
    }


if __name__ == "__main__":
    uvicorn.run(
        app,
        host=cfg.API_HOST,
        port=cfg.API_PORT,
        reload=cfg.API_DEBUG,
    )
