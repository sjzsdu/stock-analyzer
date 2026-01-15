"""
数据采集工具模块
包含AkShare、yFinance等数据源的封装
"""

import akshare as ak
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional
import asyncio
import time
from functools import wraps


async def collect_a_share_data(symbol: str) -> dict:
    """
    采集A股数据

    Args:
        symbol: 股票代码（如：000001）

    Returns:
        包含基本信息、K线、财务数据的字典
    """
    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(
                f"[AkShare] 开始采集A股数据: {symbol} (尝试 {attempt + 1}/{max_retries})"
            )

            # 基本信息
            info = ak.stock_individual_info_em(symbol=symbol)
            print(f"[AkShare] 基本信息: {info.get('名称', 'N/A')}")

            # 历史K线（最近2年）
            end_date = datetime.now().strftime("%Y%m%d")
            start_date = (datetime.now() - timedelta(days=730)).strftime("%Y%m%d")

            hist_data = ak.stock_zh_a_hist(
                symbol=symbol,
                period="daily",
                start_date=start_date,
                end_date=end_date,
                adjust="qfq",
            )
            print(f"[AkShare] 获取到 {len(hist_data)} 条K线数据")

            # 财务数据
            try:
                financial = ak.stock_financial_analysis_indicator(symbol=symbol)
                print(f"[AkShare] 财务数据: {len(financial)} 条记录")
            except Exception as e:
                print(f"[AkShare] 财务数据获取失败: {e}")
                financial = pd.DataFrame()

            # 新闻数据
            try:
                news = ak.stock_news_em(symbol=symbol)
                print(f"[AkShare] 新闻数据: {len(news)} 条")
            except Exception as e:
                print(f"[AkShare] 新闻数据获取失败: {e}")
                news = pd.DataFrame()

            return {
                "success": True,
                "basic": process_a_share_basic(info),
                "kline": process_akshare_kline(hist_data),
                "financial": process_akshare_financial(financial),
                "news": process_akshare_news(news),
            }

        except Exception as e:
            print(f"[AkShare] 数据采集失败 (尝试 {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(1 * (2**attempt))  # 指数退避
            else:
                return {"success": False, "error": str(e)}


async def collect_hk_stock_data(symbol: str) -> dict:
    """
    采集港股数据

    Args:
        symbol: 股票代码（如：0700.HK）

    Returns:
        包含基本信息、K线数据的字典
    """
    try:
        print(f"[yFinance] 开始采集港股数据: {symbol}")

        ticker = yf.Ticker(symbol)
        info = ticker.info
        print(f"[yFinance] 公司名称: {info.get('longName', 'N/A')}")

        # 历史K线（2年）
        hist = ticker.history(period="2y", interval="1d")
        print(f"[yFinance] 获取到 {len(hist)} 条K线数据")

        return {
            "success": True,
            "basic": process_yfinance_basic(info, "HK"),
            "kline": process_yfinance_kline(hist),
            "financial": {},
        }

    except Exception as e:
        print(f"[yFinance] 数据采集失败: {e}")
        return {"success": False, "error": str(e)}


async def collect_us_stock_data(symbol: str) -> dict:
    """
    采集美股数据

    Args:
        symbol: 股票代码（如：AAPL）

    Returns:
        包含基本信息、K线数据的字典
    """
    try:
        print(f"[yFinance] 开始采集美股数据: {symbol}")

        ticker = yf.Ticker(symbol)
        info = ticker.info
        print(f"[yFinance] 公司名称: {info.get('longName', 'N/A')}")

        # 历史K线（2年）
        hist = ticker.history(period="2y", interval="1d")
        print(f"[yFinance] 获取到 {len(hist)} 条K线数据")

        return {
            "success": True,
            "basic": process_yfinance_basic(info, "US"),
            "kline": process_yfinance_kline(hist),
            "financial": {},
        }

    except Exception as e:
        print(f"[yFinance] 数据采集失败: {e}")
        return {"success": False, "error": str(e)}


def process_a_share_basic(info: pd.DataFrame) -> dict:
    """处理A股基本信息"""
    if isinstance(info, pd.DataFrame) and len(info) > 0:
        row = info.iloc[0]
        return {
            "symbol": row.get("代码", ""),
            "name": row.get("名称", ""),
            "market": "A",
            "currentPrice": float(row.get("最新价", 0) or 0),
            "marketCap": parse_chinese_number(row.get("总市值", "0")),
            "peRatio": float(row.get("市盈率-动态", 0) or 0),
            "pbRatio": float(row.get("市净率", 0) or 0),
            "dividendYield": float(row.get("股息率", 0) or 0),
            "volume": float(row.get("成交量", 0) or 0),
            "turnoverRate": float(row.get("换手率", 0) or 0),
            "currency": "CNY",
        }
    return {}


def process_yfinance_basic(info: dict, market: str) -> dict:
    """处理yFinance基本信息（港股/美股）"""
    if not info:
        return {}

    # 尝试多种方式获取公司名称
    name = info.get("longName") or info.get("shortName") or info.get("displayName", "")

    # 尝试多种方式获取PE
    pe = (
        info.get("forwardPE")
        or info.get("trailingPE")
        or info.get("defaultKeyStatistics", {}).get("forwardPE", {}).get("raw", 0)
    )
    if isinstance(pe, dict):
        pe = pe.get("raw", 0)

    # 尝试多种方式获取PB
    pb = info.get("priceToBook") or info.get("pbRatio", 0)
    if isinstance(pb, dict):
        pb = pb.get("raw", 0)

    # 尝试多种方式获取股息率
    dividend = info.get("dividendYield") or info.get("dividendYield", 0)
    if isinstance(dividend, dict):
        dividend = dividend.get("raw", dividend)

    # 尝试获取ROE
    roe = info.get("returnOnEquity") or info.get("returnOnEquity", 0)
    if isinstance(roe, dict):
        roe = roe.get("raw", roe)

    # 获取市值（转换为亿单位）
    market_cap = info.get("marketCap", 0) or 0
    if market_cap > 0:
        market_cap_formatted = format_market_cap(market_cap)
    else:
        market_cap_formatted = "--"

    # 获取当前价格
    current_price = float(info.get("currentPrice", info.get("regularPrice", 0)) or 0)

    return {
        "symbol": info.get("symbol", ""),
        "name": name,
        "market": market,
        "currentPrice": current_price,
        "marketCap": market_cap_formatted,
        "peRatio": float(pe) if pe else 0,
        "pbRatio": float(pb) if pb else 0,
        "dividendYield": float(dividend) if dividend else 0,
        "returnOnEquity": float(roe) if roe else 0,
        "volume": float(info.get("volume", 0) or 0),
        "currency": info.get("currency", "HKD" if market == "HK" else "USD"),
        "exchange": info.get("exchange", ""),
        "industry": info.get("industry", ""),
        "sector": info.get("sector", ""),
    }


def format_market_cap(market_cap: int) -> str:
    """格式化市值显示"""
    if market_cap >= 1e12:
        return f"{market_cap / 1e12:.2f}万亿"
    elif market_cap >= 1e8:
        return f"{market_cap / 1e8:.2f}亿"
    elif market_cap >= 1e4:
        return f"{market_cap / 1e4:.2f}万"
    else:
        return str(market_cap)


def process_akshare_kline(df: pd.DataFrame) -> list:
    """转换AkShare K线数据格式"""
    kline = []
    if df is None or len(df) == 0:
        return kline

    for idx, row in df.iterrows():
        try:
            # 尝试多种方式获取时间戳
            date_val = row["日期"]
            if hasattr(date_val, "timestamp"):
                timestamp = int(date_val.timestamp() * 1000)
            else:
                timestamp = int(pd.to_datetime(str(date_val)).timestamp() * 1000)
        except:
            # 如果都失败，使用索引作为时间戳
            timestamp = int(
                (datetime.now().timestamp() - (len(df) - idx) * 86400) * 1000
            )

        kline.append(
            [
                timestamp,
                float(row["开盘"]),
                float(row["最高"]),
                float(row["最低"]),
                float(row["收盘"]),
                int(row["成交量"]),
            ]
        )
    return kline


def process_yfinance_kline(df: pd.DataFrame) -> list:
    """转换yFinance K线数据格式（支持港股和美股）"""
    kline = []
    if df is None or len(df) == 0:
        return kline

    df = df.reset_index()

    for idx, row in df.iterrows():
        try:
            timestamp = int(row["Date"].timestamp() * 1000)
        except:
            timestamp = int(pd.to_datetime(row["Date"]).timestamp() * 1000)

        open_price = float(row["Open"])
        close_price = float(row["Close"])
        volume = int(row["Volume"])

        # yFinance 不提供成交额，估算为：成交额 = 均价 × 成交量
        # 均价 = (开盘 + 收盘) / 2
        avg_price = (open_price + close_price) / 2
        turnover = avg_price * volume

        kline.append(
            [
                timestamp,
                open_price,
                float(row["High"]),
                float(row["Low"]),
                close_price,
                volume,
                turnover,  # 估算成交额
            ]
        )
    return kline


def process_akshare_financial(df: pd.DataFrame) -> dict:
    """处理财务数据"""
    if df is None or len(df) == 0:
        return {}

    if isinstance(df, dict):
        return df

    try:
        latest = df.iloc[0] if len(df) > 0 else {}
        return {
            "revenue": float(latest.get("营业收入", 0) or 0),
            "netProfit": float(latest.get("净利润", 0) or 0),
            "roe": float(latest.get("净资产收益率", 0) or 0),
            "roic": float(latest.get("投资回报率", 0) or 0),
            "debtRatio": float(latest.get("资产负债率", 0) or 0),
            "currentRatio": float(latest.get("流动比率", 0) or 0),
            "history": {
                "revenue": df["营业收入"].tolist() if "营业收入" in df.columns else [],
                "netProfit": df["净利润"].tolist() if "净利润" in df.columns else [],
                "roe": df["净资产收益率"].tolist()
                if "净资产收益率" in df.columns
                else [],
            },
        }
    except Exception as e:
        print(f"财务数据处理错误: {e}")
        return {}


def process_akshare_news(df: pd.DataFrame) -> list:
    """处理新闻数据"""
    news = []
    if df is None or len(df) == 0:
        return news

    for idx, row in df.iterrows():
        news.append(
            {
                "title": row.get("新闻标题", ""),
                "url": row.get("新闻链接", ""),
                "source": "东方财富",
                "publishDate": str(row.get("发布时间", "")),
            }
        )

    # 最多返回20条新闻
    return news[:20]


def parse_chinese_number(text: str) -> float:
    """解析中文数字（如：1.23万亿）"""
    if not text or not isinstance(text, str):
        return 0

    text = text.replace(",", "")
    if "万亿" in text:
        return float(text.replace("万亿", "")) * 1e12
    elif "亿" in text:
        return float(text.replace("亿", "")) * 1e8
    elif "万" in text:
        return float(text.replace("万", "")) * 1e4
    else:
        try:
            return float(text)
        except:
            return 0
