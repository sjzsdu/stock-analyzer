"""
数据采集工具模块
包含AkShare、yFinance等数据源的封装
"""

import akshare as ak
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional


async def collect_a_share_data(symbol: str) -> dict:
    """
    采集A股数据

    Args:
        symbol: 股票代码（如：000001）

    Returns:
        包含基本信息、K线、财务数据的字典
    """
    try:
        print(f"[AkShare] 开始采集A股数据: {symbol}")

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
        print(f"[AkShare] 数据采集失败: {e}")
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
    return {
        "symbol": info.get("symbol", ""),
        "name": info.get("longName", info.get("shortName", "")),
        "market": market,
        "currentPrice": float(
            info.get("currentPrice", info.get("regularPrice", 0)) or 0
        ),
        "marketCap": float(info.get("marketCap", 0) or 0),
        "peRatio": float(info.get("forwardPE", info.get("trailingPE", 0)) or 0),
        "pbRatio": float(info.get("priceToBook", 0) or 0),
        "dividendYield": float(info.get("dividendYield", 0) or 0),
        "volume": float(info.get("volume", 0) or 0),
        "currency": info.get("currency", "USD"),
    }


def process_akshare_kline(df: pd.DataFrame) -> list:
    """转换AkShare K线数据格式"""
    kline = []
    if df is None or len(df) == 0:
        return kline

    for idx, row in df.iterrows():
        kline.append(
            [
                int(row["日期"].timestamp() * 1000),
                float(row["开盘"]),
                float(row["最高"]),
                float(row["最低"]),
                float(row["收盘"]),
                int(row["成交量"]),
            ]
        )
    return kline


def process_yfinance_kline(df: pd.DataFrame) -> list:
    """转换yFinance K线数据格式"""
    kline = []
    if df is None or len(df) == 0:
        return kline

    df = df.reset_index()
    for idx, row in df.iterrows():
        kline.append(
            [
                int(row["Date"].timestamp() * 1000),
                float(row["Open"]),
                float(row["High"]),
                float(row["Low"]),
                float(row["Close"]),
                int(row["Volume"]),
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
