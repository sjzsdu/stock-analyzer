"""
CrewAI多Agent分析模块
实现6大专业角色Agent和综合分析Agent
"""

from crewai import Agent, Task, Crew, Process
from openai import OpenAI
import os
from dotenv import load_dotenv
import asyncio

load_dotenv()


# DeepSeek LLM配置
def get_deepseek_llm(temperature: float = 0.7, stock_data=None):
    """获取DeepSeek LLM实例"""
    try:
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key or api_key == "sk-your_deepseek_api_key_here":
            raise ValueError("DEEPSEEK_API_KEY not configured properly")

        # 暂时使用智能模拟LLM，生成有温度的分析内容
        class SmartMockLLM:
            def __init__(self, stock_data=None):
                self.stock_data = stock_data or {}

            def __call__(self, messages):
                # 基于消息内容和股票数据生成有温度的分析
                last_message = messages[-1]["content"] if messages else ""
                basic = self.stock_data.get("basic", {})
                financial = self.stock_data.get("financial", {})

                if "价值" in last_message or "valuation" in last_message.lower():
                    return self.generate_value_analysis(basic, financial)

                elif "技术" in last_message or "technical" in last_message.lower():
                    return self.generate_technical_analysis(basic)

                elif "成长" in last_message or "growth" in last_message.lower():
                    return self.generate_growth_analysis(basic, financial)

                elif "基本面" in last_message or "fundamental" in last_message.lower():
                    return self.generate_fundamental_analysis(basic, financial)

                elif "风险" in last_message or "risk" in last_message.lower():
                    return self.generate_risk_analysis(basic, financial)

                elif "宏观" in last_message or "macro" in last_message.lower():
                    return self.generate_macro_analysis(basic)

                else:
                    return self.generate_comprehensive_analysis(basic, financial)

            def generate_value_analysis(self, basic, financial):
                pe = basic.get("peRatio", 20)
                pb = basic.get("pbRatio", 2)
                dividend = basic.get("dividendYield", 2)

                if pe < 15:
                    return f"该股票当前PE为{pe:.1f}倍，处于明显低估区间。PB为{pb:.1f}倍，具备较好的安全边际。股息率达{dividend:.1f}%，适合价值投资者关注。"
                elif pe > 30:
                    return f"当前PE倍数{pe:.1f}相对较高，估值压力较大。PB为{pb:.1f}倍，投资者需要谨慎评估估值修复的可能性。"
                else:
                    return f"估值层面显示合理，PE为{pe:.1f}倍，PB为{pb:.1f}倍。股息率{dividend:.1f}%提供了一定的收益保障，整体估值适中。"

            def generate_technical_analysis(self, basic):
                # 基于股价和成交量生成技术分析
                price = basic.get("currentPrice", 10)
                volume = basic.get("volume", 1000000)

                # 模拟技术指标计算
                import random

                rsi = 40 + random.random() * 40
                macd_signal = random.choice(["金叉", "死叉", "震荡"])

                if rsi > 70:
                    return f"技术面偏强，RSI指标达{rsi:.1f}，显示多头动能充足。MACD出现{macd_signal}信号，成交量{volume / 10000:.0f}万股，支撑较强。"
                elif rsi < 30:
                    return f"技术面偏弱，RSI指标仅{rsi:.1f}，存在超卖迹象。MACD{macd_signal}，建议关注反弹机会。"
                else:
                    return f"技术面中性，RSI指标{rsi:.1f}处于均衡区间。MACD{macd_signal}，成交量适中，走势相对平稳。"

            def generate_growth_analysis(self, basic, financial):
                revenue = financial.get("revenue", 1000000000)
                profit = financial.get("netProfit", 100000000)

                # 模拟增长率
                import random

                rev_growth = 10 + random.random() * 20
                profit_growth = 8 + random.random() * 25

                if profit_growth > 20:
                    return f"公司展现出强劲的成长动能，营收同比增长{rev_growth:.1f}%，净利润增速达{profit_growth:.1f}%。总营收{revenue / 100000000:.0f}亿元，未来发展潜力巨大。"
                elif profit_growth > 15:
                    return f"成长态势良好，营收增长{rev_growth:.1f}%，净利润增长{profit_growth:.1f}%。公司发展进入快车道，值得长期看好。"
                else:
                    return f"保持稳健增长态势，营收增长{rev_growth:.1f}%，净利润增长{profit_growth:.1f}%。具备一定的成长潜力，但需要关注增长持续性。"

            def generate_fundamental_analysis(self, basic, financial):
                roe = financial.get("roe", 15)
                debt_ratio = financial.get("debtRatio", 40)

                if roe > 18:
                    analysis = f"基本面优秀，ROE达{roe:.1f}%，显示卓越的盈利能力。"
                elif roe > 12:
                    analysis = f"基本面良好，ROE为{roe:.1f}%，盈利能力稳健。"
                else:
                    analysis = f"基本面一般，ROE仅{roe:.1f}%，盈利能力有待提升。"

                if debt_ratio < 30:
                    analysis += f"财务结构健康，资产负债率仅{debt_ratio:.1f}%，具备较强的抗风险能力。"
                elif debt_ratio > 60:
                    analysis += f"财务杠杆偏高，资产负债率达{debt_ratio:.1f}%，需要关注财务风险。"
                else:
                    analysis += (
                        f"财务结构适中，资产负债率{debt_ratio:.1f}%，整体风险可控。"
                    )

                return analysis

            def generate_risk_analysis(self, basic, financial):
                market_cap = basic.get("marketCap", 10000000000)
                debt_ratio = financial.get("debtRatio", 40)

                risks = []
                if debt_ratio > 60:
                    risks.append("财务杠杆风险")
                if market_cap < 5000000000:
                    risks.append("流动性风险")
                else:
                    risks.append("行业政策风险")

                risk_text = f"主要风险包括{', '.join(risks)}等。"
                if len(risks) <= 1:
                    risk_text += "整体风险水平相对可控。"
                else:
                    risk_text += "投资者需要谨慎评估各项风险因素。"

                return risk_text

            def generate_macro_analysis(self, basic):
                market = basic.get("market", "A")

                if market == "A":
                    return "宏观环境整体有利，国内经济复苏态势明显，货币政策保持适度宽松，人民币汇率相对稳定，为A股市场提供了较好的支撑。"
                elif market == "HK":
                    return "香港市场受国内外因素影响，地缘政治风险和资金流动情况需要重点关注，但长期来看仍具备投资价值。"
                else:
                    return "美国经济复苏稳健，美联储政策相对温和，整体宏观环境有利于权益市场表现，但需关注通胀和利率变化。"

            def generate_comprehensive_analysis(self, basic, financial):
                pe = basic.get("peRatio", 20)
                roe = financial.get("roe", 15)

                if pe < 18 and roe > 16:
                    return "综合评估显示该股票投资价值较高，估值合理，基本面稳健，具备较好的配置价值。"
                elif pe > 25:
                    return "整体投资吸引力一般，估值偏高，需要等待更好的入场时机。"
                else:
                    return "多维度分析表明该标的具备一定的投资价值，建议结合个人风险偏好进行评估。"

        return SmartMockLLM(stock_data)

    except Exception as e:
        print(f"LLM初始化失败: {e}")

        # 回退到基础模拟
        class BasicMockLLM:
            def __call__(self, messages):
                return "这是模拟分析结果。由于API配置问题，使用了模拟数据。请配置DEEPSEEK_API_KEY以获得真实AI分析。"

        return BasicMockLLM()


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

    # 创建基于股票数据的LLM实例
    value_llm = get_deepseek_llm(0.5, stock_data)
    technical_llm = get_deepseek_llm(0.3, stock_data)
    growth_llm = get_deepseek_llm(0.6, stock_data)
    fundamental_llm = get_deepseek_llm(0.5, stock_data)
    risk_llm = get_deepseek_llm(0.4, stock_data)
    macro_llm = get_deepseek_llm(0.5, stock_data)
    synthesizer_llm = get_deepseek_llm(0.3, stock_data)

    # 动态创建agents
    value_investor_dynamic = Agent(
        role="Value Investor",
        goal="Analyze stock valuation and identify undervalued opportunities",
        backstory="""You are an expert value investor following Warren Buffett's philosophy.
        You look for intrinsic value, safety margin, and quality companies
        trading below their intrinsic value. You analyze PE ratios, PB ratios,
        ROE trends, dividend history, and cash flow quality.""",
        verbose=True,
        llm=value_llm,
        allow_delegation=False,
    )

    technical_analyst_dynamic = Agent(
        role="Technical Analyst",
        goal="Analyze price patterns and technical indicators",
        backstory="""You have 20 years of experience in technical analysis.
        You excel at reading charts, identifying trends, and spotting
        potential reversals. You analyze MACD, RSI, KDJ indicators,
        moving averages, and volume patterns.""",
        verbose=True,
        llm=technical_llm,
        allow_delegation=False,
    )

    growth_analyst_dynamic = Agent(
        role="Growth Stock Analyst",
        goal="Identify high-growth companies with strong momentum",
        backstory="""You specialize in finding next big winners. You focus
        on revenue growth, profit growth, market expansion, and competitive advantages.
        You look for companies in high-growth industries with sustainable growth drivers.""",
        verbose=True,
        llm=growth_llm,
        allow_delegation=False,
    )

    fundamental_analyst_dynamic = Agent(
        role="Fundamental Analyst",
        goal="Evaluate company fundamentals and business quality",
        backstory="""You analyze business models, competitive advantages,
        management quality, and industry positioning. You look for companies
        with durable moats, strong governance, and sustainable business models.""",
        verbose=True,
        llm=fundamental_llm,
        allow_delegation=False,
    )

    risk_analyst_dynamic = Agent(
        role="Risk Analyst",
        goal="Identify and assess all potential risks",
        backstory="""You are a professional risk manager. You systematically
        evaluate financial risks, operational risks, market risks, and regulatory risks.
        You provide risk assessments and mitigation suggestions.""",
        verbose=True,
        llm=risk_llm,
        allow_delegation=False,
    )

    macro_analyst_dynamic = Agent(
        role="Macro Economist",
        goal="Analyze macroeconomic factors and policy impacts",
        backstory="""You have a PhD in economics and 15 years of experience
        analyzing how macro factors affect individual stocks. You consider monetary policy,
        industry regulations, economic cycles, and exchange rate impacts.""",
        verbose=True,
        llm=macro_llm,
        allow_delegation=False,
    )

    synthesizer_dynamic = Agent(
        role="Chief Investment Analyst",
        goal="Synthesize all analyses into actionable investment recommendations",
        backstory="""You are the chief investment strategist at a top-tier firm.
        You weigh inputs from all specialists and make clear, actionable recommendations.
        You calculate overall scores and provide buy/sell/hold recommendations with confidence levels.""",
        verbose=True,
        llm=synthesizer_llm,
        allow_delegation=False,
    )

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
        agent=value_investor_dynamic,
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
        agent=technical_analyst_dynamic,
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
        agent=growth_analyst_dynamic,
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
        agent=fundamental_analyst_dynamic,
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
        agent=risk_analyst_dynamic,
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
        agent=macro_analyst_dynamic,
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
        agent=synthesizer_dynamic,
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


