"""
数据采集工具模块
包含AkShare、yFinance等数据源的封装
"""

import akshare as ak
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Union
from dataclasses import dataclass, field, asdict
import asyncio
from functools import wraps


# ==================== 数据模型定义 ====================


@dataclass
class StockBasicInfo:
    """股票基本信息"""

    symbol: str = ""  # 股票代码
    name: str = ""  # 公司名称
    market: str = ""  # 市场类型 (A/HK/US)
    current_price: float = 0  # 当前价格
    market_cap: float = 0  # 市值（元/港币/美元）
    pe_ratio: Optional[float] = None  # 市盈率
    pb_ratio: Optional[float] = None  # 市净率
    ps_ratio: Optional[float] = None  # 市销率
    dividend_yield: Optional[float] = None  # 股息率
    ev: Optional[float] = None  # 企业价值
    week_52_high: Optional[float] = None  # 52周最高
    week_52_low: Optional[float] = None  # 52周最低
    beta: Optional[float] = None  # Beta系数
    volume: int = 0  # 成交量
    avg_volume: Optional[int] = None  # 平均成交量
    currency: str = "CNY"  # 货币
    exchange: str = ""  # 交易所
    industry: str = ""  # 所属行业
    sector: str = ""  # 所属行业板块
    concept_tags: List[str] = field(default_factory=list)  # 概念标签
    listing_date: Optional[str] = None  # 上市日期
    website: Optional[str] = None  # 公司网站


@dataclass
class KlineData:
    """K线数据点"""

    timestamp: int = 0  # 时间戳（毫秒）
    open: float = 0  # 开盘价
    high: float = 0  # 最高价
    low: float = 0  # 最低价
    close: float = 0  # 收盘价
    volume: int = 0  # 成交量
    turnover: Optional[float] = None  # 成交额


@dataclass
class TechnicalIndicators:
    """技术指标"""

    # 移动平均线
    ma_5: Optional[float] = None  # 5日均线
    ma_10: Optional[float] = None  # 10日均线
    ma_20: Optional[float] = None  # 20日均线
    ma_60: Optional[float] = None  # 60日均线
    ma_120: Optional[float] = None  # 120日均线

    # 振荡器
    rsi: Optional[float] = None  # RSI (14)
    macd: Optional[float] = None  # MACD
    macd_signal: Optional[float] = None  # MACD Signal
    macd_hist: Optional[float] = None  # MACD Histogram

    # 其他指标
    bollinger_upper: Optional[float] = None  # 布林带上轨
    bollinger_middle: Optional[float] = None  # 布林带中轨
    bollinger_lower: Optional[float] = None  # 布林带下轨
    atr: Optional[float] = None  # ATR (14)
    obv: Optional[int] = None  # OBV 能量潮


@dataclass
class FinancialMetrics:
    """财务指标"""

    # 盈利能力
    roe: Optional[float] = None  # 净资产收益率
    roa: Optional[float] = None  # 资产收益率
    net_profit_margin: Optional[float] = None  # 净利润率
    gross_profit_margin: Optional[float] = None  # 毛利率
    operating_margin: Optional[float] = None  # 营业利润率

    # 成长性
    revenue_growth: Optional[float] = None  # 营收增长率
    net_profit_growth: Optional[float] = None  # 净利润增长率
    eps_growth: Optional[float] = None  # EPS增长率

    # 估值指标
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    ps_ratio: Optional[float] = None
    ev_ebitda: Optional[float] = None  # EV/EBITDA

    # 财务健康
    debt_to_equity: Optional[float] = None  # 资产负债率
    current_ratio: Optional[float] = None  # 流动比率
    quick_ratio: Optional[float] = None  # 速动比率

    # 股息
    dividend_yield: Optional[float] = None
    payout_ratio: Optional[float] = None  # 分红比例

    # 历史数据
    revenue_history: List[float] = field(default_factory=list)
    net_profit_history: List[float] = field(default_factory=list)
    eps_history: List[float] = field(default_factory=list)


@dataclass
class NewsItem:
    """新闻条目"""

    title: str = ""  # 标题
    url: str = ""  # 链接
    source: str = ""  # 来源
    publish_date: str = ""  # 发布时间
    sentiment: Optional[str] = None  # 情绪 (positive/negative/neutral)


