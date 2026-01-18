"""
增强版数据采集工具模块
包含更完整的 AkShare 接口封装、情感分析和增强的数据模型
"""

import akshare as ak
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Union
from dataclasses import dataclass, field, asdict
import asyncio
import re


@dataclass
class StockBasicInfo:
    """股票基本信息 - 增强版"""

    symbol: str = ""
    name: str = ""
    market: str = "A"
    current_price: float = 0
    market_cap: float = 0
    circulating_market_cap: float = 0  # 流通市值
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    ps_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None
    ev: Optional[float] = None
    week_52_high: Optional[float] = None
    week_52_low: Optional[float] = None
    beta: Optional[float] = None
    volume: int = 0
    avg_volume: Optional[int] = None
    currency: str = "CNY"
    exchange: str = ""
    industry: str = ""
    sector: str = ""
    concept_tags: List[str] = field(default_factory=list)
    listing_date: Optional[str] = None
    website: Optional[str] = None
    turnover_rate: Optional[float] = None
    change_pct: Optional[float] = None
    change_amount: Optional[float] = None
    open: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    pre_close: Optional[float] = None


@dataclass
class TechnicalIndicators:
    """技术指标"""

    ma_5: Optional[float] = None
    ma_10: Optional[float] = None
    ma_20: Optional[float] = None
    ma_60: Optional[float] = None
    ma_120: Optional[float] = None
    rsi: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_hist: Optional[float] = None
    bollinger_upper: Optional[float] = None
    bollinger_middle: Optional[float] = None
    bollinger_lower: Optional[float] = None
    atr: Optional[float] = None
    obv: Optional[int] = None


@dataclass
class FinancialMetrics:
    """财务指标 - 增强版"""

    roe: Optional[float] = None
    roa: Optional[float] = None
    net_profit_margin: Optional[float] = None
    gross_profit_margin: Optional[float] = None
    operating_margin: Optional[float] = None
    revenue_growth: Optional[float] = None
    net_profit_growth: Optional[float] = None
    eps_growth: Optional[float] = None
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    ps_ratio: Optional[float] = None
    ev_ebitda: Optional[float] = None
    debt_to_equity: Optional[float] = None
    current_ratio: Optional[float] = None
    quick_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None
    payout_ratio: Optional[float] = None
    revenue_history: List[float] = field(default_factory=list)
    net_profit_history: List[float] = field(default_factory=list)
    eps_history: List[float] = field(default_factory=list)
    basic_eps: Optional[float] = None
    diluted_eps: Optional[float] = None
    net_profit: Optional[float] = None
    total_assets: Optional[float] = None
    total_liabilities: Optional[float] = None
    cash_flow: Optional[float] = None


@dataclass
class NewsItem:
    """新闻条目"""

    title: str = ""
    url: str = ""
    source: str = ""
    publish_date: str = ""
    sentiment: Optional[str] = None
    sentiment_score: Optional[float] = None


@dataclass
class KlineData:
    """K线数据点"""

    timestamp: int = 0
    open: float = 0
    high: float = 0
    low: float = 0
    close: float = 0
    volume: int = 0
    turnover: Optional[float] = None


@dataclass
class StockAnalysisResult:
    """完整股票数据采集结果 - 增强版"""

    success: bool = False
    error: Optional[str] = None
    timestamp: str = ""
    basic: Optional[StockBasicInfo] = None
    kline: List[KlineData] = field(default_factory=list)
    technical: Optional[TechnicalIndicators] = None
    financial: Optional[FinancialMetrics] = None
    news: List[NewsItem] = field(default_factory=list)
    data_source: str = ""
    symbol: str = ""
    market: str = ""


def parse_chinese_number(text: Union[str, float]) -> float:
    """解析中文数字"""
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


def safe_float(value, default=None) -> Optional[float]:
    """安全转换为浮点数"""
    try:
        if value is None:
            return default
        if isinstance(value, (int, float)):
            return float(value) if value != 0 else default
        if isinstance(value, str):
            cleaned = value.replace(",", "").strip()
            if cleaned == "" or cleaned == "-":
                return default
            return float(cleaned)
        return default
    except:
        return default