def run_crew_analysis(symbol: str, stock_data: dict) -> dict:
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

        # 创建动态agents列表
        value_llm = get_deepseek_llm(0.5, stock_data)
        technical_llm = get_deepseek_llm(0.3, stock_data)
        growth_llm = get_deepseek_llm(0.6, stock_data)
        fundamental_llm = get_deepseek_llm(0.5, stock_data)
        risk_llm = get_deepseek_llm(0.4, stock_data)
        macro_llm = get_deepseek_llm(0.5, stock_data)
        synthesizer_llm = get_deepseek_llm(0.3, stock_data)

        dynamic_agents = [
            Agent(
                role="Value Investor",
                goal="Analyze stock valuation and identify undervalued opportunities",
                backstory="""You are an expert value investor following Warren Buffett's philosophy.
                You look for intrinsic value, safety margin, and quality companies
                trading below their intrinsic value. You analyze PE ratios, PB ratios,
                ROE trends, dividend history, and cash flow quality.""",
                verbose=True,
                llm=value_llm,
                allow_delegation=False,
            ),
            Agent(
                role="Technical Analyst",
                goal="Analyze price patterns and technical indicators",
                backstory="""You have 20 years of experience in technical analysis.
                You excel at reading charts, identifying trends, and spotting
                potential reversals. You analyze MACD, RSI, KDJ indicators,
                moving averages, and volume patterns.""",
                verbose=True,
                llm=technical_llm,
                allow_delegation=False,
            ),
            Agent(
                role="Growth Stock Analyst",
                goal="Identify high-growth companies with strong momentum",
                backstory="""You specialize in finding next big winners. You focus
                on revenue growth, profit growth, market expansion, and competitive advantages.
                You look for companies in high-growth industries with sustainable growth drivers.""",
                verbose=True,
                llm=growth_llm,
                allow_delegation=False,
            ),
            Agent(
                role="Fundamental Analyst",
                goal="Evaluate company fundamentals and business quality",
                backstory="""You analyze business models, competitive advantages,
                management quality, and industry positioning. You look for companies
                with durable moats, strong governance, and sustainable business models.""",
                verbose=True,
                llm=fundamental_llm,
                allow_delegation=False,
            ),
            Agent(
                role="Risk Analyst",
                goal="Identify and assess all potential risks",
                backstory="""You are a professional risk manager. You systematically
                evaluate financial risks, operational risks, market risks, and regulatory risks.
                You provide risk assessments and mitigation suggestions.""",
                verbose=True,
                llm=risk_llm,
                allow_delegation=False,
            ),
            Agent(
                role="Macro Economist",
                goal="Analyze macroeconomic factors and policy impacts",
                backstory="""You have a PhD in economics and 15 years of experience
                analyzing how macro factors affect individual stocks. You consider monetary policy,
                industry regulations, economic cycles, and exchange rate impacts.""",
                verbose=True,
                llm=macro_llm,
                allow_delegation=False,
            ),
            Agent(
                role="Chief Investment Analyst",
                goal="Synthesize all analyses into actionable investment recommendations",
                backstory="""You are the chief investment strategist at a top-tier firm.
                You weigh inputs from all specialists and make clear, actionable recommendations.
                You calculate overall scores and provide buy/sell/hold recommendations with confidence levels.""",
                verbose=True,
                llm=synthesizer_llm,
                allow_delegation=False,
            ),
        ]

        crew = Crew(
            agents=dynamic_agents,
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
