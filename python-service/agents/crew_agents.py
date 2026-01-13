"""
CrewAI多Agent分析模块
实现6大专业角色Agent和综合分析Agent
"""

from crewai import Agent, Task, Crew, Process

try:
    from langchain_openai import ChatOpenAI
except ImportError:
    ChatOpenAI = None
from openai import OpenAI
import os
from dotenv import load_dotenv
import asyncio

load_dotenv()


# DeepSeek LLM配置
def get_deepseek_llm(temperature: float = 0.7):
    """获取DeepSeek LLM实例"""
    from langchain_openai import ChatOpenAI

    return ChatOpenAI(
        model="deepseek-chat",
        openai_api_key=os.getenv("DEEPSEEK_API_KEY"),
        openai_api_base="https://api.deepseek.com/v1",
        temperature=temperature,
    )


# 创建各专业Agent
value_investor = Agent(
    role="Value Investor",
    goal="Analyze stock valuation and identify undervalued opportunities",
    backstory="""You are an expert value investor following Warren Buffett's philosophy. 
    You look for intrinsic value, safety margin, and quality companies 
    trading below their intrinsic value. You analyze PE ratios, PB ratios, 
    ROE trends, dividend history, and cash flow quality.""",
    verbose=True,
    llm=get_deepseek_llm(0.5),
    allow_delegation=False,
)

technical_analyst = Agent(
    role="Technical Analyst",
    goal="Analyze price patterns and technical indicators",
    backstory="""You have 20 years of experience in technical analysis. 
    You excel at reading charts, identifying trends, and spotting 
    potential reversals. You analyze MACD, RSI, KDJ, BOLL indicators, 
    moving averages, and volume patterns.""",
    verbose=True,
    llm=get_deepseek_llm(0.3),
    allow_delegation=False,
)

growth_analyst = Agent(
    role="Growth Stock Analyst",
    goal="Identify high-growth companies with strong momentum",
    backstory="""You specialize in finding next big winners. You focus 
    on revenue growth, profit growth, market expansion, and competitive advantages. 
    You look for companies in high-growth industries with sustainable growth drivers.""",
    verbose=True,
    llm=get_deepseek_llm(0.6),
    allow_delegation=False,
)

fundamental_analyst = Agent(
    role="Fundamental Analyst",
    goal="Evaluate company fundamentals and business quality",
    backstory="""You analyze business models, competitive advantages, 
    management quality, and industry positioning. You look for companies 
    with durable moats, strong governance, and sustainable business models.""",
    verbose=True,
    llm=get_deepseek_llm(0.5),
    allow_delegation=False,
)

risk_analyst = Agent(
    role="Risk Analyst",
    goal="Identify and assess all potential risks",
    backstory="""You are a professional risk manager. You systematically 
    evaluate financial risks, operational risks, market risks, and regulatory risks. 
    You provide risk assessments and mitigation suggestions.""",
    verbose=True,
    llm=get_deepseek_llm(0.4),
    allow_delegation=False,
)

macro_analyst = Agent(
    role="Macro Economist",
    goal="Analyze macroeconomic factors and policy impacts",
    backstory="""You have a PhD in economics and 15 years of experience 
    analyzing how macro factors affect individual stocks. You consider monetary policy, 
    industry regulations, economic cycles, and exchange rate impacts.""",
    verbose=True,
    llm=get_deepseek_llm(0.5),
    allow_delegation=False,
)

synthesizer = Agent(
    role="Chief Investment Analyst",
    goal="Synthesize all analyses into actionable investment recommendations",
    backstory="""You are the chief investment strategist at a top-tier firm. 
    You weigh inputs from all specialists and make clear, actionable recommendations. 
    You calculate overall scores and provide buy/sell/hold recommendations with confidence levels.""",
    verbose=True,
    llm=get_deepseek_llm(0.3),
    allow_delegation=False,
)


