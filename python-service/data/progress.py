"""
进度追踪模块
用于SSE实时推送分析进度
"""

import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, Callable
from dataclasses import dataclass, field, asdict
from enum import Enum


class ProgressStage(Enum):
    """分析阶段"""

    START = "start"
    CHECK_CACHE = "check_cache"
    COLLECT_BASIC = "collect_basic"
    COLLECT_KLINE = "collect_kline"
    COLLECT_FINANCIAL = "collect_financial"
    COLLECT_NEWS = "collect_news"
    CALCULATE_TECHNICAL = "calculate_technical"
    AI_VALUE_ANALYSIS = "ai_value_analysis"
    AI_TECHNICAL_ANALYSIS = "ai_technical_analysis"
    AI_GROWTH_ANALYSIS = "ai_growth_analysis"
    AI_FUNDAMENTAL_ANALYSIS = "ai_fundamental_analysis"
    AI_RISK_ANALYSIS = "ai_risk_analysis"
    AI_MACRO_ANALYSIS = "ai_macro_analysis"
    SYNTHESIZE = "synthesize"
    SAVE_RESULT = "save_result"
    COMPLETE = "complete"
    ERROR = "error"


@dataclass
class ProgressUpdate:
    """进度更新"""

    stage: str
    message: str
    progress: int  # 0-100
    details: Optional[Dict[str, Any]] = None
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


class ProgressTracker:
    """进度追踪器"""

    _instances: Dict[str, "ProgressTracker"] = {}
    _lock = asyncio.Lock()

    def __init__(self, job_id: str):
        self.job_id = job_id
        self.stage = ProgressStage.START.value
        self.progress = 0
        self.message = "开始分析"
        self.details = {}
        self.start_time = datetime.now()
        self.subscribers: list[Callable[[ProgressUpdate], None]] = []
        self.error: Optional[str] = None

    @classmethod
    async def get(cls, job_id: str) -> "ProgressTracker":
        """获取或创建进度追踪器"""
        async with cls._lock:
            if job_id not in cls._instances:
                cls._instances[job_id] = ProgressTracker(job_id)
            return cls._instances[job_id]

    @classmethod
    async def remove(cls, job_id: str):
        """移除进度追踪器"""
        async with cls._lock:
            if job_id in cls._instances:
                del cls._instances[job_id]

    def subscribe(self, callback: Callable[[ProgressUpdate], None]):
        """订阅进度更新"""
        self.subscribers.append(callback)

    def unsubscribe(self, callback: Callable[[ProgressUpdate], None]):
        """取消订阅"""
        if callback in self.subscribers:
            self.subscribers.remove(callback)

    async def update(
        self,
        stage: ProgressStage,
        message: str,
        progress: int,
        details: Optional[Dict[str, Any]] = None,
    ):
        """更新进度"""
        self.stage = stage.value
        self.progress = progress
        self.message = message
        if details:
            self.details.update(details)

        update = ProgressUpdate(
            stage=self.stage,
            message=self.message,
            progress=self.progress,
            details=self.details,
        )

        # 通知所有订阅者
        for callback in self.subscribers:
            try:
                callback(update)
            except Exception:
                pass

    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        elapsed = (datetime.now() - self.start_time).total_seconds()
        return {
            "job_id": self.job_id,
            "stage": self.stage,
            "progress": self.progress,
            "message": self.message,
            "details": self.details,
            "elapsed_seconds": elapsed,
            "timestamp": datetime.now().isoformat(),
        }


async def create_progress_tracker() -> str:
    """创建新的进度追踪器，返回job_id"""
    job_id = str(uuid.uuid4())
    await ProgressTracker.get(job_id)
    return job_id


async def get_progress(job_id: str) -> Optional[Dict[str, Any]]:
    """获取进度"""
    tracker = await ProgressTracker.get(job_id)
    if tracker:
        return tracker.to_dict()
    return None


async def update_progress(
    job_id: str,
    stage: ProgressStage,
    message: str,
    progress: int,
    details: Optional[Dict[str, Any]] = None,
):
    """更新进度"""
    tracker = await ProgressTracker.get(job_id)
    if tracker:
        await tracker.update(stage, message, progress, details)


# 便利函数 - 各个阶段的进度更新
async def stage_start(job_id: str, symbol: str, market: str):
    await update_progress(
        job_id, ProgressStage.START, f"开始分析 {symbol} ({market})", 0
    )


async def stage_check_cache(job_id: str, cached: bool = False):
    msg = "使用缓存数据" if cached else "检查缓存中..."
    await update_progress(job_id, ProgressStage.CHECK_CACHE, msg, 5)


async def stage_collect_basic(job_id: str):
    await update_progress(
        job_id, ProgressStage.COLLECT_BASIC, "采集股票基本信息...", 10
    )


async def stage_collect_kline(job_id: str):
    await update_progress(job_id, ProgressStage.COLLECT_KLINE, "采集历史K线数据...", 20)


async def stage_calculate_technical(job_id: str):
    await update_progress(
        job_id, ProgressStage.CALCULATE_TECHNICAL, "计算技术指标...", 30
    )


async def stage_collect_financial(job_id: str):
    await update_progress(
        job_id, ProgressStage.COLLECT_FINANCIAL, "采集财务数据...", 35
    )


async def stage_collect_news(job_id: str):
    await update_progress(job_id, ProgressStage.COLLECT_NEWS, "采集新闻资讯...", 40)


async def stage_ai_value(job_id: str):
    await update_progress(
        job_id, ProgressStage.AI_VALUE_ANALYSIS, "价值投资者分析中...", 50
    )


async def stage_ai_technical(job_id: str):
    await update_progress(
        job_id, ProgressStage.AI_TECHNICAL_ANALYSIS, "技术分析师分析中...", 60
    )


async def stage_ai_growth(job_id: str):
    await update_progress(
        job_id, ProgressStage.AI_GROWTH_ANALYSIS, "成长股分析师分析中...", 70
    )


async def stage_ai_fundamental(job_id: str):
    await update_progress(
        job_id, ProgressStage.AI_FUNDAMENTAL_ANALYSIS, "基本面分析师分析中...", 80
    )


async def stage_ai_risk(job_id: str):
    await update_progress(
        job_id, ProgressStage.AI_RISK_ANALYSIS, "风险分析师评估中...", 85
    )


async def stage_ai_macro(job_id: str):
    await update_progress(
        job_id, ProgressStage.AI_MACRO_ANALYSIS, "宏观分析师研判中...", 90
    )


async def stage_synthesize(job_id: str):
    await update_progress(job_id, ProgressStage.SYNTHESIZE, "综合各分析师意见...", 95)


async def stage_complete(job_id: str):
    await update_progress(job_id, ProgressStage.COMPLETE, "分析完成!", 100)


async def stage_error(job_id: str, error: str):
    await update_progress(job_id, ProgressStage.ERROR, f"错误: {error}", -1)
