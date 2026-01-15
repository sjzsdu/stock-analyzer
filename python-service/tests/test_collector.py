"""
数据采集模块测试
"""

import pytest
import pandas as pd
from datetime import datetime
from unittest.mock import Mock, patch, AsyncMock


class TestCollector:
    """数据采集模块测试类"""

    def test_parse_chinese_number_trillions(self):
        """测试万亿单位解析"""
        from data.collector import parse_chinese_number

        assert parse_chinese_number("1.5万亿") == 1.5e12
        assert parse_chinese_number("2.3万亿") == 2.3e12
        assert parse_chinese_number("0.5万亿") == 5e11

    def test_parse_chinese_number_billions(self):
        """测试亿单位解析"""
        from data.collector import parse_chinese_number

        assert parse_chinese_number("100亿") == 1e10
        assert parse_chinese_number("50.5亿") == 5.05e9
        assert parse_chinese_number("1亿") == 1e8

    def test_parse_chinese_number_millions(self):
        """测试万单位解析"""
        from data.collector import parse_chinese_number

        assert parse_chinese_number("100万") == 1e6
        assert parse_chinese_number("50.5万") == 5.05e5
        assert parse_chinese_number("1万") == 1e4

    def test_parse_chinese_number_plain(self):
        """测试普通数字解析"""
        from data.collector import parse_chinese_number

        assert parse_chinese_number("1234.56") == 1234.56
        assert parse_chinese_number("100") == 100.0
        assert parse_chinese_number("0") == 0.0

    def test_parse_chinese_number_with_comma(self):
        """测试带逗号的数字解析"""
        from data.collector import parse_chinese_number

        assert parse_chinese_number("1,000,000") == 1000000.0
        assert parse_chinese_number("1,234.56") == 1234.56

    def test_parse_chinese_number_invalid(self):
        """测试无效输入"""
        from data.collector import parse_chinese_number

        assert parse_chinese_number("") == 0
        assert parse_chinese_number(None) == 0
        assert parse_chinese_number(123) == 0  # 非字符串
        assert parse_chinese_number("abc") == 0
        assert parse_chinese_number("invalidtext") == 0


class TestFormatMarketCap:
    """市值格式化测试"""

    def test_format_trillions(self):
        """测试万亿格式化"""
        from data.collector import format_market_cap

        assert format_market_cap(1e12) == "1.00万亿"
        assert format_market_cap(2.5e12) == "2.50万亿"

    def test_format_billions(self):
        """测试亿格式化"""
        from data.collector import format_market_cap

        assert format_market_cap(1e8) == "1.00亿"
        assert format_market_cap(100e8) == "100.00亿"

    def test_format_millions(self):
        """测试万格式化"""
        from data.collector import format_market_cap

        assert format_market_cap(1e4) == "1.00万"
        assert format_market_cap(100e4) == "100.00万"

    def test_format_small(self):
        """测试小数值格式化"""
        from data.collector import format_market_cap

        assert format_market_cap(1000) == "1000"
        assert format_market_cap(0) == "0"


class TestProcessAShareBasic:
    """A股基本信息处理测试"""

    def test_process_valid_data(self):
        """测试有效数据处理"""
        from data.collector import process_a_share_basic

        df = pd.DataFrame(
            [
                {
                    "代码": "000001",
                    "名称": "平安银行",
                    "最新价": 12.5,
                    "总市值": "1000亿",
                    "市盈率-动态": 6.5,
                    "市净率": 0.8,
                    "股息率": 3.2,
                    "成交量": 50000000,
                    "换手率": 1.5,
                }
            ]
        )

        result = process_a_share_basic(df)

        assert result["symbol"] == "000001"
        assert result["name"] == "平安银行"
        assert result["market"] == "A"
        assert result["currentPrice"] == 12.5
        assert result["peRatio"] == 6.5
        assert result["pbRatio"] == 0.8
        assert result["currency"] == "CNY"

    def test_process_empty_data(self):
        """测试空数据处理"""
        from data.collector import process_a_share_basic

        result = process_a_share_basic(pd.DataFrame())
        assert result == {}

    def test_process_none(self):
        """测试 None 数据处理"""
        from data.collector import process_a_share_basic

        result = process_a_share_basic(None)
        assert result == {}


class TestProcessYFinanceBasic:
    """yFinance 基本信息处理测试"""

    def test_process_valid_data(self):
        """测试有效数据处理"""
        from data.collector import process_yfinance_basic

        info = {
            "symbol": "AAPL",
            "longName": "Apple Inc.",
            "currentPrice": 185.50,
            "marketCap": 2900000000000,
            "forwardPE": 28.5,
            "priceToBook": 35.2,
            "dividendYield": 0.005,
            "volume": 60000000,
            "currency": "USD",
        }

        result = process_yfinance_basic(info, "US")

        assert result["symbol"] == "AAPL"
        assert result["name"] == "Apple Inc."
        assert result["market"] == "US"
        assert result["currentPrice"] == 185.50
        assert result["currency"] == "USD"

    def test_process_with_dict_pe(self):
        """测试带字典格式的 PE"""
        from data.collector import process_yfinance_basic

        info = {
            "symbol": "TEST",
            "longName": "Test Corp",
            "forwardPE": {"raw": 15.5},
            "priceToBook": {"raw": 2.5},
        }

        result = process_yfinance_basic(info, "US")

        assert result["peRatio"] == 15.5
        assert result["pbRatio"] == 2.5

    def test_process_empty_data(self):
        """测试空数据处理"""
        from data.collector import process_yfinance_basic

        result = process_yfinance_basic({}, "US")
        assert result == {}

    def test_process_none(self):
        """测试 None 数据处理"""
        from data.collector import process_yfinance_basic

        result = process_yfinance_basic(None, "US")
        assert result == {}


