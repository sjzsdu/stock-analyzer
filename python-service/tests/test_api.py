"""
API 端点测试
"""

import pytest
from unittest.mock import patch, AsyncMock


class TestRootEndpoint:
    """根路径端点测试"""

    def test_root_returns_service_info(self):
        """测试根路径返回服务信息"""
        from main import app
        from fastapi.testclient import TestClient

        client = TestClient(app)
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "Stock Data & Analysis API"
        assert data["status"] == "running"
        assert "version" in data
        assert "timestamp" in data


class TestHealthEndpoint:
    """健康检查端点测试"""

    def test_health_returns_healthy(self):
        """测试健康检查返回 healthy"""
        from main import app
        from fastapi.testclient import TestClient

        client = TestClient(app)
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data


class TestCollectEndpoint:
    """数据采集端点测试"""

    def test_collect_invalid_market(self):
        """测试不支持的市场类型"""
        from main import app
        from fastapi.testclient import TestClient

        client = TestClient(app)
        response = client.post(
            "/api/collect", json={"symbol": "000001", "market": "INVALID"}
        )

        assert response.status_code == 400
        data = response.json()
        assert "Unsupported market type" in data["detail"]

    def test_collect_missing_symbol(self):
        """测试缺少 symbol 参数"""
        from main import app
        from fastapi.testclient import TestClient

        client = TestClient(app)
        response = client.post("/api/collect", json={"market": "A"})

        assert response.status_code == 422  # Validation error

    def test_collect_missing_market(self):
        """测试缺少 market 参数"""
        from main import app
        from fastapi.testclient import TestClient

        client = TestClient(app)
        response = client.post("/api/collect", json={"symbol": "000001"})

        assert response.status_code == 422  # Validation error

    def test_collect_a_share_success(self):
        """测试 A 股数据采集成功"""
        from main import app
        from fastapi.testclient import TestClient

        # 检查是否有 AkShare 可用
        try:
            import akshare
        except ImportError:
            pytest.skip("akshare not installed")

        client = TestClient(app)
        response = client.post("/api/collect", json={"symbol": "000001", "market": "A"})

        # 期望成功（A股数据通常公开可获取）
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "basic" in data["data"]
        assert data["data"]["basic"]["symbol"] == "000001"

    def test_collect_hk_stock_success(self):
        """测试港股数据采集成功"""
        from main import app
        from fastapi.testclient import TestClient

        # yFinance 通常不需要 API key
        try:
            import yfinance
        except ImportError:
            pytest.skip("yfinance not installed")

        client = TestClient(app)
        response = client.post(
            "/api/collect", json={"symbol": "0700.HK", "market": "HK"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "basic" in data["data"]

    def test_collect_us_stock_success(self):
        """测试美股数据采集成功"""
        from main import app
        from fastapi.testclient import TestClient

        # yFinance 通常不需要 API key
        try:
            import yfinance
        except ImportError:
            pytest.skip("yfinance not installed")

        client = TestClient(app)
        response = client.post("/api/collect", json={"symbol": "AAPL", "market": "US"})

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "basic" in data["data"]


class TestAnalyzeEndpoint:
    """分析端点测试"""

    def test_analyze_missing_symbol(self):
        """测试缺少 symbol 参数"""
        from main import app
        from fastapi.testclient import TestClient

        client = TestClient(app)
        response = client.post("/api/analyze", json={"stock_data": {}})

        assert response.status_code == 422  # Validation error

    def test_analyze_missing_stock_data(self):
        """测试缺少 stock_data 参数"""
        from main import app
        from fastapi.testclient import TestClient

        client = TestClient(app)
        response = client.post("/api/analyze", json={"symbol": "000001"})

        assert response.status_code == 422  # Validation error

    def test_analyze_success(self):
        """测试分析成功（需要 DEEPSEEK_API_KEY）"""
        from main import app
        from fastapi.testclient import TestClient
        from dotenv import load_dotenv
        from pathlib import Path
        import os

        # 加载环境变量
        project_root = Path(__file__).parent.parent.parent
        env_local_path = project_root / ".env.local"
        env_path = Path(__file__).parent.parent / ".env"

        if env_local_path.exists():
            load_dotenv(env_local_path, override=True)
        elif env_path.exists():
            load_dotenv(env_path, override=True)

        # 检查是否有 DeepSeek API key
        if not os.getenv("DEEPSEEK_API_KEY"):
            pytest.skip("DEEPSEEK_API_KEY not configured in .env.local")

        client = TestClient(app)
        response = client.post(
            "/api/analyze",
            json={
                "symbol": "000001",
                "stock_data": {
                    "basic": {
                        "symbol": "000001",
                        "name": "平安银行",
                        "currentPrice": 12.5,
                        "peRatio": 6.5,
                    },
                    "financial": {
                        "roe": 12.5,
                        "debtRatio": 92.5,
                    },
                    "kline": [
                        [1704067200000, 12.0, 12.5, 11.8, 12.3, 50000000],
                    ],
                },
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "overallScore" in data["data"]
        assert "recommendation" in data["data"]

    def test_analyze_with_full_data(self):
        """测试使用完整数据进行分析"""
        from main import app
        from fastapi.testclient import TestClient
        from dotenv import load_dotenv
        from pathlib import Path
        import os

        # 加载环境变量
        project_root = Path(__file__).parent.parent.parent
        env_local_path = project_root / ".env.local"
        env_path = Path(__file__).parent.parent / ".env"

        if env_local_path.exists():
            load_dotenv(env_local_path, override=True)
        elif env_path.exists():
            load_dotenv(env_path, override=True)

        # 检查是否有 DeepSeek API key
        if not os.getenv("DEEPSEEK_API_KEY"):
            pytest.skip("DEEPSEEK_API_KEY not configured in .env.local")

        client = TestClient(app)
        response = client.post(
            "/api/analyze",
            json={
                "symbol": "AAPL",
                "stock_data": {
                    "basic": {
                        "symbol": "AAPL",
                        "name": "Apple Inc.",
                        "currentPrice": 185.50,
                        "peRatio": 28.5,
                    },
                    "financial": {
                        "revenue": 383000000000,
                        "netProfit": 97000000000,
                        "roe": 24.5,
                    },
                    "kline": [
                        [1704067200000, 182.0, 185.0, 181.5, 184.5, 60000000],
                    ],
                },
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "overallScore" in data["data"]


class TestMarketConfig:
    """市场配置测试"""

    def test_market_collectors_config(self):
        """测试市场采集器配置"""
        from main import MARKET_COLLECTORS

        assert "A" in MARKET_COLLECTORS
        assert "HK" in MARKET_COLLECTORS
        assert "US" in MARKET_COLLECTORS
        assert callable(MARKET_COLLECTORS["A"])
        assert callable(MARKET_COLLECTORS["HK"])
        assert callable(MARKET_COLLECTORS["US"])

    def test_market_names_config(self):
        """测试市场名称配置"""
        from main import MARKET_NAMES

        assert MARKET_NAMES["A"] == "A股"
        assert MARKET_NAMES["HK"] == "港股"
        assert MARKET_NAMES["US"] == "美股"


class TestRequestModels:
    """请求模型测试"""

    def test_stock_request_validation(self):
        """测试股票请求模型验证"""
        from main import StockRequest

        # 有效请求
        request = StockRequest(symbol="000001", market="A")
        assert request.symbol == "000001"
        assert request.market == "A"

    def test_analysis_request_validation(self):
        """测试分析请求模型验证"""
        from main import AnalysisRequest

        request = AnalysisRequest(
            symbol="000001", stock_data={"basic": {}, "financial": {}}
        )
        assert request.symbol == "000001"
        assert "basic" in request.stock_data

    def test_response_models(self):
        """测试响应模型"""
        from main import StockDataResponse, AnalysisResponse
        from datetime import datetime

        # StockDataResponse
        stock_response = StockDataResponse(
            success=True,
            data={"symbol": "000001"},
            message="Success",
            timestamp=datetime.now().isoformat(),
        )
        assert stock_response.success is True
        assert stock_response.data["symbol"] == "000001"

        # AnalysisResponse
        analysis_response = AnalysisResponse(
            success=True, data={"score": 75}, message="Complete", processing_time=5.5
        )
        assert analysis_response.success is True
        assert analysis_response.data["score"] == 75
        assert analysis_response.processing_time == 5.5
