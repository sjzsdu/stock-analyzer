"""
pytest 配置和 fixtures
"""

import os
import sys
import pytest

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 设置测试环境变量
os.environ["API_DEBUG"] = "true"
os.environ["API_PORT"] = "8001"
os.environ["CORS_ALLOW_ORIGINS"] = "*"


@pytest.fixture
def sample_stock_data():
    """示例股票数据"""
    return {
        "basic": {
            "symbol": "000001",
            "name": "平安银行",
            "market": "A",
            "currentPrice": 12.50,
            "marketCap": 100000000000,
            "peRatio": 6.5,
            "pbRatio": 0.8,
            "dividendYield": 3.2,
            "volume": 50000000,
        },
        "financial": {
            "revenue": 150000000000,
            "netProfit": 25000000000,
            "roe": 12.5,
            "roic": 10.2,
            "debtRatio": 92.5,
            "currentRatio": 1.2,
        },
        "kline": [
            [1704067200000, 12.0, 12.5, 11.8, 12.3, 50000000],
            [1704153600000, 12.3, 12.8, 12.1, 12.5, 55000000],
            [1704240000000, 12.5, 12.9, 12.2, 12.7, 48000000],
        ],
    }


@pytest.fixture
def sample_us_stock_data():
    """示例美股数据"""
    return {
        "basic": {
            "symbol": "AAPL",
            "name": "Apple Inc.",
            "market": "US",
            "currentPrice": 185.50,
            "marketCap": 2900000000000,
            "peRatio": 28.5,
            "pbRatio": 35.2,
            "dividendYield": 0.5,
            "volume": 60000000,
        },
        "financial": {},
        "kline": [
            [1704067200000, 182.0, 185.0, 181.5, 184.5, 60000000],
            [1704153600000, 184.5, 187.0, 184.0, 186.5, 55000000],
        ],
    }


@pytest.fixture
def mock_env_config(monkeypatch):
    """Mock 环境变量配置"""
    monkeypatch.setenv("DEEPSEEK_API_KEY", "sk-test-api-key-for-testing")
    monkeypatch.setenv("DEEPSEEK_MODEL", "deepseek/deepseek-chat")
    monkeypatch.setenv("DEEPSEEK_API_BASE", "https://api.deepseek.com/v1")