def process_spot_data(df: pd.DataFrame, symbol: str) -> Optional[StockBasicInfo]:
    """处理实时行情数据 stock_zh_a_spot"""
    if df is None or len(df) == 0:
        return None

    df = df.copy()
    df["代码"] = df["代码"].astype(str)

    mask = df["代码"].str.contains(symbol, na=False) | df["代码"].str.match(
        symbol, na=False
    )
    matched = df[mask]

    if len(matched) == 0:
        return None

    row = matched.iloc[0]

    basic = StockBasicInfo()
    basic.symbol = str(row.get("代码", "")) or ""
    basic.name = str(row.get("名称", "")) or ""
    basic.current_price = safe_float(row.get("最新价")) or 0
    basic.open = safe_float(row.get("今开")) or 0
    basic.high = safe_float(row.get("最高")) or 0
    basic.low = safe_float(row.get("最低")) or 0
    basic.pre_close = safe_float(row.get("昨收")) or 0
    basic.change_amount = safe_float(row.get("涨跌额")) or 0
    basic.change_pct = safe_float(row.get("涨跌幅")) or 0
    basic.volume = int(safe_float(row.get("成交量", 0)) or 0)
    basic.avg_volume = int(safe_float(row.get("成交额", 0)) or 0)
    basic.market_cap = parse_chinese_number(str(row.get("总市值", "0"))) or 0
    basic.pe_ratio = safe_float(row.get("市盈率-动态"))
    basic.pb_ratio = safe_float(row.get("市净率"))
    basic.dividend_yield = safe_float(row.get("股息率"))
    basic.turnover_rate = safe_float(row.get("换手率"))

    return basic


def process_individual_info(info: pd.DataFrame, symbol: str) -> Dict[str, Any]:
    """处理个股详细信息 stock_individual_info_em"""
    result = {}

    if info is None or len(info) == 0:
        return result

    info_dict = dict(zip(info.iloc[:, 0], info.iloc[:, 1]))

    for key, value in info_dict.items():
        key_str = str(key).strip()
        value_str = str(value).strip() if value else ""

        if "总市值" in key_str:
            result["market_cap"] = parse_chinese_number(value_str)
        elif "流通市值" in key_str:
            result["circulating_market_cap"] = parse_chinese_number(value_str)
        elif "股票简称" in key_str or "公司名称" in key_str:
            result["name"] = value_str
        elif "上市时间" in key_str or "上市日期" in key_str:
            result["listing_date"] = value_str
        elif "公司主页" in key_str:
            result["website"] = value_str
        elif "行业" in key_str:
            result["industry"] = value_str
        elif "主营业务" in key_str or "主要产品" in key_str:
            result["business_scope"] = value_str
        elif "注册资本" in key_str:
            result["registered_capital"] = value_str
        elif "总股本" in key_str:
            result["total_shares"] = parse_chinese_number(value_str)
        elif "流通股" in key_str:
            result["circulating_shares"] = parse_chinese_number(value_str)

    return result


def process_valuation_data(df: pd.DataFrame) -> Dict[str, Any]:
    """处理估值数据 stock_value_em"""
    result = {}

    if df is None or len(df) == 0:
        return result

    try:
        if not isinstance(df, pd.DataFrame) or df.empty:
            return result

        latest = df.iloc[0]

        result["pe_ttm"] = safe_float(latest.get("PE(TTM)"))
        result["pe_static"] = safe_float(latest.get("PE(静)"))
        result["pb"] = safe_float(latest.get("市净率"))
        result["peg"] = safe_float(latest.get("PEG值"))
        result["ps"] = safe_float(latest.get("市销率"))
        result["pcf"] = safe_float(latest.get("市现率"))

    except Exception as e:
        print(f"[AkShare] 估值数据处理错误: {e}")

    return result


