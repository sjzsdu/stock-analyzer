"""
集成测试 - 需要真实网络连接

运行方式:
    cd python-service
    python -m pytest tests/test_integration.py -v

需要配置的环境变量 (在 .env.local 中):
    DEEPSEEK_API_KEY=sk-your-deepseek-api-key
"""

import pytest
import os
from dotenv import load_dotenv
from pathlib import Path


# 加载环境变量
project_root = Path(__file__).parent.parent.parent
env_local_path = project_root / ".env.local"
env_path = Path(__file__).parent.parent / ".env"

if env_local_path.exists():
    load_dotenv(env_local_path, override=True)
    print(f"Loaded env from: {env_local_path}")
elif env_path.exists():
    load_dotenv(env_path, override=True)
    print(f"Loaded env from: {env_path}")
else:
    print("Warning: No .env.local or .env found")


def check_deepseek_key():
    """检查 DeepSeek API key 是否配置"""
    key = os.getenv("DEEPSEEK_API_KEY")
    if not key or key == "sk-your_deepseek_api_key_here":
        return False
    return True


class TestDataCollectionIntegration:
    """数据采集集成测试"""

    def test_collect_a_share_real(self):
        """测试真实 A 股数据采集"""
        from main import app
        from fastapi.testclient import TestClient

        client = TestClient(app, raise_server_exceptions=False)
        response = client.post("/api/collect", json={"symbol": "000001", "market": "A"})

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "basic" in data["data"]
        print(f"A股数据: {data['data']['basic'].get('name', 'N/A')}")

    def test_collect_hk_stock_real(self):
        """测试真实港股数据采集"""
        from main import app
        from fastapi.testclient import TestClient

        client = TestClient(app, raise_server_exceptions=False)
        response = client.post(
            "/api/collect", json={"symbol": "0700.HK", "market": "HK"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "basic" in data["data"]
        print(f"港股数据: {data['data']['basic'].get('name', 'N/A')}")

    def test_collect_us_stock_real(self):
        """测试真实美股数据采集"""
        from main import app
        from fastapi.testclient import TestClient

        client = TestClient(app, raise_server_exceptions=False)
        response = client.post("/api/collect", json={"symbol": "AAPL", "market": "US"})

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "basic" in data["data"]
        print(f"美股数据: {data['data']['basic'].get('name', 'N/A')}")

    def test_collect_multiple_stocks(self):
        """测试多只股票数据采集"""
        from main import app
        from fastapi.testclient import TestClient

        client = TestClient(app, raise_server_exceptions=False)

        stocks = [
            ("600519", "A"),  # 贵州茅台
            ("GOOGL", "US"),  # Google
            ("0700.HK", "HK"),  # 腾讯
        ]

        for symbol, market in stocks:
            response = client.post(
                "/api/collect", json={"symbol": symbol, "market": market}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            print(f"{market}/{symbol}: {data['data']['basic'].get('name', 'N/A')}")


class TestAIAnalysisIntegration:
    """AI 分析集成测试（需要 DEEPSEEK_API_KEY）"""

    @pytest.mark.skipif(
        not check_deepseek_key(), reason="DEEPSEEK_API_KEY not configured"
    )
    def test_analyze_stock_real(self):
        """测试真实 AI 股票分析"""
        from main import app
        from fastapi.testclient import TestClient

        stock_data = {
            "basic": {
                "symbol": "000001",
                "name": "平安银行",
                "currentPrice": 12.50,
                "peRatio": 6.5,
                "pbRatio": 0.8,
                "marketCap": 100000000000,
            },
            "financial": {
                "roe": 12.5,
                "netProfit": 25000000000,
                "revenue": 150000000000,
                "debtRatio": 92.5,
            },
            "kline": [
                [1704067200000, 12.0, 12.5, 11.8, 12.3, 50000000],
                [1704153600000, 12.3, 12.8, 12.1, 12.5, 55000000],
                [1704240000000, 12.5, 12.9, 12.2, 12.7, 48000000],
            ],
        }

        client = TestClient(app, raise_server_exceptions=False)
        response = client.post(
            "/api/analyze", json={"symbol": "000001", "stock_data": stock_data}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "overallScore" in data["data"]
        assert "recommendation" in data["data"]
        print(f"分析评分: {data['data']['overallScore']}")
        print(f"推荐: {data['data']['recommendation']}")

    @pytest.mark.skipif(
        not check_deepseek_key(), reason="DEEPSEEK_API_KEY not configured"
    )
    def test_analyze_us_stock_real(self):
        """测试真实 AI 美股分析"""
        from main import app
        from fastapi.testclient import TestClient

        stock_data = {
            "basic": {
                "symbol": "AAPL",
                "name": "Apple Inc.",
                "currentPrice": 185.50,
                "peRatio": 28.5,
                "marketCap": 2900000000000,
            },
            "financial": {
                "roe": 24.5,
                "netProfit": 97000000000,
            },
            "kline": [
                [1704067200000, 182.0, 185.0, 181.5, 184.5, 60000000],
            ],
        }

        client = TestClient(app, raise_server_exceptions=False)
        response = client.post(
            "/api/analyze", json={"symbol": "AAPL", "stock_data": stock_data}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        print(f"AAPL 分析完成")


class TestHealthEndpoints:
    """健康检查测试"""

    def test_root_endpoint(self):
        """测试根路径"""
        from main import app
        from fastapi.testclient import TestClient

        client = TestClient(app)
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        print(f"服务版本: {data.get('version')}")

    def test_health_endpoint(self):
        """测试健康检查"""
        from main import app
        from fastapi.testclient import TestClient

        client = TestClient(app)
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"健康状态: {data['status']}")


if __name__ == "__main__":
    # 直接运行时的说明
    print("=" * 60)
    print("集成测试需要真实网络连接")
    print("请确保在 .env.local 中配置了 DEEPSEEK_API_KEY")
    print("=" * 60)
    print("运行测试: python -m pytest tests/test_integration.py -v")