@dataclass
class StockAnalysisResult:
    """完整股票数据采集结果"""

    success: bool = False
    error: Optional[str] = None
    timestamp: str = ""  # 采集时间

    # 基本信息
    basic: Optional[StockBasicInfo] = None

    # K线数据
    kline: List[KlineData] = field(default_factory=list)

    # 技术指标
    technical: Optional[TechnicalIndicators] = None

    # 财务数据
    financial: Optional[FinancialMetrics] = None

    # 新闻
    news: List[NewsItem] = field(default_factory=list)

    # 元数据
    data_source: str = ""  # 数据来源
    symbol: str = ""  # 股票代码
    market: str = ""  # 市场类型


# ==================== 工具函数 ====================


def calculate_technical_indicators(kline_data: List[Dict]) -> TechnicalIndicators:
    """计算技术指标"""
    indicators = TechnicalIndicators()

    if not kline_data or len(kline_data) < 5:
        return indicators

    try:
        # 提取收盘价序列
        closes = [k["close"] for k in kline_data]
        volumes = [k["volume"] for k in kline_data]

        if len(closes) < 5:
            return indicators

        # 计算移动平均线
        closes_series = pd.Series(closes)

        indicators.ma_5 = float(closes_series.tail(5).mean())
        indicators.ma_10 = (
            float(closes_series.tail(10).mean()) if len(closes) >= 10 else None
        )
        indicators.ma_20 = (
            float(closes_series.tail(20).mean()) if len(closes) >= 20 else None
        )
        indicators.ma_60 = (
            float(closes_series.tail(60).mean()) if len(closes) >= 60 else None
        )
        indicators.ma_120 = (
            float(closes_series.tail(120).mean()) if len(closes) >= 120 else None
        )

        # 计算 RSI (14)
        if len(closes) >= 14:
            delta = closes_series.diff()
            gain = delta.where(delta > 0, 0).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            # 避免除以零
            loss = loss.replace(0, float("nan"))
            rs = gain / loss
            rs = rs.dropna()
            if len(rs) > 0:
                indicators.rsi = float(100 - (100 / (1 + rs.iloc[-1])))

        # 计算 MACD
        if len(closes) >= 26:
            ema_12 = closes_series.ewm(span=12, adjust=False).mean()
            ema_26 = closes_series.ewm(span=26, adjust=False).mean()
            macd_line = ema_12 - ema_26
            signal_line = macd_line.ewm(span=9, adjust=False).mean()
            indicators.macd = float(macd_line.iloc[-1])
            indicators.macd_signal = float(signal_line.iloc[-1])
            indicators.macd_hist = float(macd_line.iloc[-1] - signal_line.iloc[-1])

        # 计算布林带 (20, 2)
        if len(closes) >= 20:
            ma20 = closes_series.tail(20).mean()
            std20 = closes_series.tail(20).std()
            indicators.bollinger_middle = float(ma20)
            indicators.bollinger_upper = float(ma20 + 2 * std20)
            indicators.bollinger_lower = float(ma20 - 2 * std20)

        # 计算 ATR (14)
        if len(kline_data) >= 14:
            highs = pd.Series([k["high"] for k in kline_data[-14:]])
            lows = pd.Series([k["low"] for k in kline_data[-14:]])
            closes_prev = pd.Series(closes[-15:-1])
            tr = pd.concat(
                [highs - lows, (highs - closes_prev).abs(), (lows - closes_prev).abs()],
                axis=1,
            ).max(axis=1)
            indicators.atr = float(tr.mean())

        # 计算 OBV
        obv = [0]
        for i in range(1, len(closes)):
            if closes[i] > closes[i - 1]:
                obv.append(obv[-1] + volumes[i])
            elif closes[i] < closes[i - 1]:
                obv.append(obv[-1] - volumes[i])
            else:
                obv.append(obv[-1])
        indicators.obv = int(obv[-1])

    except Exception as e:
        print(f"技术指标计算错误: {e}")

    return indicators


def parse_chinese_number(text: Union[str, float]) -> float:
    """解析中文数字（如：1.23万亿）"""
    if isinstance(text, (int, float)):
        return float(text)

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


# ==================== 数据处理函数 ====================