def process_ths_financial_data(df: pd.DataFrame) -> FinancialMetrics:
    """处理同花顺财务数据 stock_financial_abstract_new_ths"""
    metrics = FinancialMetrics()

    if df is None or len(df) == 0:
        return metrics

    try:
        if not isinstance(df, pd.DataFrame) or df.empty:
            return metrics

        metric_map = {
            "index_full_diluted_roe": "roe",
            "parent_holder_net_profit": "net_profit",
            "basic_eps": "basic_eps",
            "operating_income_total": "total_revenue",
            "current_ratio": "current_ratio",
            "quick_ratio": "quick_ratio",
            "sale_gross_margin": "gross_profit_margin",
            "assets_debt_ratio": "debt_to_equity",
            "conservative_quick_ratio": "quick_ratio",
        }

        latest_period = df["report_period"].max()
        latest_df = df[df["report_period"] == latest_period]

        for _, row in latest_df.iterrows():
            metric_name = row.get("metric_name", "")
            value = row.get("value")

            if metric_name in metric_map:
                field_name = metric_map[metric_name]
                float_value = safe_float(value)
                if float_value is not None:
                    if field_name == "roe":
                        metrics.roe = float_value
                    elif field_name == "net_profit":
                        metrics.net_profit = float_value * 1e8  # 转换为元
                    elif field_name == "basic_eps":
                        metrics.basic_eps = float_value
                    elif field_name == "total_revenue":
                        metrics.revenue_history.append(float_value * 1e8)
                    elif field_name == "current_ratio":
                        metrics.current_ratio = float_value
                    elif field_name == "quick_ratio":
                        metrics.quick_ratio = float_value
                    elif field_name == "gross_profit_margin":
                        metrics.gross_profit_margin = float_value
                    elif field_name == "debt_to_equity":
                        metrics.debt_to_equity = float_value

    except Exception as e:
        print(f"[AkShare] 同花顺财务数据处理错误: {e}")

    return metrics


def process_financial_em(df: pd.DataFrame) -> FinancialMetrics:
    """处理东方财富财务分析数据 stock_financial_analysis_indicator_em"""
    metrics = FinancialMetrics()

    if df is None or len(df) == 0:
        return metrics

    try:
        # 确保 df 是 DataFrame 且非空
        if not isinstance(df, pd.DataFrame) or df.empty:
            return metrics

        latest = df.iloc[0] if len(df) > 0 else {}

        # 尝试不同的列名
        roe_cols = ["净资产收益率", "ROE", "roe"]
        roa_cols = ["总资产收益率", "ROA", "roa"]
        net_profit_margin_cols = ["销售净利率", "净利率", "净利润率"]
        gross_profit_margin_cols = ["销售毛利率", "毛利率"]
        operating_margin_cols = ["营业利润率", "营业利润"]
        debt_to_equity_cols = ["资产负债率", "负债率"]
        current_ratio_cols = ["流动比率"]
        quick_ratio_cols = ["速动比率"]
        payout_ratio_cols = ["分红比例", "股息支付率"]
        revenue_growth_cols = ["营业收入增长率", "营收增长"]
        net_profit_growth_cols = ["净利润增长率", "利润增长"]

        # 尝试获取 ROE
        for col in roe_cols:
            if col in df.columns:
                metrics.roe = safe_float(latest.get(col))
                break

        # 尝试获取 ROA
        for col in roa_cols:
            if col in df.columns:
                metrics.roa = safe_float(latest.get(col))
                break

        # 尝试获取净利率
        for col in net_profit_margin_cols:
            if col in df.columns:
                metrics.net_profit_margin = safe_float(latest.get(col))
                break

        # 尝试获取毛利率
        for col in gross_profit_margin_cols:
            if col in df.columns:
                metrics.gross_profit_margin = safe_float(latest.get(col))
                break

        # 尝试获取营业利润率
        for col in operating_margin_cols:
            if col in df.columns:
                metrics.operating_margin = safe_float(latest.get(col))
                break

        # 尝试获取资产负债率
        for col in debt_to_equity_cols:
            if col in df.columns:
                metrics.debt_to_equity = safe_float(latest.get(col))
                break

        # 尝试获取流动比率
        for col in current_ratio_cols:
            if col in df.columns:
                metrics.current_ratio = safe_float(latest.get(col))
                break

        # 尝试获取速动比率
        for col in quick_ratio_cols:
            if col in df.columns:
                metrics.quick_ratio = safe_float(latest.get(col))
                break

        # 尝试获取分红比例
        for col in payout_ratio_cols:
            if col in df.columns:
                metrics.payout_ratio = safe_float(latest.get(col))
                break

        # 尝试获取营收增长率
        for col in revenue_growth_cols:
            if col in df.columns:
                metrics.revenue_growth = safe_float(latest.get(col))
                break

        # 尝试获取净利润增长率
        for col in net_profit_growth_cols:
            if col in df.columns:
                metrics.net_profit_growth = safe_float(latest.get(col))
                break

        if "每股收益" in df.columns:
            metrics.basic_eps = safe_float(latest.get("每股收益"))
            if len(df) >= 2:
                metrics.eps_history = df["每股收益"].tolist()

        if "净利润" in df.columns:
            metrics.net_profit_history = df["净利润"].tolist()

        if "营业收入" in df.columns:
            metrics.revenue_history = df["营业收入"].tolist()

    except Exception as e:
        print(f"财务数据处理错误: {e}")

    return metrics


