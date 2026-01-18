"""
数据采集模块测试
"""

import pytest
import pandas as pd
from datetime import datetime
from unittest.mock import Mock, patch, AsyncMock


class TestParseChineseNumber:
    """中文数字解析测试"""

    def test_parse_chinese_number_trillions(self):
        """测试万亿单位解析"""
        from data.enhanced_collector import parse_chinese_number

        assert parse_chinese_number("1.5万亿") == 1.5e12
        assert parse_chinese_number("2.3万亿") == 2.3e12
        assert parse_chinese_number("0.5万亿") == 5e11

    def test_parse_chinese_number_billions(self):
        """测试亿单位解析"""
        from data.enhanced_collector import parse_chinese_number

        assert parse_chinese_number("100亿") == 1e10
        assert parse_chinese_number("50.5亿") == 5.05e9
        assert parse_chinese_number("1亿") == 1e8

    def test_parse_chinese_number_millions(self):
        """测试万单位解析"""
        from data.enhanced_collector import parse_chinese_number

        assert parse_chinese_number("100万") == 1e6
        assert parse_chinese_number("50.5万") == 5.05e5
        assert parse_chinese_number("1万") == 1e4

    def test_parse_chinese_number_plain(self):
        """测试普通数字解析"""
        from data.enhanced_collector import parse_chinese_number

        assert parse_chinese_number("1234.56") == 1234.56
        assert parse_chinese_number("100") == 100.0
        assert parse_chinese_number("0") == 0.0

    def test_parse_chinese_number_with_comma(self):
        """测试带逗号的数字解析"""
        from data.enhanced_collector import parse_chinese_number

        assert parse_chinese_number("1,000,000") == 1000000.0
        assert parse_chinese_number("1,234.56") == 1234.56

    def test_parse_chinese_number_invalid(self):
        """测试无效输入"""
        from data.enhanced_collector import parse_chinese_number

        assert parse_chinese_number("") == 0
        assert parse_chinese_number(None) == 0
        assert parse_chinese_number("abc") == 0
        assert parse_chinese_number("invalidtext") == 0


class TestProcessAkShareKline:
    """AkShare K线数据处理测试"""

    def test_process_valid_data(self):
        """测试有效 K 线数据处理"""
        from data.enhanced_collector import process_akshare_kline
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
        assert result[0].timestamp > 0
        assert result[0].open == 12.0
        assert result[0].close == 12.3
        assert result[0].volume == 50000000

    def test_process_empty_data(self):
        """测试空数据处理"""
        from data.enhanced_collector import process_akshare_kline

        result = process_akshare_kline(pd.DataFrame())
        assert result == []

    def test_process_none(self):
        """测试 None 数据处理"""
        from data.enhanced_collector import process_akshare_kline

        result = process_akshare_kline(None)
        assert result == []


class TestProcessYFinanceKline:
    """yFinance K线数据处理测试"""

    def test_process_valid_data(self):
        """测试有效 K 线数据处理"""
        from data.enhanced_collector import process_yfinance_kline
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
        assert result[0].open == 182.0
        assert result[0].close == 184.5

    def test_process_empty_data(self):
        """测试空数据处理"""
        from data.enhanced_collector import process_yfinance_kline

        result = process_yfinance_kline(pd.DataFrame())
        assert result == []

    def test_process_none(self):
        """测试 None 数据处理"""
        from data.enhanced_collector import process_yfinance_kline

        result = process_yfinance_kline(None)
        assert result == []


class TestCollectStockData:
    """股票数据采集测试（使用真实网络连接）"""

    @pytest.mark.asyncio
    async def test_collect_hk_stock_success(self):
        """测试港股数据采集成功"""
        from data.enhanced_collector import collect_hk_stock_data

        result = await collect_hk_stock_data("0700.HK")

        assert result.success
        assert result.basic.symbol == "0700.HK"
        assert result.basic.market == "HK"

    @pytest.mark.asyncio
    async def test_collect_us_stock_success(self):
        """测试美股数据采集成功"""
        from data.enhanced_collector import collect_us_stock_data

        result = await collect_us_stock_data("AAPL")

        assert result.success
        assert result.basic.symbol == "AAPL"
        assert result.basic.market == "US"

    @pytest.mark.asyncio
    async def test_collect_hk_stock_failure(self):
        """测试港股数据采集失败（无效股票代码）"""
        from data.enhanced_collector import collect_hk_stock_data

        result = await collect_hk_stock_data("INVALID.HK.NOT.EXIST")

        assert result.success is False
        assert result.error is not None

    @pytest.mark.asyncio
    async def test_collect_us_stock_failure(self):
        """测试美股数据采集失败（无效股票代码）"""
        from data.enhanced_collector import collect_us_stock_data

        result = await collect_us_stock_data("INVALID_STOCK_SYMBOL_XYZ")

        assert result.success is False
        assert result.error is not None