def process_a_share_basic(info: pd.DataFrame, symbol: str = "") -> StockBasicInfo:
    """处理A股基本信息"""
    basic = StockBasicInfo()

    if isinstance(info, pd.DataFrame) and len(info) > 0:
        row = info.iloc[0]

        # 尝试多种可能的字段名
        symbol_value = row.get("代码") or row.get("symbol") or row.get("code") or symbol
        name_value = (
            row.get("名称")
            or row.get("name")
            or row.get("company_name")
            or row.get("名称.1", "")
        )

        basic.symbol = str(symbol_value) if symbol_value else symbol
        basic.name = str(name_value) if name_value else ""
        basic.market = "A"
        basic.current_price = float(row.get("最新价", 0) or 0)
        basic.market_cap = parse_chinese_number(row.get("总市值", "0"))
        basic.pe_ratio = float(row.get("市盈率-动态", 0) or 0) or None
        basic.pb_ratio = float(row.get("市净率", 0) or 0) or None
        basic.dividend_yield = float(row.get("股息率", 0) or 0) or None
        basic.volume = int(float(row.get("成交量", 0) or 0))
        basic.currency = "CNY"

    else:
        basic.symbol = symbol
        basic.name = ""
        basic.market = "A"
        basic.currency = "CNY"

    return basic


def process_yfinance_basic(info: dict, market: str) -> StockBasicInfo:
    """处理yFinance基本信息（港股/美股）"""
    basic = StockBasicInfo()

    if not info:
        basic.market = market
        basic.currency = "HKD" if market == "HK" else "USD"
        return basic

    # 基本信息
    basic.symbol = info.get("symbol", "")
    basic.name = (
        info.get("longName") or info.get("shortName") or info.get("displayName", "")
    )
    basic.market = market
    basic.current_price = float(
        info.get("currentPrice", info.get("regularPrice", 0)) or 0
    )

    # 市值
    market_cap = info.get("marketCap", 0) or 0
    basic.market_cap = float(market_cap) if market_cap else 0

    # 估值指标
    pe = info.get("forwardPE") or info.get("trailingPE")
    if isinstance(pe, dict):
        pe = pe.get("raw", 0)
    basic.pe_ratio = float(pe) if pe else None

    pb = info.get("priceToBook")
    if isinstance(pb, dict):
        pb = pb.get("raw", 0)
    basic.pb_ratio = float(pb) if pb else None

    ps = info.get("priceToSalesTrailing12Months")
    if isinstance(ps, dict):
        ps = ps.get("raw", 0)
    basic.ps_ratio = float(ps) if ps else None

    # 股息率
    dividend = info.get("dividendYield", 0)
    if isinstance(dividend, dict):
        dividend = dividend.get("raw", dividend)
    basic.dividend_yield = float(dividend) if dividend else None

    # 52周高低
    basic.week_52_high = info.get("fiftyTwoWeekHigh")
    basic.week_52_low = info.get("fiftyTwoWeekLow")

    # Beta
    beta = info.get("beta")
    if isinstance(beta, dict):
        beta = beta.get("raw", beta)
    basic.beta = float(beta) if beta else None

    # 成交量
    basic.volume = int(info.get("volume", 0) or 0)
    basic.avg_volume = int(info.get("averageVolume", 0) or 0)

    # 货币和交易所
    basic.currency = info.get("currency", "HKD" if market == "HK" else "USD")
    basic.exchange = info.get("exchange", "")

    # 行业信息
    basic.industry = info.get("industry", "")
    basic.sector = info.get("sector", "")

    # 上市日期
    basic.listing_date = info.get("firstTradeDate", "")

    # 网站
    basic.website = info.get("website", "")

    return basic


def process_akshare_kline(df: pd.DataFrame) -> List[KlineData]:
    """转换AkShare K线数据格式"""
    kline_list = []

    if df is None or len(df) == 0:
        return kline_list

    for _, row in df.iterrows():
        try:
            date_val = row["日期"]
            if hasattr(date_val, "timestamp"):
                timestamp = int(date_val.timestamp() * 1000)
            else:
                timestamp = int(pd.to_datetime(str(date_val)).timestamp() * 1000)
        except:
            timestamp = int(datetime.now().timestamp() * 1000)

        kline = KlineData(
            timestamp=timestamp,
            open=float(row["开盘"]),
            high=float(row["最高"]),
            low=float(row["最低"]),
            close=float(row["收盘"]),
            volume=int(row["成交量"]),
        )
        kline_list.append(kline)

    return kline_list


