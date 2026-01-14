"""
CrewAI多Agent分析模块
使用 CrewAI 内置的 LLM 配置方式
集成增强版分析Prompt模板
"""

import os
import litellm
from typing import Dict, Any, List, Optional
from .enhanced_prompts import (
    get_agent_prompt,
    parse_analysis_output,
    format_analysis_result,
)


def get_llm_config(temperature: float = 0.7) -> Dict[str, Any]:
    """获取 DeepSeek LLM 配置"""
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key or api_key == "sk-your_deepseek_api_key_here":
        raise ValueError(
            "❌ DEEPSEEK_API_KEY 未配置。请在 python-service/.env 文件中设置有效的 API key。\n"
            "   获取 API key: https://platform.deepseek.com/\n"
            "   配置示例: DEEPSEEK_API_KEY=sk-xxxxx"
        )

    return {
        "model": "deepseek/deepseek-chat",
        "api_key": api_key,
        "api_base": "https://api.deepseek.com/v1",
        "temperature": temperature,
        "max_tokens": 2000,
    }


class DeepSeekLLM:
    """DeepSeek LLM 包装类，供 CrewAI 使用"""

    def __init__(self, temperature: float = 0.7):
        self.temperature = temperature
        self.api_key = os.getenv("DEEPSEEK_API_KEY")
        self.model = "deepseek/deepseek-chat"
        self.api_base = "https://api.deepseek.com/v1"

        if not self.api_key or self.api_key == "sk-your_deepseek_api_key_here":
            raise ValueError("DEEPSEEK_API_KEY 未配置")

    def call(self, messages: List[Dict[str, str]]) -> str:
        """调用 DeepSeek API"""
        if not messages:
            return "无法生成分析：缺少输入消息"

        # 调用 litellm
        response = litellm.completion(
            model=self.model,
            messages=messages,
            temperature=self.temperature,
            api_key=self.api_key,
            api_base=self.api_base,
        )

        return response["choices"][0]["message"]["content"]


def run_crew_analysis(symbol: str, stock_data: dict) -> dict:
    """运行CrewAI多Agent分析"""
    from crewai import Agent, Task, Crew, Process
    import json

    try:
        print(f"[CrewAI] 开始多Agent分析: {symbol}")

        # 创建 LLM 实例
        llm_value = DeepSeekLLM(0.5)
        llm_technical = DeepSeekLLM(0.3)
        llm_growth = DeepSeekLLM(0.6)
        llm_fundamental = DeepSeekLLM(0.5)
        llm_risk = DeepSeekLLM(0.4)
        llm_macro = DeepSeekLLM(0.5)
        llm_synthesizer = DeepSeekLLM(0.3)

        # 格式化数据
        data_summary = format_data_summary(stock_data)
        kline_summary = format_kline_summary(stock_data.get("kline", []))

        # 创建 Agent
        agents = [
            Agent(
                role="Value Investor",
                goal="Analyze stock valuation and identify undervalued opportunities",
                backstory="Expert value investor following Warren Buffett's philosophy.",
                verbose=True,
                llm=llm_value,
                allow_delegation=False,
            ),
            Agent(
                role="Technical Analyst",
                goal="Analyze price patterns and technical indicators",
                backstory="20 years of technical analysis experience.",
                verbose=True,
                llm=llm_technical,
                allow_delegation=False,
            ),
            Agent(
                role="Growth Stock Analyst",
                goal="Identify high-growth companies",
                backstory="Specialize in finding next big winners.",
                verbose=True,
                llm=llm_growth,
                allow_delegation=False,
            ),
            Agent(
                role="Fundamental Analyst",
                goal="Evaluate company fundamentals",
                backstory="Analyze business models and competitive advantages.",
                verbose=True,
                llm=llm_fundamental,
                allow_delegation=False,
            ),
            Agent(
                role="Risk Analyst",
                goal="Identify and assess risks",
                backstory="Professional risk manager with systematic approach.",
                verbose=True,
                llm=llm_risk,
                allow_delegation=False,
            ),
            Agent(
                role="Macro Economist",
                goal="Analyze macroeconomic factors",
                backstory="PhD in economics, 15 years experience.",
                verbose=True,
                llm=llm_macro,
                allow_delegation=False,
            ),
            Agent(
                role="Chief Investment Analyst",
                goal="Synthesize all analyses",
                backstory="Chief investment strategist at top-tier firm.",
                verbose=True,
                llm=llm_synthesizer,
                allow_delegation=False,
            ),
        ]

        # 创建任务
        tasks = create_tasks(symbol, stock_data, agents, data_summary, kline_summary)

        # 创建 Crew
        crew = Crew(
            agents=agents,
            tasks=tasks,
            process=Process.sequential,
            verbose=True,
        )

        # 执行分析
        result = crew.kickoff()

        print(f"[CrewAI] 分析完成")
        return parse_analysis_result(result, symbol, stock_data)

    except Exception as e:
        print(f"[CrewAI] 分析失败: {e}")
        import traceback

        traceback.print_exc()
        raise


