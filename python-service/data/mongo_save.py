"""
MongoDB save utilities for analysis results.
Provides async functions to save analysis results to MongoDB.
"""

import asyncio
from datetime import datetime
from typing import Optional, Dict, Any
import os


def get_mongodb_uri() -> str:
    """Get MongoDB URI from environment or default."""
    return os.getenv("MONGODB_URI", "mongodb://localhost:27017/stock_analyzer")


async def save_analysis_to_mongodb(
    symbol: str,
    market: str,
    stock_data: Dict[str, Any],
    analysis_result: Dict[str, Any],
    job_id: str,
) -> bool:
    """
    Save analysis results to MongoDB.

    Args:
        symbol: Stock symbol
        market: Market type ('A', 'HK', 'US')
        stock_data: Raw stock data from collector
        analysis_result: AI analysis results
        job_id: Analysis job ID

    Returns:
        True if save was successful, False otherwise
    """
    try:
        from pymongo import MongoClient
        from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

        mongo_uri = get_mongodb_uri()

        try:
            client = MongoClient(
                mongo_uri, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000
            )
            client.admin.command("ping")
        except (ConnectionFailure, ServerSelectionTimeoutError):
            print(f"[MongoDB] 连接失败，跳过保存")
            return False

        db = client.get_default_database()
        collection = db["stockanalyses"]

        document = {
            "symbol": symbol,
            "market": market,
            "stockName": stock_data.get("stock_name") or stock_data.get("name"),
            "overallScore": analysis_result.get("overall_score"),
            "recommendation": analysis_result.get("recommendation"),
            "confidenceScore": analysis_result.get("confidence"),
            "summary": analysis_result.get("summary"),
            "executiveSummary": analysis_result.get("executive_summary"),
            "keyFactors": analysis_result.get("key_factors", []),
            "roleAnalysis": [],
            "agentResults": [],
            "risks": analysis_result.get("risks", []),
            "opportunities": analysis_result.get("opportunities", []),
            "model": analysis_result.get("model", "DeepSeek"),
            "processingTime": analysis_result.get("processing_time"),
            "tokenUsage": analysis_result.get("token_usage", {}),
            "generatedAt": datetime.now(),
            "analysisMetadata": {
                "job_id": job_id,
                "data_timestamp": stock_data.get("timestamp"),
                "cached": stock_data.get("cached", False),
            },
        }

        agent_mapping = {
            "value": "价值分析",
            "technical": "技术分析",
            "growth": "成长分析",
            "fundamental": "基本面分析",
            "risk": "风险评估",
            "macro": "宏观分析",
        }

        for role, analysis in analysis_result.get("detailed_analysis", {}).items():
            if isinstance(analysis, dict):
                role_doc = {
                    "role": role,
                    "score": analysis.get("score"),
                    "analysis": analysis.get("analysis"),
                    "keyPoints": analysis.get("key_points", []),
                }
                document["roleAnalysis"].append(role_doc)

                agent_doc = {
                    "agent": role,
                    "summary": analysis.get("summary"),
                    "score": analysis.get("score"),
                    "confidence": analysis.get("confidence"),
                    "recommendation": analysis.get("recommendation"),
                    "key_factors": analysis.get("key_points", []),
                    "risks": analysis.get("risks", []),
                    "details": analysis.get("details"),
                    "raw_output": analysis.get("raw_output"),
                }
                document["agentResults"].append(agent_doc)

        result = collection.insert_one(document)
        print(f"[MongoDB] 分析结果已保存: {symbol}, ID: {result.inserted_id}")
        client.close()
        return True

    except ImportError:
        print("[MongoDB] pymongo 未安装，跳过保存")
        return False
    except Exception as e:
        print(f"[MongoDB] 保存失败: {e}")
        import traceback

        traceback.print_exc()
        return False


def save_analysis_to_mongodb_sync(
    symbol: str,
    market: str,
    stock_data: Dict[str, Any],
    analysis_result: Dict[str, Any],
    job_id: str,
) -> bool:
    """
    Synchronous wrapper for save_analysis_to_mongodb.
    """
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(
            save_analysis_to_mongodb(
                symbol, market, stock_data, analysis_result, job_id
            )
        )
    finally:
        loop.close()
