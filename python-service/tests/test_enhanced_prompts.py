"""
增强版 Prompt 模板测试
"""

import pytest
from datetime import datetime


class TestGetAgentPrompt:
    """Agent Prompt 测试"""

    def test_get_value_agent_prompt(self):
        """测试价值投资 Agent Prompt"""
        from agents.enhanced_prompts import get_agent_prompt

        prompt = get_agent_prompt("value", "平安银行", "000001")

        assert "平安银行" in prompt
        assert "000001" in prompt
        assert "DCF" in prompt or "估值" in prompt
        assert "巴菲特" in prompt or "价值投资" in prompt

    def test_get_technical_agent_prompt(self):
        """测试技术分析 Agent Prompt"""
        from agents.enhanced_prompts import get_agent_prompt

        prompt = get_agent_prompt("technical", "平安银行", "000001")

        assert "平安银行" in prompt
        assert "RSI" in prompt or "MACD" in prompt or "技术" in prompt

    def test_get_growth_agent_prompt(self):
        """测试成长分析 Agent Prompt"""
        from agents.enhanced_prompts import get_agent_prompt

        prompt = get_agent_prompt("growth", "平安银行", "000001")

        assert "平安银行" in prompt
        assert "营收" in prompt or "增长" in prompt

    def test_get_fundamental_agent_prompt(self):
        """测试基本面 Agent Prompt"""
        from agents.enhanced_prompts import get_agent_prompt

        prompt = get_agent_prompt("fundamental", "平安银行", "000001")

        assert "平安银行" in prompt
        assert "ROE" in prompt or "盈利" in prompt or "基本面" in prompt

    def test_get_risk_agent_prompt(self):
        """测试风险分析 Agent Prompt"""
        from agents.enhanced_prompts import get_agent_prompt

        prompt = get_agent_prompt("risk", "平安银行", "000001")

        assert "平安银行" in prompt
        assert "风险" in prompt

    def test_get_macro_agent_prompt(self):
        """测试宏观分析 Agent Prompt"""
        from agents.enhanced_prompts import get_agent_prompt

        prompt = get_agent_prompt("macro", "平安银行", "000001")

        assert "平安银行" in prompt
        assert "宏观" in prompt or "经济" in prompt

    def test_get_synthesizer_agent_prompt(self):
        """测试综合分析 Agent Prompt"""
        from agents.enhanced_prompts import get_agent_prompt

        prompt = get_agent_prompt("synthesizer", "平安银行", "000001")

        assert "平安银行" in prompt
        assert "综合" in prompt or "整合" in prompt or "投资建议" in prompt

    def test_get_unknown_agent_prompt(self):
        """测试未知 Agent 类型"""
        from agents.enhanced_prompts import get_agent_prompt

        prompt = get_agent_prompt("unknown", "测试", "000000")

        assert prompt == ""  # 未知类型返回空字符串

    def test_prompt_contains_stock_info(self):
        """测试 Prompt 包含股票信息"""
        from agents.enhanced_prompts import get_agent_prompt

        prompt = get_agent_prompt("value", "平安银行", "000001")

        # 检查 Prompt 是否包含股票名称和代码
        assert "平安银行" in prompt
        assert "000001" in prompt


class TestParseAnalysisOutput:
    """分析输出解析测试"""

    def test_parse_with_score(self):
        """测试带评分的输出解析"""
        from agents.enhanced_prompts import parse_analysis_output

        output = """
## 执行摘要
这是测试摘要

综合评分: 85

主要因素:
- PE合理
- ROE良好
"""

        result = parse_analysis_output("value", output)

        assert result["agent"] == "value"
        assert result["score"] == 85

    def test_parse_with_confidence(self):
        """测试带置信度的输出解析"""
        from agents.enhanced_prompts import parse_analysis_output

        output = """
综合置信度: 75
"""

        result = parse_analysis_output("technical", output)

        assert result["confidence"] == 75

    def test_parse_recommendation(self):
        """测试推荐等级解析"""
        from agents.enhanced_prompts import parse_analysis_output

        output = """
操作建议: 买入
"""

        result = parse_analysis_output("growth", output)

        assert result["recommendation"] == "buy"

    def test_parse_strong_buy(self):
        """测试强烈买入解析"""
        from agents.enhanced_prompts import parse_analysis_output

        output = """
操作建议: 强烈买入
"""

        result = parse_analysis_output("value", output)

        assert result["recommendation"] == "strong_buy"

    def test_parse_wait(self):
        """测试观望解析"""
        from agents.enhanced_prompts import parse_analysis_output

        output = """
建议: 观望
"""

        result = parse_analysis_output("risk", output)

        assert result["recommendation"] == "wait"

    def test_parse_key_factors(self):
        """测试关键因素提取"""
        from agents.enhanced_prompts import parse_analysis_output

        output = """
关键因素:
- PE合理
- ROE良好
- 现金流健康
"""

        result = parse_analysis_output("fundamental", output)

        assert len(result["key_factors"]) > 0

    def test_parse_empty_output(self):
        """测试空输出解析"""
        from agents.enhanced_prompts import parse_analysis_output

        result = parse_analysis_output("value", "")

        assert result["agent"] == "value"
        assert result["score"] == 0
        assert result["confidence"] == 0