def process_yfinance_kline(df: pd.DataFrame) -> List[KlineData]:
    """转换yFinance K线数据格式"""
    kline_list = []

    if df is None or len(df) == 0:
        return kline_list

    df = df.reset_index()

    for _, row in df.iterrows():
        try:
            timestamp = int(row["Date"].timestamp() * 1000)
        except:
            timestamp = int(pd.to_datetime(row["Date"]).timestamp() * 1000)

        open_price = float(row["Open"])
        close_price = float(row["Close"])
        volume = int(row["Volume"])

        # 估算成交额
        avg_price = (open_price + close_price) / 2
        turnover = avg_price * volume

        kline = KlineData(
            timestamp=timestamp,
            open=open_price,
            high=float(row["High"]),
            low=float(row["Low"]),
            close=close_price,
            volume=volume,
            turnover=turnover,
        )
        kline_list.append(kline)

    return kline_list


def process_akshare_financial(df: pd.DataFrame) -> FinancialMetrics:
    """处理财务数据"""
    metrics = FinancialMetrics()

    if df is None or len(df) == 0:
        return metrics

    try:
        latest = df.iloc[0] if len(df) > 0 else {}

        # 最新指标
        metrics.roe = float(latest.get("净资产收益率", 0) or 0) or None
        metrics.roa = float(latest.get("总资产收益率", 0) or 0) or None
        metrics.net_profit_margin = float(latest.get("销售净利率", 0) or 0) or None
        metrics.gross_profit_margin = float(latest.get("销售毛利率", 0) or 0) or None
        metrics.debt_to_equity = float(latest.get("资产负债率", 0) or 0) or None
        metrics.current_ratio = float(latest.get("流动比率", 0) or 0) or None

        # 成长性
        metrics.revenue_growth = float(latest.get("营业收入增长率", 0) or 0) or None
        metrics.net_profit_growth = float(latest.get("净利润增长率", 0) or 0) or None

        # 历史数据
        if "营业收入" in df.columns:
            metrics.revenue_history = df["营业收入"].tolist()
        if "净利润" in df.columns:
            metrics.net_profit_history = df["净利润"].tolist()

    except Exception as e:
        print(f"财务数据处理错误: {e}")

    return metrics


def process_akshare_news(df: pd.DataFrame) -> List[NewsItem]:
    """处理新闻数据"""
    news_list = []

    if df is None or len(df) == 0:
        return news_list

    for _, row in df.iterrows():
        news = NewsItem(
            title=str(row.get("新闻标题", "")),
            url=str(row.get("新闻链接", "")),
            source="东方财富",
            publish_date=str(row.get("发布时间", "")),
        )
        news_list.append(news)

    return news_list[:20]


# ==================== 主采集函数 ====================