def create_analysis_tasks(symbol: str, stock_data: dict):
    """
    创建分析任务链

    Args:
        symbol: 股票代码
        stock_data: 采集到的股票数据

    Returns:
        任务列表
    """
    # 准备数据摘要
    data_summary = format_data_summary(stock_data)

    # 价值分析任务
    value_task = Task(
        description=f"""Analyze {symbol} from a value investing perspective.
        
        Stock Data:
        {data_summary}
        
        Your analysis should include:
        1. Valuation assessment (PE, PB, PS ratios)
        2. Safety margin analysis (intrinsic value vs current price)
        3. Dividend yield and payout history
        4. ROE and ROIC trends
        5. Cash flow quality assessment
        
        Provide:
        - Detailed analysis (300-500 words)
        - Score from 0-100 (higher = better)
        - 3-5 key bullet points""",
        expected_output="Value analysis with score and key insights",
        agent=value_investor,
    )

    # 技术分析任务
    technical_task = Task(
        description=f"""Analyze {symbol} technical indicators and price patterns.
        
        Stock Data:
        {data_summary}
        
        K-line data (recent 100 days):
        {format_kline_summary(stock_data.get("kline", []))}
        
        Your analysis should include:
        1. Trend analysis (up/down/sideways)
        2. MACD analysis (golden cross/death cross)
        3. RSI indicator status
        4. KDJ signals
        5. Bollinger Band position
        6. Moving average supports/resistances
        7. Volume analysis
        
        Provide:
        - Detailed analysis (300-500 words)
        - Score from 0-100 (higher = better)
        - 3-5 key bullet points""",
        expected_output="Technical analysis with score and key insights",
        agent=technical_analyst,
    )

    # 成长分析任务
    growth_task = Task(
        description=f"""Analyze {symbol} growth potential.
        
        Stock Data:
        {data_summary}
        
        Financial history:
        {format_financial_summary(stock_data.get("financial", {}))}
        
        Your analysis should include:
        1. Revenue growth rate (CAGR)
        2. Net profit growth rate
        3. Market share trends
        4. Industry growth comparison
        5. New products/services expansion
        
        Provide:
        - Detailed analysis (300-500 words)
        - Score from 0-100 (higher = better)
        - 3-5 key bullet points""",
        expected_output="Growth analysis with score and key insights",
        agent=growth_analyst,
    )

    # 基本面分析任务
    fundamental_task = Task(
        description=f"""Analyze {symbol} fundamentals.
        
        Stock Data:
        {data_summary}
        
        Your analysis should include:
        1. Business model clarity
        2. Competitive moat analysis
        3. Management quality assessment
        4. Industry position and ranking
        5. Governance structure
        
        Provide:
        - Detailed analysis (300-500 words)
        - Score from 0-100 (higher = better)
        - 3-5 key bullet points""",
        expected_output="Fundamental analysis with score and key insights",
        agent=fundamental_analyst,
    )

    # 风险分析任务
    risk_task = Task(
        description=f"""Identify all risks for {symbol}.
        
        Stock Data:
        {data_summary}
        
        Your analysis should include:
        1. Financial risks (debt ratio, liquidity)
        2. Industry risks (policy, regulation, competition)
        3. Operational risks (customer concentration, supplier dependence)
        4. Market risks (volatility, liquidity)
        
        For each risk, provide:
        - Risk level (Low/Medium/High)
        - Potential impact
        - Mitigation suggestions
        
        Provide:
        - Detailed analysis (300-500 words)
        - Score from 0-100 (higher = lower risk)
        - 3-5 key risk points""",
        expected_output="Risk analysis with score and key risk points",
        agent=risk_analyst,
    )

    # 宏观分析任务
    macro_task = Task(
        description=f"""Analyze macroeconomic impact on {symbol}.
        
        Stock Data:
        {data_summary}
        
        Your analysis should include:
        1. Monetary policy impact
        2. Industry-specific regulations
        3. Economic cycle position
        4. Exchange rate impact (for export/import)
        5. Inflation/interest rate environment
        
        Provide:
        - Detailed analysis (300-500 words)
        - Score from 0-100 (higher = better)
        - 3-5 key bullet points""",
        expected_output="Macro analysis with score and key insights",
        agent=macro_analyst,
    )

    # 综合分析任务
    synthesis_task = Task(
        description=f"""Synthesize all analyses for {symbol} into a comprehensive investment recommendation.
        
        You will receive analyses from 6 experts:
        1. Value Investor (weight: 25%)
        2. Technical Analyst (weight: 15%)
        3. Growth Analyst (weight: 20%)
        4. Fundamental Analyst (weight: 15%)
        5. Risk Analyst (weight: 15%)
        6. Macro Economist (weight: 10%)
        
        Calculate the weighted overall score (0-100).
        
        Determine recommendation based on score:
        - 81-100: Strong Buy
        - 76-80: Buy
        - 61-75: Hold
        - 51-60: Wait and See
        - 0-50: Sell
        
        Provide:
        1. Overall score (0-100)
        2. Recommendation (strong_buy/buy/hold/wait/sell)
        3. Confidence level (0-100)
        4. Summary paragraph (150-200 words)
        5. Top 3 risks
        6. Top 3 opportunities
        
        Format as JSON""",
        expected_output="JSON with overallScore, recommendation, confidence, summary, risks, opportunities",
        agent=synthesizer,
        context=[
            value_task,
            technical_task,
            growth_task,
            fundamental_task,
            risk_task,
            macro_task,
        ],
    )

    return [
        value_task,
        technical_task,
        growth_task,
        fundamental_task,
        risk_task,
        macro_task,
        synthesis_task,
    ]


def format_data_summary(stock_data: dict) -> str:
    """格式化数据摘要"""
    basic = stock_data.get("basic", {})
    financial = stock_data.get("financial", {})

    summary = f"""Stock Basic Info:
    - Symbol: {basic.get("symbol", "N/A")}
    - Name: {basic.get("name", "N/A")}
    - Current Price: {basic.get("currentPrice", 0)}
    - Market Cap: {basic.get("marketCap", 0)}
    - P/E Ratio: {basic.get("peRatio", "N/A")}
    - P/B Ratio: {basic.get("pbRatio", "N/A")}
    - Dividend Yield: {basic.get("dividendYield", 0)}%
    
    Financial Data:
    - Revenue: {financial.get("revenue", "N/A")}
    - Net Profit: {financial.get("netProfit", "N/A")}
    - ROE: {financial.get("roe", "N/A")}%
    - Debt Ratio: {financial.get("debtRatio", "N/A")}%
    """
    return summary