class TestProcessAkShareKline:
    """AkShare K线数据处理测试"""

    def test_process_valid_data(self):
        """测试有效 K 线数据处理"""
        from data.collector import process_akshare_kline
        from datetime import datetime

        df = pd.DataFrame(
            [
                {
                    "日期": datetime(2024, 1, 2),
                    "开盘": 12.0,
                    "最高": 12.5,
                    "最低": 11.8,
                    "收盘": 12.3,
                    "成交量": 50000000,
                },
                {
                    "日期": datetime(2024, 1, 3),
                    "开盘": 12.3,
                    "最高": 12.8,
                    "最低": 12.1,
                    "收盘": 12.5,
                    "成交量": 55000000,
                },
            ]
        )

        result = process_akshare_kline(df)

        assert len(result) == 2
        assert len(result[0]) == 6  # [timestamp, open, high, low, close, volume]
        assert result[0][1] == 12.0  # 开盘价
        assert result[0][4] == 12.3  # 收盘价

    def test_process_empty_data(self):
        """测试空数据处理"""
        from data.collector import process_akshare_kline

        result = process_akshare_kline(pd.DataFrame())
        assert result == []

    def test_process_none(self):
        """测试 None 数据处理"""
        from data.collector import process_akshare_kline

        result = process_akshare_kline(None)
        assert result == []


class TestProcessYFinanceKline:
    """yFinance K线数据处理测试"""

    def test_process_valid_data(self):
        """测试有效 K 线数据处理"""
        from data.collector import process_yfinance_kline
        from datetime import datetime

        df = pd.DataFrame(
            {
                "Date": [datetime(2024, 1, 2), datetime(2024, 1, 3)],
                "Open": [182.0, 184.5],
                "High": [185.0, 187.0],
                "Low": [181.5, 184.0],
                "Close": [184.5, 186.5],
                "Volume": [60000000, 55000000],
            }
        )

        result = process_yfinance_kline(df)

        assert len(result) == 2
        assert len(result[0]) == 7  # 包含估算的成交额
        assert result[0][1] == 182.0  # 开盘价

    def test_process_empty_data(self):
        """测试空数据处理"""
        from data.collector import process_yfinance_kline

        result = process_yfinance_kline(pd.DataFrame())
        assert result == []

    def test_process_none(self):
        """测试 None 数据处理"""
        from data.collector import process_yfinance_kline

        result = process_yfinance_kline(None)
        assert result == []


class TestProcessFinancialData:
    """财务数据处理测试"""

    def test_process_valid_data(self):
        """测试有效财务数据处理"""
        from data.collector import process_akshare_financial

        df = pd.DataFrame(
            [
                {
                    "营业收入": 150000000000,
                    "净利润": 25000000000,
                    "净资产收益率": 12.5,
                    "投资回报率": 10.2,
                    "资产负债率": 92.5,
                    "流动比率": 1.2,
                }
            ]
        )

        result = process_akshare_financial(df)

        assert result["revenue"] == 150000000000
        assert result["netProfit"] == 25000000000
        assert result["roe"] == 12.5
        assert result["roic"] == 10.2

    def test_process_empty_data(self):
        """测试空数据处理"""
        from data.collector import process_akshare_financial

        result = process_akshare_financial(pd.DataFrame())
        assert result == {}

    def test_process_dict_data(self):
        """测试字典数据直接返回"""
        from data.collector import process_akshare_financial

        input_dict = {"revenue": 100, "netProfit": 20}
        result = process_akshare_financial(input_dict)

        assert result == input_dict

    def test_process_history_data(self):
        """测试带历史数据的处理"""
        from data.collector import process_akshare_financial

        df = pd.DataFrame(
            {
                "营业收入": [150, 140, 130],
                "净利润": [25, 22, 20],
                "净资产收益率": [12.5, 12.0, 11.5],
                "投资回报率": [10.2, 9.8, 9.5],
                "资产负债率": [92.5, 91.0, 90.0],
                "流动比率": [1.2, 1.3, 1.4],
            }
        )

        result = process_akshare_financial(df)

        assert "history" in result
        assert len(result["history"]["revenue"]) == 3


class TestCollectStockData:
    """股票数据采集测试（使用真实网络连接）"""

    @pytest.mark.asyncio
    async def test_collect_hk_stock_success(self):
        """测试港股数据采集成功"""
        from data.collector import collect_hk_stock_data

        result = await collect_hk_stock_data("0700.HK")

        # 验证返回结构
        assert "success" in result
        if result["success"]:
            assert result["basic"]["symbol"] == "0700.HK"
            assert result["basic"]["market"] == "HK"

    @pytest.mark.asyncio
    async def test_collect_us_stock_success(self):
        """测试美股数据采集成功"""
        from data.collector import collect_us_stock_data

        result = await collect_us_stock_data("AAPL")

        assert "success" in result
        if result["success"]:
            assert result["basic"]["symbol"] == "AAPL"
            assert result["basic"]["market"] == "US"

    @pytest.mark.asyncio
    async def test_collect_hk_stock_failure(self):
        """测试港股数据采集失败（无效股票代码）"""
        from data.collector import collect_hk_stock_data

        result = await collect_hk_stock_data("INVALID.HK.NOT.EXIST")

        assert result["success"] is False
        assert "error" in result

    @pytest.mark.asyncio
    async def test_collect_us_stock_failure(self):
        """测试美股数据采集失败（无效股票代码）"""
        from data.collector import collect_us_stock_data

        result = await collect_us_stock_data("INVALID_STOCK_SYMBOL_XYZ")

        assert result["success"] is False
        assert "error" in result