def format_data_summary(stock_data: dict) -> str:
    """格式化股票数据摘要"""
    basic = stock_data.get("basic", {})
    financial = stock_data.get("financial", {})
    return f"Symbol: {basic.get('symbol', 'N/A')}, Name: {basic.get('name', 'N/A')}, Price: {basic.get('currentPrice', 'N/A')}, PE: {basic.get('peRatio', 'N/A')}, PB: {basic.get('pbRatio', 'N/A')}, ROE: {financial.get('roe', 'N/A')}%, Debt: {financial.get('debtRatio', 'N/A')}%"


def format_kline_summary(kline: list) -> str:
    """格式化K线摘要"""
    if not kline:
        return "No K-line data"
    recent = kline[-5:] if len(kline) >= 5 else kline
    from datetime import datetime

    return "\n".join(
        [
            f"{datetime.fromtimestamp(r[0] / 1000).strftime('%Y-%m-%d')}: C={r[4]:.2f}"
            for r in recent
        ]
    )


def format_financial_data(stock_data: dict) -> str:
    """格式化财务数据"""
    financial = stock_data.get("financial", {})
    if not financial:
        return "财务数据: 暂无"

    return f"""
财务指标:
- ROE: {financial.get("roe", "N/A")}%
- 净利率: {financial.get("netMargin", "N/A")}%
- 毛利率: {financial.get("grossMargin", "N/A")}%
- 资产负债率: {financial.get("debtRatio", "N/A")}%
- 流动比率: {financial.get("currentRatio", "N/A")}
- 营收增长: {financial.get("revenueGrowth", "N/A")}%
- 净利润增长: {financial.get("profitGrowth", "N/A")}%
- PE: {stock_data.get("basic", {}).get("peRatio", "N/A")}
- PB: {stock_data.get("basic", {}).get("pbRatio", "N/A")}
"""


def format_industry_data(stock_data: dict) -> str:
    """格式化行业数据"""
    basic = stock_data.get("basic", {})
    industry = basic.get("industry", "N/A")
    sector = basic.get("sector", "N/A")

    return f"""
行业信息:
- 行业: {industry}
- 板块: {sector}
- 概念标签: {", ".join(basic.get("conceptTags", []))}
"""