async def collect_a_share_data(symbol: str) -> StockAnalysisResult:
    """
    采集A股数据

    Args:
        symbol: 股票代码（如：000001）

    Returns:
        StockAnalysisResult: 包含完整股票数据的对象
    """
    result = StockAnalysisResult(
        symbol=symbol,
        market="A",
        data_source="AkShare",
        timestamp=datetime.now().isoformat(),
    )

    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(
                f"[AkShare] 开始采集A股数据: {symbol} (尝试 {attempt + 1}/{max_retries})"
            )

            # 基本信息
            info = ak.stock_individual_info_em(symbol=symbol)
            result.basic = process_a_share_basic(info, symbol)
            print(f"[AkShare] 基本信息: {result.basic.name}")

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
            result.kline = process_akshare_kline(hist_data)
            print(f"[AkShare] 获取到 {len(result.kline)} 条K线数据")

            # 计算技术指标
            if result.kline:
                kline_dicts = [
                    {
                        "timestamp": k.timestamp,
                        "open": k.open,
                        "high": k.high,
                        "low": k.low,
                        "close": k.close,
                        "volume": k.volume,
                    }
                    for k in result.kline
                ]
                result.technical = calculate_technical_indicators(kline_dicts)
                print(f"[AkShare] 技术指标计算完成")

            # 财务数据
            try:
                financial = ak.stock_financial_analysis_indicator(symbol=symbol)
                result.financial = process_akshare_financial(financial)
                print(
                    f"[AkShare] 财务数据: {len(financial) if hasattr(financial, '__len__') else 'N/A'} 条"
                )
            except Exception as e:
                print(f"[AkShare] 财务数据获取失败: {e}")

            # 新闻数据
            try:
                news = ak.stock_news_em(symbol=symbol)
                result.news = process_akshare_news(news)
                print(f"[AkShare] 新闻数据: {len(result.news)} 条")
            except Exception as e:
                print(f"[AkShare] 新闻数据获取失败: {e}")

            result.success = True
            return result

        except Exception as e:
            print(f"[AkShare] 数据采集失败 (尝试 {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(1 * (2**attempt))
            else:
                result.error = str(e)
                return result


async def collect_hk_stock_data(symbol: str) -> StockAnalysisResult:
    """
    采集港股数据

    Args:
        symbol: 股票代码（如：0700.HK）

    Returns:
        StockAnalysisResult: 包含完整股票数据的对象
    """
    result = StockAnalysisResult(
        symbol=symbol,
        market="HK",
        data_source="yFinance",
        timestamp=datetime.now().isoformat(),
    )

    try:
        print(f"[yFinance] 开始采集港股数据: {symbol}")

        ticker = yf.Ticker(symbol)
        info = ticker.info

        result.basic = process_yfinance_basic(info, "HK")
        print(f"[yFinance] 公司名称: {result.basic.name}")

        # 历史K线（2年）
        hist = ticker.history(period="2y", interval="1d")
        result.kline = process_yfinance_kline(hist)
        print(f"[yFinance] 获取到 {len(result.kline)} 条K线数据")

        # 计算技术指标
        if result.kline:
            kline_dicts = [
                {
                    "timestamp": k.timestamp,
                    "open": k.open,
                    "high": k.high,
                    "low": k.low,
                    "close": k.close,
                    "volume": k.volume,
                }
                for k in result.kline
            ]
            result.technical = calculate_technical_indicators(kline_dicts)
            print(f"[yFinance] 技术指标计算完成")

        result.success = True
        return result

    except Exception as e:
        print(f"[yFinance] 数据采集失败: {e}")
        result.error = str(e)
        return result


async def collect_us_stock_data(symbol: str) -> StockAnalysisResult:
    """
    采集美股数据

    Args:
        symbol: 股票代码（如：AAPL）

    Returns:
        StockAnalysisResult: 包含完整股票数据的对象
    """
    result = StockAnalysisResult(
        symbol=symbol,
        market="US",
        data_source="yFinance",
        timestamp=datetime.now().isoformat(),
    )

    try:
        print(f"[yFinance] 开始采集美股数据: {symbol}")

        ticker = yf.Ticker(symbol)
        info = ticker.info

        result.basic = process_yfinance_basic(info, "US")
        print(f"[yFinance] 公司名称: {result.basic.name}")

        # 历史K线（2年）
        hist = ticker.history(period="2y", interval="1d")
        result.kline = process_yfinance_kline(hist)
        print(f"[yFinance] 获取到 {len(result.kline)} 条K线数据")

        # 计算技术指标
        if result.kline:
            kline_dicts = [
                {
                    "timestamp": k.timestamp,
                    "open": k.open,
                    "high": k.high,
                    "low": k.low,
                    "close": k.close,
                    "volume": k.volume,
                }
                for k in result.kline
            ]
            result.technical = calculate_technical_indicators(kline_dicts)
            print(f"[yFinance] 技术指标计算完成")

        result.success = True
        return result

    except Exception as e:
        print(f"[yFinance] 数据采集失败: {e}")
        result.error = str(e)
        return result


# ==================== 便利转换函数 ====================


def stock_result_to_dict(result: StockAnalysisResult) -> dict:
    """将 StockAnalysisResult 转换为字典（兼容旧接口）"""
    return {
        "success": result.success,
        "error": result.error,
        "timestamp": result.timestamp,
        "basic": asdict(result.basic) if result.basic else None,
        "kline": [
            {
                "timestamp": k.timestamp,
                "open": k.open,
                "high": k.high,
                "low": k.low,
                "close": k.close,
                "volume": k.volume,
                "turnover": k.turnover,
            }
            for k in result.kline
        ],
        "technical": asdict(result.technical) if result.technical else None,
        "financial": asdict(result.financial) if result.financial else None,
        "news": [asdict(n) for n in result.news],
        "data_source": result.data_source,
        "symbol": result.symbol,
        "market": result.market,
    }
