"""
增强版数据采集工具模块
包含更详细的股票数据采集
"""

import akshare as ak
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import asyncio


def get_a_share_company_info(symbol: str) -> Dict[str, Any]:
    """
    获取A股公司详细信息
    """
    try:
        info = ak.stock_individual_info_em(symbol=symbol)

        # 转换为字典
        info_dict = {}
        for _, row in info.iterrows():
            info_dict[row["指标"]] = row["值"]

        return {"success": True, "data": info_dict}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_a_share_financial_indicators(symbol: str) -> Dict[str, Any]:
    """
    获取A股财务指标
    """
    try:
        # 财务指标
        financial = ak.stock_financial_analysis_indicator(symbol=symbol)

        # 杜邦分析
        try:
            dupont = ak.stock_dupont_index(symbol=symbol)
        except:
            dupont = pd.DataFrame()

        return {"success": True, "financial": financial, "dupont": dupont}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_a_share_dividend(symbol: str) -> Dict[str, Any]:
    """
    获取A股分红送股信息
    """
    try:
        dividend = ak.stock_dividend(symbol=symbol)
        return {"success": True, "dividend": dividend}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_a_share_restricted(symbol: str) -> Dict[str, Any]:
    """
    获取A股限售解禁信息
    """
    try:
        restricted = ak.stock_restricted_shares(symbol=symbol)
        return {"success": True, "restricted": restricted}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_a_share_holders(symbol: str) -> Dict[str, Any]:
    """
    获取A股机构持仓
    """
    try:
        holders = ak.stock_holder_number(symbol=symbol)
        return {"success": True, "holders": holders}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_a_share_concept(symbol: str) -> Dict[str, Any]:
    """
    获取A股概念板块
    """
    try:
        # 获取股票所属概念
        concept = ak.stock_concept_fundamentals(symbol=symbol)
        return {"success": True, "concept": concept}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_a_share_industry(symbol: str) -> Dict[str, Any]:
    """
    获取A股行业分类
    """
    try:
        industry = ak.stock_board_industry_name_em()
        return {"success": True, "industry": industry}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_hk_stock_info(symbol: str) -> Dict[str, Any]:
    """
    获取港股详细信息
    """
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info

        return {
            "success": True,
            "data": {
                "companyName": info.get("longName", ""),
                "industry": info.get("industry", ""),
                "sector": info.get("sector", ""),
                "fullTimeEmployees": info.get("fullTimeEmployees", 0),
                "city": info.get("city", ""),
                "country": info.get("country", ""),
                "website": info.get("website", ""),
                "businessSummary": info.get("businessSummary", ""),
                "marketCap": info.get("marketCap", 0),
                "peRatio": info.get("trailingPE", 0),
                "pbRatio": info.get("priceToBook", 0),
                "dividendYield": info.get("dividendYield", 0),
                "eps": info.get("trailingEps", 0),
                "beta": info.get("beta", 0),
            },
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_us_stock_info(symbol: str) -> Dict[str, Any]:
    """
    获取美股详细信息
    """
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info

        return {
            "success": True,
            "data": {
                "companyName": info.get("longName", ""),
                "industry": info.get("industry", ""),
                "sector": info.get("sector", ""),
                "fullTimeEmployees": info.get("fullTimeEmployees", 0),
                "city": info.get("city", ""),
                "state": info.get("state", ""),
                "country": info.get("country", ""),
                "website": info.get("website", ""),
                "businessSummary": info.get("businessSummary", ""),
                "marketCap": info.get("marketCap", 0),
                "peRatio": info.get("trailingPE", 0),
                "forwardPE": info.get("forwardPE", 0),
                "pbRatio": info.get("priceToBook", 0),
                "dividendYield": info.get("dividendYield", 0),
                "eps": info.get("trailingEps", 0),
                "epsGrowth": info.get("earningsGrowth", 0),
                "revenueGrowth": info.get("revenueGrowth", 0),
                "beta": info.get("beta", 0),
            },
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


async def collect_comprehensive_stock_data(
    symbol: str, market: str = "A"
) -> Dict[str, Any]:
    """
    采集完整的股票数据

    Args:
        symbol: 股票代码
        market: 市场类型 ('A', 'HK', 'US')

    Returns:
        完整的股票数据字典
    """
    print(f"[Collector] 开始采集 {market} 股 {symbol} 的完整数据...")

    collected_data = {
        "symbol": symbol,
        "market": market,
        "collectedAt": datetime.now().isoformat(),
    }

    try:
        if market == "A":
            # 基本信息
            basic_result = get_a_share_company_info(symbol)
            if basic_result["success"]:
                collected_data["basic"] = basic_result["data"]

            # 财务指标
            financial_result = get_a_share_financial_indicators(symbol)
            if financial_result["success"]:
                collected_data["financial"] = financial_result
                if len(financial_result["financial"]) > 0:
                    latest = financial_result["financial"].iloc[0]
                    collected_data["financial_latest"] = latest.to_dict()

            # 分红送股
            dividend_result = get_a_share_dividend(symbol)
            if dividend_result["success"]:
                collected_data["dividend"] = dividend_result["dividend"]

            # 限售解禁
            restricted_result = get_a_share_restricted(symbol)
            if restricted_result["success"]:
                collected_data["restricted"] = restricted_result["restricted"]

            # 机构持仓
            holders_result = get_a_share_holders(symbol)
            if holders_result["success"]:
                collected_data["holders"] = holders_result["holders"]

            # 概念板块
            concept_result = get_a_share_concept(symbol)
            if concept_result["success"]:
                collected_data["concept"] = concept_result["concept"]

        elif market == "HK":
            result = get_hk_stock_info(symbol)
            if result["success"]:
                collected_data["company"] = result["data"]

        elif market == "US":
            result = get_us_stock_info(symbol)
            if result["success"]:
                collected_data["company"] = result["data"]

        collected_data["success"] = True
        print(f"[Collector] {symbol} 数据采集完成")

    except Exception as e:
        collected_data["success"] = False
        collected_data["error"] = str(e)
        print(f"[Collector] {symbol} 数据采集失败: {e}")

    return collected_data


# 测试函数
if __name__ == "__main__":
    # 测试A股
    test_symbol = "000001"  # 平安银行

    print("=" * 50)
    print(f"测试采集 {test_symbol} 的数据")
    print("=" * 50)

    result = asyncio.run(collect_comprehensive_stock_data(test_symbol, "A"))

    if result["success"]:
        print("\n✅ 数据采集成功！")
        print(f"收集的字段: {list(result.keys())}")
    else:
        print(f"\n❌ 数据采集失败: {result.get('error')}")