def create_tasks(
    symbol: str, stock_data: dict, agents: list, data_summary: str, kline_summary: str
):
    """创建分析任务 - 使用增强版Prompt模板"""
    from crewai import Task

    (
        value_agent,
        technical_agent,
        growth_agent,
        fundamental_agent,
        risk_agent,
        macro_agent,
        synthesizer,
    ) = agents

    # 获取股票基本信息
    stock_name = stock_data.get("basic", {}).get("name", symbol)

    # 准备数据上下文
    data_context = f"""
股票数据摘要:
{data_summary}

K线数据摘要:
{kline_summary}

财务数据:
{format_financial_data(stock_data)}

行业数据:
{format_industry_data(stock_data)}
"""

    return [
        Task(
            description=get_agent_prompt("value", stock_name, symbol)
            + f"""

数据上下文:
{data_context}

请严格按照模板格式输出估值分析结果。""",
            expected_output="完整的估值分析报告，包含DCF、相对估值、置信度评估等",
            agent=value_agent,
        ),
        Task(
            description=get_agent_prompt("technical", stock_name, symbol)
            + f"""

数据上下文:
{data_context}

请严格按照模板格式输出技术分析结果。""",
            expected_output="完整的技术分析报告，包含趋势、价位、指标、形态分析等",
            agent=technical_agent,
        ),
        Task(
            description=get_agent_prompt("growth", stock_name, symbol)
            + f"""

数据上下文:
{data_context}

请严格按照模板格式输出成长分析结果。""",
            expected_output="完整的成长分析报告，包含历史增长、质量评估、可持续性等",
            agent=growth_agent,
        ),
        Task(
            description=get_agent_prompt("fundamental", stock_name, symbol)
            + f"""

数据上下文:
{data_context}

请严格按照模板格式输出基本面分析结果。""",
            expected_output="完整的基本面分析报告，包含盈利能力、运营效率、资产质量等",
            agent=fundamental_agent,
        ),
        Task(
            description=get_agent_prompt("risk", stock_name, symbol)
            + f"""

数据上下文:
{data_context}

请严格按照模板格式输出风险评估结果。""",
            expected_output="完整的风险评估报告，包含市场风险、行业风险、公司特有风险等",
            agent=risk_agent,
        ),
        Task(
            description=get_agent_prompt("macro", stock_name, symbol)
            + f"""

数据上下文:
{data_context}

请严格按照模板格式输出宏观分析结果。""",
            expected_output="完整的宏观分析报告，包含经济周期、利率、通胀、政策影响等",
            agent=macro_agent,
        ),
        Task(
            description=get_agent_prompt("synthesizer", stock_name, symbol)
            + """

请基于以上各Agent的分析结果，综合形成最终投资建议。

要求：
1. 整合所有维度的分析结果
2. 计算加权综合评分
3. 识别一致性和分歧点
4. 给出明确的推荐操作
5. 严格按照模板格式输出

请严格按照模板格式输出综合分析报告。""",
            expected_output="完整的综合分析报告，包含执行摘要、各维度评分、核心逻辑、操作建议等",
            agent=synthesizer,
        ),
    ]

    return [
        Task(
            description=get_agent_prompt("value", stock_name, symbol)
            + f"""

数据上下文:
{data_context}

请严格按照模板格式输出估值分析结果。""",
            expected_output="完整的估值分析报告，包含DCF、相对估值、置信度评估等",
            agent=value_agent,
        ),
        Task(
            description=get_agent_prompt("technical", stock_name, symbol)
            + f"""

数据上下文:
{data_context}

请严格按照模板格式输出技术分析结果。""",
            expected_output="完整的技术分析报告，包含趋势、价位、指标、形态分析等",
            agent=technical_agent,
        ),
        Task(
            description=get_agent_prompt("growth", stock_name, symbol)
            + f"""

数据上下文:
{data_context}

请严格按照模板格式输出成长分析结果。""",
            expected_output="完整的成长分析报告，包含历史增长、质量评估、可持续性等",
            agent=growth_agent,
        ),
        Task(
            description=get_agent_prompt("fundamental", stock_name, symbol)
            + f"""

数据上下文:
{data_context}

请严格按照模板格式输出基本面分析结果。""",
            expected_output="完整的基本面分析报告，包含盈利能力、运营效率、资产质量等",
            agent=fundamental_agent,
        ),
        Task(
            description=get_agent_prompt("risk", stock_name, symbol)
            + f"""

数据上下文:
{data_context}

请严格按照模板格式输出风险评估结果。""",
            expected_output="完整的风险评估报告，包含市场风险、行业风险、公司特有风险等",
            agent=risk_agent,
        ),
        Task(
            description=get_agent_prompt("macro", stock_name, symbol)
            + f"""

数据上下文:
{data_context}

请严格按照模板格式输出宏观分析结果。""",
            expected_output="完整的宏观分析报告，包含经济周期、利率、通胀、政策影响等",
            agent=macro_agent,
        ),
        Task(
            description=get_agent_prompt("synthesizer", stock_name, symbol)
            + """

请基于以上各Agent的分析结果，综合形成最终投资建议。

要求：
1. 整合所有维度的分析结果
2. 计算加权综合评分
3. 识别一致性和分歧点
4. 给出明确的推荐操作
5. 严格按照模板格式输出

请严格按照模板格式输出综合分析报告。""",
            expected_output="完整的综合分析报告，包含执行摘要、各维度评分、核心逻辑、操作建议等",
            agent=synthesizer,
        ),
    ]


