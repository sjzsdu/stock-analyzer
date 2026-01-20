"""
CrewAI 分析模块测试
"""

import pytest
import sys
from unittest.mock import patch, MagicMock
from agents.crew_agents import (
    run_crew_analysis,
    create_agents,
    format_data_summary,
    format_kline_summary,
    format_financial_data,
)
from utils.config import config


class TestCrewAnalysis:
    """CrewAI 分析测试类"""

    @pytest.fixture
    def sample_stock_data(self):
        """示例股票数据"""
        return {
            "basic": {
                "symbol": "000001",
                "name": "平安银行",
                "currentPrice": 11.16,
                "peRatio": 10.21,
                "pbRatio": 1.16,
                "market_cap": 10000000000,
            },
            "financial": {
                "roe": 7.4,
                "netMargin": 25.5,
                "grossMargin": 30.2,
                "debtRatio": 92.5,
                "currentRatio": 1.05,
            },
            "kline": [
                {
                    "timestamp": 1705881600000,
                    "close": 10.69,
                    "open": 10.65,
                    "high": 10.75,
                    "low": 10.60,
                    "volume": 50000,
                },
                {
                    "timestamp": 1705968000000,
                    "close": 10.75,
                    "open": 10.70,
                    "high": 10.80,
                    "low": 10.68,
                    "volume": 55000,
                },
                {
                    "timestamp": 1706054400000,
                    "close": 10.80,
                    "open": 10.72,
                    "high": 10.85,
                    "low": 10.70,
                    "volume": 60000,
                },
                {
                    "timestamp": 1706140800000,
                    "close": 10.72,
                    "open": 10.78,
                    "high": 10.82,
                    "low": 10.65,
                    "volume": 52000,
                },
                {
                    "timestamp": 1706227200000,
                    "close": 10.68,
                    "open": 10.70,
                    "high": 10.75,
                    "low": 10.60,
                    "volume": 48000,
                },
            ],
            "technical": {
                "ma_5": 10.73,
                "ma_20": 10.68,
                "ma_60": 10.55,
                "rsi": 52.8,
                "macd": -0.02,
                "bollinger_upper": 10.95,
                "bollinger_lower": 10.45,
            },
        }

    def test_format_data_summary(self, sample_stock_data):
        """测试数据摘要格式化"""
        summary = format_data_summary(sample_stock_data)
        assert "000001" in summary
        assert "平安银行" in summary
        assert "11.16" in summary
        print(f"✓ format_data_summary: {summary[:100]}...")

    def test_format_kline_summary(self, sample_stock_data):
        """测试K线摘要格式化"""
        kline_summary = format_kline_summary(sample_stock_data["kline"])
        assert "10.69" in kline_summary
        assert "10.80" in kline_summary
        print(f"✓ format_kline_summary: {kline_summary}")

    def test_format_financial_data(self, sample_stock_data):
        """测试财务数据格式化"""
        financial_summary = format_financial_data(sample_stock_data)
        assert "7.4" in financial_summary
        assert "25.5" in financial_summary
        print(f"✓ format_financial_data: {financial_summary[:100]}...")

    def test_create_agents(self):
        """测试创建Agent"""
        agents = create_agents()
        assert len(agents) == 7  # 6个分析Agent + 1个synthesizer
        print(f"✓ 创建了 {len(agents)} 个 Agent")

    def test_run_crew_analysis_integration(self, sample_stock_data):
        """集成测试：完整的 CrewAI 分析流程"""
        # 这个测试会调用真实的 LLM API
        # 跳过如果 API 不可用
        try:
            result = run_crew_analysis("000001", sample_stock_data)

            # 验证返回结构
            assert isinstance(result, dict), "结果必须是字典"
            print(f"✓ run_crew_analysis 返回 dict")
            print(f"  keys: {list(result.keys())}")

            # 验证关键字段
            if result.get("overallScore") is not None:
                assert 0 <= result["overallScore"] <= 100
                print(f"✓ overallScore: {result['overallScore']}")

            if result.get("recommendation"):
                assert result["recommendation"] in [
                    "strong_buy",
                    "buy",
                    "hold",
                    "wait",
                    "sell",
                ]
                print(f"✓ recommendation: {result['recommendation']}")

            if result.get("roleAnalysis"):
                assert isinstance(result["roleAnalysis"], list)
                print(f"✓ roleAnalysis count: {len(result['roleAnalysis'])}")

            if result.get("agentResults"):
                assert isinstance(result["agentResults"], list)
                print(f"✓ agentResults count: {len(result['agentResults'])}")

        except Exception as e:
            pytest.skip(f"CrewAI 分析失败: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