def process_concept_tags(symbol: str) -> List[str]:
    """获取概念标签"""
    tags = []

    try:
        # 尝试使用 stock_zh_a_concept_name_ths
        try:
            concept_df = ak.stock_zh_a_concept_name_ths()
            if concept_df is not None and len(concept_df) > 0:
                if "概念名称" in concept_df.columns:
                    tags = concept_df["概念名称"].tolist()[:5]  # 只取前5个概念标签
        except Exception as e:
            print(f"[AkShare] stock_zh_a_concept_name_ths 失败: {e}")
            # 尝试使用 stock_board_concept_cons_ths
            try:
                concept_df = ak.stock_board_concept_cons_ths(symbol=symbol)
                if concept_df is not None and len(concept_df) > 0:
                    if "概念名称" in concept_df.columns:
                        tags = concept_df["概念名称"].tolist()[:5]
                    elif "concept_name" in concept_df.columns:
                        tags = concept_df["concept_name"].tolist()[:5]
            except Exception as e2:
                print(f"[AkShare] stock_board_concept_cons_ths 失败: {e2}")
    except Exception as e:
        print(f"概念标签获取失败: {e}")

    # 如果没有获取到概念标签，返回默认标签
    if not tags:
        tags = ["A股", "主板", "上海市场"]

    return tags


def process_industry_info(symbol: str) -> Dict[str, str]:
    """获取行业信息"""
    info = {"industry": "", "sector": ""}

    try:
        basic_df = ak.stock_info_sz_name_code(symbol="A股列表")
        if basic_df is not None:
            for _, row in basic_df.iterrows():
                code = str(row.get("代码", ""))
                if symbol in code:
                    info["industry"] = str(row.get("所属行业", ""))
                    break
    except Exception as e:
        print(f"行业信息获取失败: {e}")

    return info


def process_akshare_kline(df: pd.DataFrame) -> List[KlineData]:
    """转换AkShare K线数据格式"""
    kline_list = []

    if df is None or len(df) == 0:
        return kline_list

    for _, row in df.iterrows():
        try:
            date_val = row.get("日期")
            if date_val is None:
                date_val = row.get("Datetime", datetime.now())
            if hasattr(date_val, "timestamp"):
                timestamp = int(date_val.timestamp() * 1000)
            else:
                timestamp = int(pd.to_datetime(str(date_val)).timestamp() * 1000)
        except:
            timestamp = int(datetime.now().timestamp() * 1000)

        kline = KlineData(
            timestamp=timestamp,
            open=float(row.get("开盘", 0)),
            high=float(row.get("最高", 0)),
            low=float(row.get("最低", 0)),
            close=float(row.get("收盘", 0)),
            volume=int(row.get("成交量", 0)),
            turnover=float(row.get("成交额", 0)) or None,
        )
        kline_list.append(kline)

    return kline_list


def calculate_technical_indicators(kline_data: List[Dict]) -> TechnicalIndicators:
    """计算技术指标"""
    indicators = TechnicalIndicators()

    if not kline_data or len(kline_data) < 5:
        return indicators

    try:
        closes = [k["close"] for k in kline_data]
        volumes = [k["volume"] for k in kline_data]

        if len(closes) < 5:
            return indicators

        closes_series = pd.Series(closes)

        indicators.ma_5 = float(closes_series.tail(5).mean())
        if len(closes) >= 10:
            indicators.ma_10 = float(closes_series.tail(10).mean())
        if len(closes) >= 20:
            indicators.ma_20 = float(closes_series.tail(20).mean())
        if len(closes) >= 60:
            indicators.ma_60 = float(closes_series.tail(60).mean())
        if len(closes) >= 120:
            indicators.ma_120 = float(closes_series.tail(120).mean())

        if len(closes) >= 14:
            delta = closes_series.diff()
            gain = delta.where(delta > 0, 0).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            loss = loss.replace(0, float("nan"))
            rs = gain / loss
            rs = rs.dropna()
            if len(rs) > 0:
                indicators.rsi = float(100 - (100 / (1 + rs.iloc[-1])))

        if len(closes) >= 26:
            ema_12 = closes_series.ewm(span=12, adjust=False).mean()
            ema_26 = closes_series.ewm(span=26, adjust=False).mean()
            macd_line = ema_12 - ema_26
            signal_line = macd_line.ewm(span=9, adjust=False).mean()
            indicators.macd = float(macd_line.iloc[-1])
            indicators.macd_signal = float(signal_line.iloc[-1])
            indicators.macd_hist = float(macd_line.iloc[-1] - signal_line.iloc[-1])

        if len(closes) >= 20:
            ma20 = closes_series.tail(20).mean()
            std20 = closes_series.tail(20).std()
            indicators.bollinger_middle = float(ma20)
            indicators.bollinger_upper = float(ma20 + 2 * std20)
            indicators.bollinger_lower = float(ma20 - 2 * std20)

        if len(kline_data) >= 14:
            highs = pd.Series([k["high"] for k in kline_data[-14:]])
            lows = pd.Series([k["low"] for k in kline_data[-14:]])
            closes_prev = pd.Series(closes[-15:-1])
            tr = pd.concat(
                [highs - lows, (highs - closes_prev).abs(), (lows - closes_prev).abs()],
                axis=1,
            ).max(axis=1)
            indicators.atr = float(tr.mean())

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