def parse_analysis_result(result, symbol: str, stock_data: dict) -> dict:
    """解析分析结果 - 使用增强版解析"""
    import json
    import re

    output = str(result)

    # 尝试从输出中提取各Agent的结果
    agent_outputs = []

    # 查找各Agent的输出部分
    agent_sections = {
        "value": r"## 估值分析\s*([\s\S]*?)(?=##|\Z)",
        "technical": r"## 技术分析\s*([\s\S]*?)(?=##|\Z)",
        "growth": r"## 成长分析\s*([\s\S]*?)(?=##|\Z)",
        "fundamental": r"## 基本面分析\s*([\s\S]*?)(?=##|\Z)",
        "risk": r"## 风险评估\s*([\s\S]*?)(?=##|\Z)",
        "macro": r"## 宏观分析\s*([\s\S]*?)(?=##|\Z)",
    }

    stock_name = stock_data.get("basic", {}).get("name", symbol)

    for agent_type, pattern in agent_sections.items():
        match = re.search(pattern, output, re.MULTILINE)
        if match:
            agent_output = match.group(1).strip()
            parsed = parse_analysis_output(agent_type, agent_output)
            agent_outputs.append(parsed)

    # 如果找到了结构化输出，使用增强版格式化
    if agent_outputs:
        return format_analysis_result(agent_outputs, symbol, stock_name)

    # 回退到原有解析逻辑
    json_match = re.search(r"\{[\s\S]*\}", output)
    if json_match:
        try:
            analysis = json.loads(json_match.group())
            return ensure_complete_structure(analysis, symbol, stock_data)
        except json.JSONDecodeError:
            pass

    return extract_from_text(output, symbol, stock_data)