def format_kline_summary(kline: list) -> str:
    """格式化K线摘要"""
    if not kline:
        return "No K-line data available"

    recent = kline[-10:] if len(kline) >= 10 else kline
    summary = f"""Recent 10 days price data:
    {
        format(
            "- Day {}: Open: {}, High: {}, Low: {}, Close: {}".format(*row[1:5])
            for i, row in enumerate(recent)
        )
    }
    """
    return summary


def format_financial_summary(financial: dict) -> str:
    """格式化财务摘要"""
    history = financial.get("history", {})
    return f"""Financial History:
    - Revenue (recent): {", ".join(map(str, history.get("revenue", [])[-5:]))}
    - Net Profit (recent): {", ".join(map(str, history.get("netProfit", [])[-5:]))}
    - ROE (recent): {", ".join(map(str, history.get("roe", [])[-5:]))}
    """


async def run_crew_analysis(symbol: str, stock_data: dict) -> dict:
    """
    运行CrewAI多Agent分析

    Args:
        symbol: 股票代码
        stock_data: 采集到的股票数据

    Returns:
        分析结果字典
    """
    try:
        print(f"[CrewAI] 开始多Agent分析: {symbol}")

        tasks = create_analysis_tasks(symbol, stock_data)

        crew = Crew(
            agents=[
                value_investor,
                technical_analyst,
                growth_analyst,
                fundamental_analyst,
                risk_analyst,
                macro_analyst,
                synthesizer,
            ],
            tasks=tasks,
            process=Process.sequential,
            verbose=True,
            memory=True,
        )

        result = crew.kickoff()

        # 解析综合分析结果
        analysis_data = parse_crew_result(result)

        print(f"[CrewAI] 分析完成")
        return analysis_data

    except Exception as e:
        print(f"[CrewAI] 分析失败: {e}")
        raise


def parse_crew_result(result) -> dict:
    """解析CrewAI结果"""
    try:
        # 从synthesizer的输出中提取JSON
        output = result.tasks_output[-1] if result.tasks_output else {}

        # 如果输出是字符串，尝试解析JSON
        if isinstance(output, str):
            import json
            import re

            # 尝试提取JSON部分
            json_match = re.search(r"\{[\s\S]*\}", output)
            if json_match:
                analysis = json.loads(json_match.group())
            else:
                # 如果找不到JSON，使用解析逻辑
                analysis = extract_analysis_from_text(output)
        else:
            analysis = output if isinstance(output, dict) else {}

        return analysis

    except Exception as e:
        print(f"解析Crew结果失败: {e}")
        # 返回默认结构
        return {
            "overallScore": 60.0,
            "recommendation": "hold",
            "confidence": 50.0,
            "summary": "分析完成，但结果解析失败",
            "roleAnalysis": [],
            "risks": ["结果解析错误"],
            "opportunities": ["请重试分析"],
        }


def extract_analysis_from_text(text: str) -> dict:
    """从文本中提取分析信息（备用解析方法）"""
    import re

    # 提取评分
    score_match = re.search(r"overall.?score[：:\s]*([\d.]+)", text, re.IGNORECASE)
    overall_score = float(score_match.group(1)) if score_match else 60.0

    # 提取推荐
    rec_match = re.search(
        r"(?:recommendation|建议)[：:\s]*([a-z_]+)", text, re.IGNORECASE
    )
    rec_map = {
        "strong_buy": "strong_buy",
        "buy": "buy",
        "hold": "hold",
        "wait": "wait",
        "sell": "sell",
    }
    recommendation = (
        rec_map.get(rec_match.group(1).lower(), "hold") if rec_match else "hold"
    )

    # 提取置信度
    confidence_match = re.search(r"confidence[：:\s]*([\d.]+)", text, re.IGNORECASE)
    confidence = float(confidence_match.group(1)) if confidence_match else 70.0

    # 提取风险
    risks = []
    risk_sections = re.finditer(
        r"(?:risk|风险)[：:\s]*([^.\n]*(?=\n|$))", text, re.IGNORECASE
    )
    for match in risk_sections:
        risk_text = match.group(1).strip()
        if risk_text:
            risks.append(risk_text[:100])  # 限制长度

    # 提取机会
    opportunities = []
    opp_sections = re.finditer(
        r"(?:opportunity|机会)[：:\s]*([^.\n]*(?=\n|$))", text, re.IGNORECASE
    )
    for match in opp_sections:
        opp_text = match.group(1).strip()
        if opp_text:
            opportunities.append(opp_text[:100])

    return {
        "overallScore": overall_score,
        "recommendation": recommendation,
        "confidence": confidence,
        "summary": text[:500],  # 限制摘要长度
        "risks": risks[:5] if risks else ["数据不足，无法识别风险"],
        "opportunities": opportunities[:5]
        if opportunities
        else ["数据不足，无法识别机会"],
    }