def process_news(df: pd.DataFrame) -> List[NewsItem]:
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


def analyze_sentiment(
    news_list: List[NewsItem], stock_name: str = ""
) -> List[NewsItem]:
    """简单情感分析 - 基于关键词匹配"""
    positive_words = [
        "增长",
        "盈利",
        "利好",
        "突破",
        "上涨",
        "增持",
        "推荐",
        "买入",
        "上升",
        "强劲",
        "超预期",
        "突破",
        "创新高",
        "高增长",
    ]
    negative_words = [
        "下降",
        "亏损",
        "利空",
        "下跌",
        "减持",
        "卖出",
        "疲软",
        "不及预期",
        "风险",
        "警示",
        "下跌",
        "创新低",
        "暴跌",
        "预警",
    ]

    for news in news_list:
        title = news.title
        score = 0.0

        for word in positive_words:
            if word in title:
                score += 0.2
        for word in negative_words:
            if word in title:
                score -= 0.2

        score = max(-1, min(1, score))

        if score > 0.1:
            news.sentiment = "positive"
        elif score < -0.1:
            news.sentiment = "negative"
        else:
            news.sentiment = "neutral"

        news.sentiment_score = score

    return news_list


async def collect_a_share_data(symbol: str) -> StockAnalysisResult:
    """
    采集A股数据

    包含完整的数据采集:
    - 实时行情 (stock_zh_a_spot)
    - 个股详细信息 (stock_individual_info_em)
    - 概念标签 (stock_concept_fundamentals)
    - 历史K线 (stock_zh_a_hist)
    - 财务数据 (stock_financial_analysis_indicator_em)
    - 新闻资讯 (stock_news_em) + 情感分析

    Args:
        symbol: 股票代码（如：600168）

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

            spot_basic = None

            # 1. 获取实时行情
            try:
                print("[AkShare] 开始获取实时行情...")
                spot_df = ak.stock_zh_a_spot()
                if spot_df is not None and len(spot_df) > 0:
                    spot_basic = process_spot_data(spot_df, symbol)
                    if spot_basic:
                        if not result.basic:
                            result.basic = spot_basic
                        else:
                            result.basic.current_price = spot_basic.current_price
                            result.basic.change_pct = spot_basic.change_pct
                            result.basic.change_amount = spot_basic.change_amount
                            result.basic.open = spot_basic.open
                            result.basic.high = spot_basic.high
                            result.basic.low = spot_basic.low
                            result.basic.pre_close = spot_basic.pre_close
                            result.basic.volume = spot_basic.volume
                            result.basic.pe_ratio = spot_basic.pe_ratio
                            result.basic.pb_ratio = spot_basic.pb_ratio
                            result.basic.dividend_yield = spot_basic.dividend_yield
                            result.basic.turnover_rate = spot_basic.turnover_rate
                        print(
                            f"[AkShare] 实时行情获取成功: 价格={spot_basic.current_price}"
                        )
                    else:
                        print(f"[AkShare] 实时行情未找到匹配的股票: {symbol}")
                else:
                    print("[AkShare] 实时行情数据为空")
            except Exception as e:
                print(f"[AkShare] 实时行情获取失败: {e}")
                if not result.basic:
                    result.basic = StockBasicInfo()
                    result.basic.symbol = symbol
                    result.basic.name = symbol
                    result.basic.industry = "未知行业"
                else:
                    result.basic.name = result.basic.name or symbol
                    result.basic.industry = result.basic.industry or "未知行业"

            # 2. 获取个股详细信息
            try:
                print("[AkShare] 开始获取个股详细信息...")
                info_df = ak.stock_individual_info_em(symbol=symbol)
                if info_df is not None and len(info_df) > 0:
                    info_dict = process_individual_info(info_df, symbol)
                    if result.basic:
                        if info_dict.get("name"):
                            result.basic.name = info_dict["name"]
                        if info_dict.get("industry"):
                            result.basic.industry = info_dict["industry"]
                        if info_dict.get("listing_date"):
                            result.basic.listing_date = info_dict["listing_date"]
                        if info_dict.get("website"):
                            result.basic.website = info_dict["website"]
                        if info_dict.get("market_cap"):
                            result.basic.market_cap = info_dict["market_cap"]
                        if info_dict.get("circulating_market_cap"):
                            result.basic.circulating_market_cap = info_dict[
                                "circulating_market_cap"
                            ]
                    print(
                        f"[AkShare] 个股详细信息获取成功: 名称={result.basic.name if result.basic else 'N/A'}, 行业={result.basic.industry if result.basic and result.basic.industry else 'N/A'}"
                    )
                else:
                    print("[AkShare] 个股详细信息为空")
                    if result.basic:
                        result.basic.name = result.basic.name or symbol
                        result.basic.industry = result.basic.industry or "未知行业"
            except Exception as e:
                print(f"[AkShare] 个股信息获取失败: {e}")
                if result.basic:
                    result.basic.name = result.basic.name or symbol
                    result.basic.industry = result.basic.industry or "未知行业"

            # 3. 获取概念标签
            try:
                concept_tags = process_concept_tags(symbol)
                if result.basic:
                    result.basic.concept_tags = concept_tags
                print(f"[AkShare] 概念标签: {concept_tags}")
            except Exception as e:
                print(f"[AkShare] 概念标签获取失败: {e}")

            # 4. 获取历史K线
            end_date = datetime.now().strftime("%Y%m%d")
            start_date = (datetime.now() - timedelta(days=730)).strftime("%Y%m%d")

            try:
                print("[AkShare] 开始获取K线数据...")
                hist_data = ak.stock_zh_a_hist(
                    symbol=symbol,
                    period="daily",
                    start_date=start_date,
                    end_date=end_date,
                    adjust="qfq",
                )
                result.kline = process_akshare_kline(hist_data)
                print(f"[AkShare] K线数据: {len(result.kline)} 条")

                # 使用K线数据的最后一天更新实时行情
                if result.kline and len(result.kline) > 0:
                    last_kline = result.kline[-1]
                    if result.basic:
                        result.basic.current_price = last_kline.close
                        result.basic.pre_close = (
                            last_kline.close
                        )  # 使用当前价格作为昨收
                        result.basic.open = last_kline.open
                        result.basic.high = last_kline.high
                        result.basic.low = last_kline.low
                        print(
                            f"[AkShare] 使用K线数据更新实时行情: 价格={last_kline.close}"
                        )

                    # 计算 52 周最高/最低
                    if len(hist_data) >= 20:
                        hist_df = hist_data.copy()
                        hist_df["日期"] = pd.to_datetime(hist_df["日期"])
                        hist_df = hist_df.sort_values("日期")

                        # 最近 252 个交易日（约 1 年）
                        last_year_df = hist_df.tail(252)
                        if len(last_year_df) > 0 and result.basic:
                            result.basic.week_52_high = float(
                                last_year_df["最高"].max()
                            )
                            result.basic.week_52_low = float(last_year_df["最低"].min())

                            # 换手率
                            if "换手率" in hist_df.columns:
                                latest_turnover = hist_df.iloc[-1]["换手率"]
                                result.basic.turnover_rate = safe_float(latest_turnover)

                            print(
                                f"[AkShare] 52周数据: 高={result.basic.week_52_high}, 低={result.basic.week_52_low}, 换手率={result.basic.turnover_rate}"
                            )
            except Exception as e:
                print(f"[AkShare] K线数据获取失败: {e}")
                # 如果K线数据获取失败，创建空的K线列表
                result.kline = []

            # 5. 计算技术指标
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

            # 6. 获取财务数据 (使用EM接口)
            try:
                financial_df = ak.stock_financial_analysis_indicator_em(symbol=symbol)
                if financial_df is not None and len(financial_df) > 0:
                    result.financial = process_financial_em(financial_df)
                    print(f"[AkShare] 财务数据获取成功, ROE={result.financial.roe}")
                else:
                    raise ValueError("财务数据为空")
            except Exception as e:
                print(f"[AkShare] 财务数据获取失败: {e}")
                try:
                    financial_df = ak.stock_financial_analysis_indicator(symbol=symbol)
                    if financial_df is not None and len(financial_df) > 0:
                        result.financial = process_financial_em(financial_df)
                        print(f"[AkShare] 备用财务数据接口成功")
                    else:
                        raise ValueError("备用财务数据为空")
                except Exception as e2:
                    print(f"[AkShare] 备用财务数据也失败: {e2}")
                    try:
                        ths_financial_df = ak.stock_financial_abstract_new_ths(
                            symbol=symbol
                        )
                        if ths_financial_df is not None and len(ths_financial_df) > 0:
                            result.financial = process_ths_financial_data(
                                ths_financial_df
                            )
                            print(
                                f"[AkShare] 同花顺财务数据获取成功, ROE={result.financial.roe}"
                            )
                        else:
                            raise ValueError("同花顺财务数据为空")
                    except Exception as e3:
                        print(f"[AkShare] 同花顺财务数据也失败: {e3}")

            # 7. 获取新闻数据
            try:
                news_df = ak.stock_news_em(symbol=symbol)
                news_list = process_news(news_df)
                result.news = analyze_sentiment(
                    news_list, result.basic.name if result.basic else ""
                )
                print(f"[AkShare] 新闻数据: {len(result.news)} 条")
            except Exception as e:
                print(f"[AkShare] 新闻数据获取失败: {e}")

            # 8. 获取估值数据 (PE, PB 等)
            try:
                valuation_df = ak.stock_value_em(symbol=symbol)
                valuation_data = process_valuation_data(valuation_df)
                if valuation_data and result.basic:
                    if valuation_data.get("pe_ttm"):
                        result.basic.pe_ratio = valuation_data["pe_ttm"]
                    if valuation_data.get("pb"):
                        result.basic.pb_ratio = valuation_data["pb"]
                    if valuation_data.get("ps"):
                        result.basic.ps_ratio = valuation_data["ps"]
                    print(
                        f"[AkShare] 估值数据获取成功: PE(TTM)={result.basic.pe_ratio}, PB={result.basic.pb_ratio}"
                    )
            except Exception as e:
                print(f"[AkShare] 估值数据获取失败: {e}")

            # 9. 补充行业信息
            if result.basic and not result.basic.industry:
                try:
                    industry_info = process_industry_info(symbol)
                    result.basic.industry = industry_info.get("industry", "")
                except Exception as e:
                    print(f"[AkShare] 行业信息获取失败: {e}")

            # 9. 如果basic还是空的，用spot数据
            if not result.basic and spot_basic:
                result.basic = spot_basic

            result.success = True
            return result

        except Exception as e:
            print(f"[AkShare] 数据采集失败 (尝试 {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(1 * (2**attempt))
            else:
                result.error = str(e)
                return result


def stock_result_to_dict(result: StockAnalysisResult) -> dict:
    """将增强版结果转换为字典"""
    # 确保 basic 数据包含所有必要字段
    basic_dict = None
    if result.basic:
        basic_dict = asdict(result.basic)
        # 确保所有估值指标都有默认值
        if basic_dict.get("pe_ratio") is None:
            basic_dict["pe_ratio"] = 0.0
        if basic_dict.get("pb_ratio") is None:
            basic_dict["pb_ratio"] = 0.0
        if basic_dict.get("dividend_yield") is None:
            basic_dict["dividend_yield"] = 0.0
        if basic_dict.get("market_cap") is None:
            basic_dict["market_cap"] = 0.0
        if basic_dict.get("circulating_market_cap") is None:
            basic_dict["circulating_market_cap"] = 0.0

    return {
        "success": result.success,
        "error": result.error,
        "timestamp": result.timestamp,
        "basic": basic_dict,
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


def get_a_share_company_info(symbol: str) -> Dict[str, Any]:
    """获取A股公司详细信息"""
    try:
        info = ak.stock_individual_info_em(symbol=symbol)
        info_dict = {}
        for _, row in info.iterrows():
            info_dict[row["指标"]] = row["值"]
        return {"success": True, "data": info_dict}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_a_share_financial_indicators(symbol: str) -> Dict[str, Any]:
    """获取A股财务指标"""
    try:
        financial = ak.stock_financial_analysis_indicator(symbol=symbol)
        try:
            dupont = ak.stock_dupont_index(symbol=symbol)
        except:
            dupont = pd.DataFrame()
        return {"success": True, "financial": financial, "dupont": dupont}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def collect_comprehensive_stock_data(
    symbol: str, market: str = "A"
) -> Dict[str, Any]:
    """采集完整的股票数据"""
    print(f"[Collector] 开始采集 {market} 股 {symbol} 的完整数据...")

    collected_data = {
        "symbol": symbol,
        "market": market,
        "collectedAt": datetime.now().isoformat(),
    }

    try:
        if market == "A":
            basic_result = get_a_share_company_info(symbol)
            if basic_result["success"]:
                collected_data["basic"] = basic_result["data"]

            financial_result = get_a_share_financial_indicators(symbol)
            if financial_result["success"]:
                collected_data["financial"] = financial_result
                if len(financial_result["financial"]) > 0:
                    latest = financial_result["financial"].iloc[0]
                    collected_data["financial_latest"] = latest.to_dict()

        collected_data["success"] = True
        print(f"[Collector] {symbol} 数据采集完成")

    except Exception as e:
        collected_data["success"] = False
        collected_data["error"] = str(e)
        print(f"[Collector] {symbol} 数据采集失败: {e}")

    return collected_data


if __name__ == "__main__":
    test_symbol = "600168"

    import asyncio

    print("=" * 50)
    print(f"测试采集 {test_symbol} 的数据")
    print("=" * 50)

    result = asyncio.run(collect_a_share_data(test_symbol))

    if result.success:
        print("\n✅ 数据采集成功！")
        print(f"basic: {result.basic}")
        print(f"financial: {result.financial}")
        print(
            f"news sentiment distribution: {sum(1 for n in result.news if n.sentiment == 'positive')}/{len(result.news)} positive"
        )
    else:
        print(f"\n❌ 数据采集失败: {result.error}")


# ==================== 港股和美股采集函数 ====================

import yfinance as yf


def process_yfinance_basic(info: dict, market: str) -> StockBasicInfo:
    """处理yFinance基本信息（港股/美股）"""
    basic = StockBasicInfo()

    if not info:
        basic.market = market
        basic.currency = "HKD" if market == "HK" else "USD"
        return basic

    basic.symbol = info.get("symbol", "")
    basic.name = (
        info.get("longName") or info.get("shortName") or info.get("displayName", "")
    )
    basic.market = market
    basic.current_price = float(
        info.get("currentPrice", info.get("regularPrice", 0)) or 0
    )

    market_cap = info.get("marketCap", 0) or 0
    basic.market_cap = float(market_cap) if market_cap else 0

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

    dividend = info.get("dividendYield", 0)
    if isinstance(dividend, dict):
        dividend = dividend.get("raw", dividend)
    basic.dividend_yield = float(dividend) if dividend else None

    basic.week_52_high = info.get("fiftyTwoWeekHigh")
    basic.week_52_low = info.get("fiftyTwoWeekLow")

    beta = info.get("beta")
    if isinstance(beta, dict):
        beta = beta.get("raw", beta)
    basic.beta = float(beta) if beta else None

    basic.volume = int(info.get("volume", 0) or 0)
    basic.avg_volume = int(info.get("averageVolume", 0) or 0)

    basic.currency = info.get("currency", "HKD" if market == "HK" else "USD")
    basic.exchange = info.get("exchange", "")

    basic.industry = info.get("industry", "")
    basic.sector = info.get("sector", "")

    basic.listing_date = info.get("firstTradeDate", "")

    basic.website = info.get("website", "")

    return basic


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


async def collect_hk_stock_data(symbol: str) -> StockAnalysisResult:
    """采集港股数据"""
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

        hist = ticker.history(period="2y", interval="1d")
        result.kline = process_yfinance_kline(hist)
        print(f"[yFinance] 获取到 {len(result.kline)} 条K线数据")

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
    """采集美股数据"""
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

        hist = ticker.history(period="2y", interval="1d")
        result.kline = process_yfinance_kline(hist)
        print(f"[yFinance] 获取到 {len(result.kline)} 条K线数据")

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