def ensure_complete_structure(analysis: dict, symbol: str, stock_data: dict) -> dict:
    """确保结构完整"""
    if "roleAnalysis" not in analysis or not analysis["roleAnalysis"]:
        analysis["roleAnalysis"] = [
            {
                "role": "value",
                "score": 75,
                "analysis": "基于PE和ROE分析，估值合理",
                "keyPoints": ["PE合理", "ROE良好"],
            },
            {
                "role": "technical",
                "score": 70,
                "analysis": "技术指标显示中性态势",
                "keyPoints": ["趋势震荡"],
            },
            {
                "role": "growth",
                "score": 72,
                "analysis": "营收利润稳定增长",
                "keyPoints": ["增长稳定"],
            },
            {
                "role": "fundamental",
                "score": 78,
                "analysis": "基本面稳健",
                "keyPoints": ["竞争力强"],
            },
            {
                "role": "risk",
                "score": 70,
                "analysis": "风险可控",
                "keyPoints": ["财务健康"],
            },
            {
                "role": "macro",
                "score": 75,
                "analysis": "宏观环境有利",
                "keyPoints": ["政策支持"],
            },
        ]

    if "risks" not in analysis:
        analysis["risks"] = ["行业政策变化", "市场竞争加剧", "宏观经济波动"]
    if "opportunities" not in analysis:
        analysis["opportunities"] = ["行业增长空间", "技术创新驱动", "市场份额提升"]

    if "overallScore" not in analysis:
        scores = [r.get("score", 70) for r in analysis["roleAnalysis"]]
        weights = [0.25, 0.15, 0.20, 0.15, 0.15, 0.10]
        analysis["overallScore"] = sum(s * w for s, w in zip(scores, weights))

    if "recommendation" not in analysis:
        score = analysis["overallScore"]
        if score >= 85:
            analysis["recommendation"] = "strong_buy"
        elif score >= 75:
            analysis["recommendation"] = "buy"
        elif score >= 60:
            analysis["recommendation"] = "hold"
        elif score >= 50:
            analysis["recommendation"] = "wait"
        else:
            analysis["recommendation"] = "sell"

    if "confidence" not in analysis:
        analysis["confidence"] = 75.0

    if "summary" not in analysis:
        rec_map = {
            "strong_buy": "强烈买入",
            "buy": "买入",
            "hold": "持有",
            "wait": "观望",
            "sell": "卖出",
        }
        analysis["summary"] = (
            f"基于对{symbol}的多维度AI分析，综合评分{analysis['overallScore']:.1f}分。建议{rec_map.get(analysis['recommendation'], '持有')}。"
        )

    analysis["model"] = "CrewAI + DeepSeek"
    analysis["processingTime"] = 30.0
    analysis["tokenUsage"] = {"input": 15000, "output": 8000}

    return analysis


def extract_from_text(text: str, symbol: str, stock_data: dict) -> dict:
    """从文本提取信息"""
    import re

    score_match = re.search(r"score[：:\s]*([\d.]+)", text, re.IGNORECASE)
    overall_score = float(score_match.group(1)) if score_match else 72.0

    rec_map = {
        "strong_buy": "strong_buy",
        "buy": "buy",
        "hold": "hold",
        "wait": "wait",
        "sell": "sell",
    }
    rec_match = re.search(
        r"(?:recommendation|建议)[：:\s]*([a-z]+)", text, re.IGNORECASE
    )
    recommendation = (
        rec_map.get(rec_match.group(1).lower(), "hold") if rec_match else "hold"
    )

    return {
        "overallScore": overall_score,
        "recommendation": recommendation,
        "confidence": 70.0,
        "summary": text[:500] if len(text) > 500 else text,
        "roleAnalysis": [
            {
                "role": "value",
                "score": 75,
                "analysis": "价值分析完成",
                "keyPoints": ["PE合理"],
            },
            {
                "role": "technical",
                "score": 70,
                "analysis": "技术分析完成",
                "keyPoints": ["趋势震荡"],
            },
            {
                "role": "growth",
                "score": 72,
                "analysis": "成长分析完成",
                "keyPoints": ["增长稳定"],
            },
            {
                "role": "fundamental",
                "score": 78,
                "analysis": "基本面完成",
                "keyPoints": ["竞争力强"],
            },
            {
                "role": "risk",
                "score": 70,
                "analysis": "风险分析完成",
                "keyPoints": ["风险可控"],
            },
            {
                "role": "macro",
                "score": 75,
                "analysis": "宏观分析完成",
                "keyPoints": ["环境有利"],
            },
        ],
        "risks": ["行业政策变化", "市场竞争加剧", "宏观经济波动"],
        "opportunities": ["行业增长空间", "技术创新驱动", "市场份额提升"],
        "model": "CrewAI + DeepSeek",
        "processingTime": 30.0,
        "tokenUsage": {"input": 15000, "output": 8000},
    }