class TestFormatAnalysisResult:
    """分析结果格式化测试"""

    def test_format_with_multiple_agents(self):
        """测试多 Agent 结果格式化"""
        from agents.enhanced_prompts import format_analysis_result

        agent_outputs = [
            {
                "agent": "value",
                "score": 80,
                "confidence": 85,
                "recommendation": "buy",
                "key_factors": ["PE合理"],
                "risks": ["市场波动"],
            },
            {
                "agent": "technical",
                "score": 75,
                "confidence": 80,
                "recommendation": "buy",
                "key_factors": ["趋势向上"],
                "risks": [],
            },
            {
                "agent": "growth",
                "score": 85,
                "confidence": 90,
                "recommendation": "strong_buy",
                "key_factors": ["营收增长快"],
                "risks": ["竞争加剧"],
            },
        ]

        result = format_analysis_result(agent_outputs, "000001", "平安银行")

        assert result["symbol"] == "000001"
        assert result["stock_name"] == "平安银行"
        assert "overallScore" in result
        assert "recommendation" in result
        assert "keyFactors" in result
        assert "confidenceScore" in result

    def test_format_empty_agents(self):
        """测试空 Agent 结果"""
        from agents.enhanced_prompts import format_analysis_result

        result = format_analysis_result([], "TEST", "测试")

        assert result["symbol"] == "TEST"
        assert result["stock_name"] == "测试"

    def test_recommendation_voting(self):
        """测试推荐投票机制"""
        from agents.enhanced_prompts import format_analysis_result

        agent_outputs = [
            {"agent": "v1", "score": 80, "confidence": 80, "recommendation": "buy"},
            {"agent": "v2", "score": 75, "confidence": 80, "recommendation": "hold"},
            {"agent": "v3", "score": 70, "confidence": 80, "recommendation": "buy"},
            {
                "agent": "v4",
                "score": 85,
                "confidence": 80,
                "recommendation": "strong_buy",
            },
            {"agent": "v5", "score": 65, "confidence": 80, "recommendation": "hold"},
        ]

        result = format_analysis_result(agent_outputs, "TEST", "测试")

        # buy 应该得票最多
        assert result["recommendation"] in ["buy", "strong_buy"]

    def test_deduplicate_factors(self):
        """测试因素去重"""
        from agents.enhanced_prompts import format_analysis_result

        agent_outputs = [
            {
                "agent": "v1",
                "score": 80,
                "confidence": 80,
                "recommendation": "buy",
                "key_factors": ["因素A", "因素B"],
                "risks": ["风险1"],
            },
            {
                "agent": "v2",
                "score": 75,
                "confidence": 80,
                "recommendation": "buy",
                "key_factors": ["因素A", "因素C"],
                "risks": ["风险1", "风险2"],
            },
        ]

        result = format_analysis_result(agent_outputs, "TEST", "测试")

        # 因素A 应该只出现一次
        factors = result.get("keyFactors", [])
        assert factors.count("因素A") == 1


class TestPromptTemplates:
    """Prompt 模板测试"""

    def test_value_agent_template_structure(self):
        """测试价值投资模板结构"""
        from agents.enhanced_prompts import VALUE_AGENT_PROMPT

        # 包含关键部分
        assert "DCF" in VALUE_AGENT_PROMPT or "估值" in VALUE_AGENT_PROMPT
        assert "P/E" in VALUE_AGENT_PROMPT or "PE" in VALUE_AGENT_PROMPT
        assert "置信度" in VALUE_AGENT_PROMPT or "confidence" in VALUE_AGENT_PROMPT

    def test_technical_agent_template_structure(self):
        """测试技术分析模板结构"""
        from agents.enhanced_prompts import TECHNICAL_AGENT_PROMPT

        assert "RSI" in TECHNICAL_AGENT_PROMPT or "MACD" in TECHNICAL_AGENT_PROMPT
        assert "趋势" in TECHNICAL_AGENT_PROMPT or "趋势" in TECHNICAL_AGENT_PROMPT

    def test_all_agent_templates_exist(self):
        """测试所有 Agent 模板存在"""
        from agents.enhanced_prompts import (
            VALUE_AGENT_PROMPT,
            TECHNICAL_AGENT_PROMPT,
            GROWTH_AGENT_PROMPT,
            FUNDAMENTAL_AGENT_PROMPT,
            RISK_AGENT_PROMPT,
            MACRO_AGENT_PROMPT,
            SYNTHESIZER_PROMPT,
        )

        assert VALUE_AGENT_PROMPT
        assert TECHNICAL_AGENT_PROMPT
        assert GROWTH_AGENT_PROMPT
        assert FUNDAMENTAL_AGENT_PROMPT
        assert RISK_AGENT_PROMPT
        assert MACRO_AGENT_PROMPT
        assert SYNTHESIZER_PROMPT
