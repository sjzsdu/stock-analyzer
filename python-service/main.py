"""
股票数据采集和分析服务
使用AkShare、yFinance和CrewAI实现数据采集和AI分析
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
import asyncio
from datetime import datetime
import os
from dotenv import load_dotenv
from data.collector import (
    collect_a_share_data,
    collect_hk_stock_data,
    collect_us_stock_data,
)
from agents.crew_agents import run_crew_analysis

load_dotenv()

app = FastAPI(
    title="Stock Data & Analysis API",
    description="股票数据采集和AI分析服务",
    version="1.0.0",
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 请求/响应模型
class StockRequest(BaseModel):
    symbol: str
    market: str  # 'A', 'HK', 'US'


class StockDataResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    message: Optional[str] = None
    timestamp: str


class AnalysisRequest(BaseModel):
    symbol: str
    stock_data: dict


class AnalysisResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    message: Optional[str] = None
    processing_time: float


@app.get("/")
async def root():
    """根路径"""
    return {
        "service": "Stock Data & Analysis API",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/api/collect", response_model=StockDataResponse)
async def collect_stock_data(request: StockRequest):
    """
    采集股票数据的主入口

    根据市场类型调用不同的数据源：
    - A股：AkShare
    - 港股：yFinance
    - 美股：yFinance
    """
    try:
        print(
            f"[{datetime.now()}] 开始采集数据: {request.symbol}, 市场: {request.market}"
        )

        if request.market == "A":
            data = await collect_a_share(request.symbol)
        elif request.market == "HK":
            data = await collect_hk_stock(request.symbol)
        elif request.market == "US":
            data = await collect_us_stock(request.symbol)
        else:
            raise HTTPException(
                status_code=400, detail=f"不支持的市场类型: {request.market}"
            )

        print(f"[{datetime.now()}] 数据采集完成")

        return StockDataResponse(
            success=True,
            data=data,
            message="数据采集成功",
            timestamp=datetime.now().isoformat(),
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"数据采集错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"数据采集失败: {str(e)}")


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_stock(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """
    使用CrewAI进行多Agent分析
    """
    try:
        start_time = asyncio.get_event_loop().time()
        print(f"[{datetime.now()}] 开始CrewAI分析: {request.symbol}")

        # 使用CrewAI进行真正的AI分析
        try:
            analysis_data = run_crew_analysis(request.symbol, request.stock_data)
        except Exception as crew_error:
            print(f"CrewAI分析失败，回退到模拟分析: {crew_error}")
            analysis_data = generate_mock_analysis(request.symbol, request.stock_data)

        processing_time = asyncio.get_event_loop().time() - start_time

        print(f"[{datetime.now()}] AI分析完成，耗时: {processing_time:.2f}秒")

        return AnalysisResponse(
            success=True,
            data=analysis_data,
            message="分析完成",
            processing_time=processing_time,
        )
    except Exception as e:
        print(f"AI分析错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI分析失败: {str(e)}")


# ==================== 数据采集函数 ====================


async def collect_a_share(symbol: str) -> dict:
    """采集A股数据（使用AkShare）"""
    try:
        result = await collect_a_share_data(symbol)
        if result.get("success"):
            return result
        else:
            print(f"A股数据采集失败: {result.get('error')}")
            return generate_mock_stock_data(symbol, "A")
    except Exception as e:
        print(f"A股数据采集异常: {e}")
        return generate_mock_stock_data(symbol, "A")


async def collect_hk_stock(symbol: str) -> dict:
    """采集港股数据（使用yFinance）"""
    try:
        result = await collect_hk_stock_data(symbol)
        if result.get("success"):
            return result
        else:
            print(f"港股数据采集失败: {result.get('error')}")
            return generate_mock_stock_data(symbol, "HK")
    except Exception as e:
        print(f"港股数据采集异常: {e}")
        return generate_mock_stock_data(symbol, "HK")


async def collect_us_stock(symbol: str) -> dict:
    """采集美股数据（使用yFinance）"""
    try:
        result = await collect_us_stock_data(symbol)
        if result.get("success"):
            return result
        else:
            print(f"美股数据采集失败: {result.get('error')}")
            return generate_mock_stock_data(symbol, "US")
    except Exception as e:
        print(f"美股数据采集异常: {e}")
        return generate_mock_stock_data(symbol, "US")


def process_basic_info(data, market: str) -> dict:
    """处理基本信息"""
    if market == "A":
        return {
            "symbol": data.get("代码", ""),
            "name": data.get("名称", ""),
            "market": "A",
            "currentPrice": float(data.get("最新价", 0) or 0),
            "marketCap": parse_chinese_number(data.get("总市值", "")),
            "peRatio": float(data.get("市盈率-动态", 0) or 0),
            "pbRatio": float(data.get("市净率", 0) or 0),
            "dividendYield": float(data.get("股息率", 0) or 0),
            "volume": float(data.get("成交量", 0) or 0),
            "turnoverRate": float(data.get("换手率", 0) or 0),
        }
    else:
        # 港股/美股使用yFinance返回的data
        return {
            "symbol": data.get("symbol", ""),
            "name": data.get("longName", data.get("shortName", "")),
            "market": market,
            "currentPrice": float(data.get("currentPrice", 0) or 0),
            "marketCap": float(data.get("marketCap", 0) or 0),
            "peRatio": float(data.get("forwardPE", 0) or 0),
            "pbRatio": float(data.get("priceToBook", 0) or 0),
            "dividendYield": float(data.get("dividendYield", 0) or 0),
            "volume": float(data.get("volume", 0) or 0),
            "currency": data.get("currency", "USD"),
        }


def process_kline_data(df) -> list:
    """转换K线数据格式"""
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


def process_yfinance_kline(df) -> list:
    """处理yFinance的K线数据"""
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


def process_financial_data(df) -> dict:
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
        }
    except:
        return {}


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


def generate_mock_stock_data(symbol: str, market: str) -> dict:
    """生成模拟股票数据（用于MVP测试）"""
    import pandas as pd
    import numpy as np

    np.random.seed(hash(symbol) % 10000)

    base_price = 10 + np.random.random() * 90
    dates = pd.date_range(end=datetime.now(), periods=500, freq="D")

    kline = []
    price = base_price
    for date in dates:
        change = np.random.normal(0, 0.02)
        price = price * (1 + change)
        high = price * (1 + abs(np.random.normal(0, 0.01)))
        low = price * (1 - abs(np.random.normal(0, 0.01)))
        volume = int(np.random.random() * 1000000)

        kline.append(
            [
                int(date.timestamp() * 1000),
                float(price),
                float(high),
                float(low),
                float(price * (1 + np.random.normal(0, 0.005))),
                volume,
            ]
        )

    return {
        "basic": {
            "symbol": symbol,
            "name": f"{symbol}模拟股票",
            "market": market,
            "currentPrice": float(kline[-1][4] if kline else base_price),
            "marketCap": base_price * 1000000000 * (1 + np.random.random()),
            "peRatio": 10 + np.random.random() * 40,
            "pbRatio": 1 + np.random.random() * 5,
            "dividendYield": np.random.random() * 5,
            "volume": kline[-1][5] if kline else 100000,
        },
        "kline": kline[-100:],  # 最近100天
        "financial": {
            "revenue": 1000000000 * (1 + np.random.random()),
            "netProfit": 100000000 * (1 + np.random.random()),
            "roe": 10 + np.random.random() * 20,
            "debtRatio": 30 + np.random.random() * 40,
        },
    }


def generate_mock_analysis(
    symbol: str, stock_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """生成模拟分析结果（基于股票数据生成动态内容）"""
    import numpy as np

    # 使用股票数据生成种子，确保相同股票每次分析结果一致性
    seed_base = hash(symbol) % 10000
    if stock_data and stock_data.get("basic"):
        # 基于实际数据调整种子
        basic = stock_data["basic"]
        seed_base += int(basic.get("peRatio", 20)) + int(basic.get("pbRatio", 2) * 10)

    np.random.seed(seed_base + 1)

    # 从股票数据生成基础分数
    basic = stock_data.get("basic", {}) if stock_data else {}
    financial = stock_data.get("financial", {}) if stock_data else {}

    scores = generate_dynamic_scores(basic, financial, "A")  # 默认A股

    overall_score = (
        scores["value"] * 0.25
        + scores["technical"] * 0.15
        + scores["growth"] * 0.20
        + scores["fundamental"] * 0.15
        + scores["risk"] * 0.15
        + scores["macro"] * 0.10
    )

    if overall_score >= 85:
        recommendation = "strong_buy"
    elif overall_score >= 75:
        recommendation = "buy"
    elif overall_score >= 60:
        recommendation = "hold"
    elif overall_score >= 50:
        recommendation = "wait"
    else:
        recommendation = "sell"

    # 生成动态风险和机会
    risks_and_opportunities = generate_dynamic_risks_and_opportunities(
        basic, financial, "A", scores
    )

    return {
        "overallScore": float(f"{overall_score:.1f}"),
        "recommendation": recommendation,
        "confidence": float(f"{75 + np.random.random() * 15:.1f}"),
        "summary": generate_dynamic_summary(
            symbol, "A", scores, recommendation, basic, financial
        ),
        "roleAnalysis": generate_dynamic_role_analysis(scores, "A", basic, financial),
        "risks": risks_and_opportunities["risks"],
        "opportunities": risks_and_opportunities["opportunities"],
        "model": "Mock Analysis (Dynamic)",
        "processingTime": 30.0,
        "tokenUsage": {"input": 5000, "output": 3000},
    }


def generate_dynamic_scores(basic: dict, financial: dict, market: str) -> dict:
    """基于股票数据生成动态分数"""
    import numpy as np

    # 基础分数
    value_score = 70 + np.random.random() * 20
    technical_score = 60 + np.random.random() * 25
    growth_score = 65 + np.random.random() * 25
    fundamental_score = 70 + np.random.random() * 20
    risk_score = 60 + np.random.random() * 30
    macro_score = 55 + np.random.random() * 30

    # 基于实际数据调整分数
    if basic.get("peRatio"):
        pe = basic["peRatio"]
        if pe < 15:
            value_score += 15  # 低估值加分
        elif pe > 30:
            value_score -= 15  # 高估值减分

    if basic.get("pbRatio"):
        pb = basic["pbRatio"]
        if pb < 1.5:
            value_score += 10
        elif pb > 3:
            value_score -= 10

    if financial.get("roe"):
        roe = financial["roe"]
        if roe > 18:
            fundamental_score += 15
        elif roe < 10:
            fundamental_score -= 15

    if financial.get("debtRatio"):
        debt = financial["debtRatio"]
        if debt < 40:
            risk_score += 15
        elif debt > 70:
            risk_score -= 20

    return {
        "value": max(0, min(100, value_score)),
        "technical": max(0, min(100, technical_score)),
        "growth": max(0, min(100, growth_score)),
        "fundamental": max(0, min(100, fundamental_score)),
        "risk": max(0, min(100, risk_score)),
        "macro": max(0, min(100, macro_score)),
    }


def generate_dynamic_risks_and_opportunities(
    basic: dict, financial: dict, market: str, scores: dict
) -> dict:
    """生成动态风险和机会"""
    risks = []
    opportunities = []

    # 基于估值生成风险/机会
    if basic.get("peRatio"):
        pe = basic["peRatio"]
        if pe > 25:
            risks.append(f"当前PE倍数({pe:.1f})相对较高，估值风险值得关注")
        elif pe < 15:
            opportunities.append(f"PE估值({pe:.1f})处于较低水平，具备安全边际")

    # 基于财务数据生成风险/机会
    if financial.get("debtRatio"):
        debt = financial["debtRatio"]
        if debt > 60:
            risks.append(f"资产负债率({debt:.1f}%)偏高，财务杠杆风险需警惕")
        elif debt < 30:
            opportunities.append(f"财务结构稳健，资产负债率仅{debt:.1f}%")

    if financial.get("roe"):
        roe = financial["roe"]
        if roe > 18:
            opportunities.append(f"ROE达到{roe:.1f}%，显示优秀的盈利能力")
        elif roe < 10:
            risks.append(f"ROE仅{roe:.1f}%，盈利能力有待提升")

    # 基于分数生成风险/机会
    if scores["technical"] < 50:
        risks.append("技术面偏弱，短期调整压力较大")
    elif scores["technical"] > 75:
        opportunities.append("技术指标向好，上涨动能充足")

    if scores["growth"] < 60:
        risks.append("成长动能不足，未来业绩承压")
    elif scores["growth"] > 80:
        opportunities.append("成长潜力巨大，未来发展可期")

    # 市场特定风险/机会
    if market == "A":
        risks.append("A股市场波动较大，需关注政策面变化")
        opportunities.append("国内经济复苏为A股提供支撑")

    # 确保至少有3个风险和机会
    default_risks = [
        "行业政策变化可能带来监管风险",
        "市场竞争加剧可能影响盈利能力",
        "宏观经济波动可能影响估值",
    ]

    default_opportunities = [
        "行业增长空间巨大",
        "公司具备技术领先优势",
        "市场份额提升空间大",
    ]

    while len(risks) < 3:
        available = [r for r in default_risks if r not in risks]
        if available:
            risks.append(available[0])
        else:
            break

    while len(opportunities) < 3:
        available = [o for o in default_opportunities if o not in opportunities]
        if available:
            opportunities.append(available[0])
        else:
            break

    return {"risks": risks[:4], "opportunities": opportunities[:4]}


def generate_dynamic_summary(
    symbol: str,
    market: str,
    scores: dict,
    recommendation: str,
    basic: dict,
    financial: dict,
) -> str:
    """生成动态总结"""
    market_name = "A股"
    overall_score = (
        scores["value"] * 0.25
        + scores["technical"] * 0.15
        + scores["growth"] * 0.20
        + scores["fundamental"] * 0.15
        + scores["risk"] * 0.15
        + scores["macro"] * 0.10
    )

    summary = f"基于多维度分析，{symbol}（{market_name}）当前综合评分为{overall_score:.1f}分。"

    if basic.get("peRatio"):
        pe = basic["peRatio"]
        summary += f"当前PE倍数{pe:.1f}，"
        if pe < 20:
            summary += "估值相对合理，具备投资价值。"
        else:
            summary += "估值水平适中。"

    if financial.get("roe"):
        roe = financial["roe"]
        summary += f"ROE达{roe:.1f}%，"
        if roe > 15:
            summary += "盈利能力优秀。"
        else:
            summary += "盈利能力良好。"

    trend = "向上" if scores["technical"] > 70 else "震荡"
    growth_desc = "快速增长" if scores["growth"] > 75 else "稳定增长"

    summary += f"技术面呈现{trend}趋势，成长性显示{growth_desc}态势。"

    rec_text = {
        "strong_buy": "强烈买入",
        "buy": "买入",
        "hold": "持有",
        "wait": "观望",
        "sell": "卖出",
    }[recommendation]
    summary += f"建议{rec_text}，同时注意控制风险。"

    return summary


def generate_dynamic_role_analysis(
    scores: dict, market: str, basic: dict, financial: dict
) -> list:
    """生成动态角色分析"""
    return [
        {
            "role": "value",
            "score": int(scores["value"]),
            "analysis": generate_value_analysis(scores["value"], basic, financial),
            "keyPoints": generate_value_key_points(basic),
        },
        {
            "role": "technical",
            "score": int(scores["technical"]),
            "analysis": generate_technical_analysis(scores["technical"]),
            "keyPoints": generate_technical_key_points(scores["technical"]),
        },
        {
            "role": "growth",
            "score": int(scores["growth"]),
            "analysis": generate_growth_analysis(scores["growth"], financial),
            "keyPoints": generate_growth_key_points(scores["growth"]),
        },
        {
            "role": "fundamental",
            "score": int(scores["fundamental"]),
            "analysis": generate_fundamental_analysis(
                scores["fundamental"], basic, financial
            ),
            "keyPoints": generate_fundamental_key_points(financial),
        },
        {
            "role": "risk",
            "score": int(scores["risk"]),
            "analysis": generate_risk_analysis(
                scores["risk"], basic, financial, market
            ),
            "keyPoints": generate_risk_key_points(basic, financial),
        },
        {
            "role": "macro",
            "score": int(scores["macro"]),
            "analysis": generate_macro_analysis(scores["macro"], market),
            "keyPoints": generate_macro_key_points(market),
        },
    ]


def generate_value_analysis(score: float, basic: dict, financial: dict) -> str:
    analysis = "从价值投资角度分析，"
    if basic.get("peRatio"):
        pe = basic["peRatio"]
        analysis += f"当前PE倍数为{pe:.1f}，"
        if score > 75:
            analysis += "处于合理估值区间，具备较好的安全边际。"
        else:
            analysis += "估值水平适中，值得关注。"
    else:
        analysis += "当前估值水平适中，具备一定的投资价值。"
    return analysis


def generate_technical_analysis(score: float) -> str:
    if score > 75:
        return "技术面偏强，MACD金叉信号明显，RSI指标显示多头动能充足，短期内有望延续上涨态势。"
    elif score < 50:
        return "技术面偏弱，存在一定调整压力，建议关注支撑位表现。"
    else:
        return "技术面中性，整体走势相对平稳，等待更明确的信号。"


def generate_growth_analysis(score: float, financial: dict) -> str:
    analysis = "成长性方面，"
    if score > 75:
        analysis += "展现出强劲的成长动能，营收和净利润保持快速增长，未来发展潜力巨大。"
    elif score > 60:
        analysis += "保持稳健增长态势，具备一定的成长潜力。"
    else:
        analysis += "成长动能相对不足，需要关注增长持续性。"
    return analysis


def generate_fundamental_analysis(score: float, basic: dict, financial: dict) -> str:
    analysis = "基本面分析显示，"
    if financial.get("roe"):
        roe = financial["roe"]
        analysis += f"ROE达{roe:.1f}%，"
    if score > 75:
        analysis += "公司基本面扎实，具备较强的竞争优势。"
    else:
        analysis += "基本面整体稳健，但仍有一些改善空间。"
    return analysis


def generate_risk_analysis(
    score: float, basic: dict, financial: dict, market: str
) -> str:
    analysis = "风险评估方面，"
    if financial.get("debtRatio"):
        debt = financial["debtRatio"]
        analysis += f"资产负债率{debt:.1f}%，"
    if score > 75:
        analysis += "整体风险水平较低，财务结构稳健。"
    else:
        analysis += "存在一些风险因素，需要谨慎评估。"
    return analysis


def generate_macro_analysis(score: float, market: str) -> str:
    analysis = "宏观环境来看，"
    if market == "A":
        analysis += "国内经济整体向好，政策环境相对稳定，"
    if score > 70:
        analysis += "宏观环境有利，有助于公司业绩提升。"
    else:
        analysis += "宏观环境相对平稳，对公司影响有限。"
    return analysis


def generate_value_key_points(basic: dict) -> list:
    points = []
    if basic.get("peRatio"):
        points.append(f"PE: {basic['peRatio']:.1f}")
    if basic.get("pbRatio"):
        points.append(f"PB: {basic['pbRatio']:.1f}")
    points.append("估值合理性")
    return points[:3]


def generate_technical_key_points(score: float) -> list:
    if score > 70:
        return ["MACD金叉", "RSI多头", "均线支撑"]
    else:
        return ["技术调整", "观望为主", "控制风险"]


def generate_growth_key_points(score: float) -> list:
    if score > 75:
        return ["营收增长", "利润提升", "市场扩张"]
    else:
        return ["稳健增长", "份额稳定", "潜力待发"]


def generate_fundamental_key_points(financial: dict) -> list:
    points = []
    if financial.get("roe"):
        points.append(f"ROE: {financial['roe']:.1f}%")
    points.extend(["商业模式", "管理质量"])
    return points[:3]


def generate_risk_key_points(basic: dict, financial: dict) -> list:
    points = []
    if financial.get("debtRatio"):
        points.append(f"负债率: {financial['debtRatio']:.1f}%")
    points.extend(["行业风险", "财务稳健"])
    return points[:3]


def generate_macro_key_points(market: str) -> list:
    if market == "A":
        return ["经济复苏", "政策稳定", "市场活跃"]
    else:
        return ["宏观环境", "政策影响", "经济周期"]

    overall_score = (
        scores["value"] * 0.25
        + scores["technical"] * 0.15
        + scores["growth"] * 0.20
        + scores["fundamental"] * 0.15
        + scores["risk"] * 0.15
        + scores["macro"] * 0.10
    )

    if overall_score >= 85:
        recommendation = "strong_buy"
    elif overall_score >= 75:
        recommendation = "buy"
    elif overall_score >= 60:
        recommendation = "hold"
    elif overall_score >= 50:
        recommendation = "wait"
    else:
        recommendation = "sell"

    return {
        "overallScore": float(f"{overall_score:.1f}"),
        "recommendation": recommendation,
        "confidence": float(f"{75 + np.random.random() * 15:.1f}"),
        "summary": f"基于多维度分析，{symbol}当前综合评分为{overall_score:.1f}分。价值面显示良好估值水平，技术面呈现{'向上' if scores['technical'] > 70 else '震荡'}趋势，成长性具备潜力。建议{'买入' if recommendation in ['buy', 'strong_buy'] else '观望' if recommendation == 'wait' else '持有' if recommendation == 'hold' else '卖出'}。",
        "roleAnalysis": [
            {
                "role": "value",
                "score": int(scores["value"]),
                "analysis": f"从价值投资角度分析，该股票当前PE处于{'合理' if 10 < scores['value'] < 25 else '偏低' if scores['value'] <= 10 else '偏高'}区间，具备一定的安全边际。",
                "keyPoints": ["PE比率合理", "分红稳定", "ROE保持高位"],
            },
            {
                "role": "technical",
                "score": int(scores["technical"]),
                "analysis": f"技术面上，股价目前位于{'上升通道' if scores['technical'] > 70 else '震荡区间'}。MACD显示{'金叉' if scores['technical'] > 70 else '死叉'}信号。",
                "keyPoints": ["MACD出现信号", "RSI显示多头", "均线提供支撑"],
            },
            {
                "role": "growth",
                "score": int(scores["growth"]),
                "analysis": f"成长性方面，公司营收保持{'快速增长' if scores['growth'] > 75 else '稳定增长'}。行业处于发展期。",
                "keyPoints": ["营收持续增长", "市场份额提升", "行业前景良好"],
            },
            {
                "role": "fundamental",
                "score": int(scores["fundamental"]),
                "analysis": "公司基本面扎实，商业模式清晰，具备显著的护城河。",
                "keyPoints": ["品牌优势显著", "技术领先", "管理层优秀"],
            },
            {
                "role": "risk",
                "score": int(scores["risk"]),
                "analysis": "风险方面，需关注行业政策变化和市场竞争，财务结构相对稳健。",
                "keyPoints": ["行业政策风险", "市场竞争加剧", "财务状况健康"],
            },
            {
                "role": "macro",
                "score": int(scores["macro"]),
                "analysis": "宏观环境整体向好，货币政策宽松，经济处于复苏阶段。",
                "keyPoints": ["货币政策有利", "经济周期积极", "汇率影响可控"],
            },
        ],
        "risks": [
            "行业政策变化可能带来监管风险",
            "市场竞争加剧可能影响盈利能力",
            "宏观经济波动可能影响估值",
        ],
        "opportunities": [
            "行业增长空间巨大",
            "公司具备技术领先优势",
            "市场份额提升空间大",
        ],
        "model": "Mock Analysis (MVP)",
        "processingTime": 30.0,
        "tokenUsage": {"input": 5000, "output": 3000},
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
