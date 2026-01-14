"""
模型定价常量配置

所有AI模型的价格配置（每百万token）
来源: 各大模型官方定价

@module constants.model_pricing
"""

# 模型提供商配置
MODEL_PROVIDERS = {
    "deepseek": {
        "name": "DeepSeek",
        "models": {
            "deepseek-v3": {
                "name": "DeepSeek V3",
                "pricing": {"input": 0.28, "output": 0.42},
                "strengths": ["中文理解", "成本效益", "推理能力"],
                "max_tokens": 128000,
                "context_window": 128000,
            },
            "deepseek-v3-reasoner": {
                "name": "DeepSeek V3 Reasoner",
                "pricing": {"input": 0.55, "output": 2.19},
                "strengths": ["深度推理", "复杂分析", "长文本"],
                "max_tokens": 128000,
                "context_window": 128000,
            },
        },
    },
    "openai": {
        "name": "OpenAI",
        "models": {
            "gpt-4o": {
                "name": "GPT-4o",
                "pricing": {"input": 5.00, "output": 20.00},
                "strengths": ["英文分析", "准确性", "生态完善"],
                "max_tokens": 128000,
                "context_window": 128000,
            },
            "gpt-4o-mini": {
                "name": "GPT-4o Mini",
                "pricing": {"input": 0.60, "output": 2.40},
                "strengths": ["快速响应", "成本低", "日常分析"],
                "max_tokens": 128000,
                "context_window": 128000,
            },
        },
    },
    "anthropic": {
        "name": "Anthropic",
        "models": {
            "claude-3-5-sonnet": {
                "name": "Claude 3.5 Sonnet",
                "pricing": {"input": 3.00, "output": 15.00},
                "strengths": ["长文本", "分析深度", "安全性"],
                "max_tokens": 200000,
                "context_window": 200000,
            },
            "claude-3-5-haiku": {
                "name": "Claude 3.5 Haiku",
                "pricing": {"input": 0.80, "output": 4.00},
                "strengths": ["快速响应", "成本效益", "日常任务"],
                "max_tokens": 200000,
                "context_window": 200000,
            },
        },
    },
}

# 订阅层级对应的模型访问权限
TIER_MODEL_ACCESS = {
    "free": ["deepseek-v3"],
    "basic": ["deepseek-v3", "deepseek-v3-reasoner"],
    "pro": ["deepseek-v3", "deepseek-v3-reasoner", "gpt-4o-mini"],
    "enterprise": [
        "deepseek-v3",
        "deepseek-v3-reasoner",
        "gpt-4o",
        "gpt-4o-mini",
        "claude-3-5-sonnet",
        "claude-3-5-haiku",
    ],
}

# 默认模型选择
DEFAULT_MODEL_SELECTION = {
    "free": "deepseek-v3",
    "basic": "deepseek-v3",
    "pro": "deepseek-v3-reasoner",
    "enterprise": "deepseek-v3-reasoner",
}

# 分析类型推荐模型
ANALYSIS_TYPE_RECOMMENDATIONS = {
    "value": {
        "recommended": "deepseek-v3-reasoner",
        "fallback": "deepseek-v3",
        "reason": "深度推理模型更适合估值分析",
    },
    "technical": {
        "recommended": "deepseek-v3",
        "fallback": "gpt-4o-mini",
        "reason": "技术分析相对标准化，基础模型足够",
    },
    "growth": {
        "recommended": "deepseek-v3-reasoner",
        "fallback": "deepseek-v3",
        "reason": "成长分析需要深度推理",
    },
    "fundamental": {
        "recommended": "deepseek-v3-reasoner",
        "fallback": "deepseek-v3",
        "reason": "基本面分析需要详细的数据推理",
    },
    "risk": {
        "recommended": "claude-3-5-sonnet",
        "fallback": "deepseek-v3-reasoner",
        "reason": "风险评估需要综合分析和安全性",
    },
    "macro": {
        "recommended": "deepseek-v3-reasoner",
        "fallback": "claude-3-5-sonnet",
        "reason": "宏观分析需要长文本理解和推理",
    },
}


def get_model_info(model_name: str) -> dict:
    """获取指定模型的详细信息"""
    for provider_key, provider_data in MODEL_PROVIDERS.items():
        if model_name in provider_data["models"]:
            return {
                "provider": provider_key,
                "provider_name": provider_data["name"],
                "model_name": model_name,
                **provider_data["models"][model_name],
            }
    return None


def get_available_models_for_tier(tier: str) -> list:
    """获取指定订阅层级可用的模型列表"""
    model_names = TIER_MODEL_ACCESS.get(tier, TIER_MODEL_ACCESS["free"])
    return [get_model_info(model_name) for model_name in model_names]


def calculate_cost(model_name: str, input_tokens: int, output_tokens: int) -> dict:
    """计算分析成本"""
    model_info = get_model_info(model_name)
    if not model_info:
        return {"error": "Model not found"}

    pricing = model_info["pricing"]
    input_cost = (input_tokens / 1000000) * pricing["input"]
    output_cost = (output_tokens / 1000000) * pricing["output"]

    return {
        "model": model_name,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "input_cost": round(input_cost, 6),
        "output_cost": round(output_cost, 6),
        "total_cost": round(input_cost + output_cost, 6),
        "currency": "USD",
    }


def get_optimal_model_for_analysis(
    analysis_type: str, user_tier: str, user_preference: str = None
) -> str:
    """
    获取分析类型的最佳模型

    Args:
        analysis_type: 分析类型
        user_tier: 用户订阅层级
        user_preference: 用户偏好设置

    Returns:
        最佳模型名称
    """
    # 如果用户有偏好且有权访问，返回用户偏好
    if user_preference:
        available_models = TIER_MODEL_ACCESS.get(user_tier, [])
        if user_preference in available_models:
            return user_preference

    # 根据分析类型推荐
    recommendation = ANALYSIS_TYPE_RECOMMENDATIONS.get(analysis_type, {})
    recommended_model = recommendation.get("recommended", "deepseek-v3")

    # 检查用户是否有权限访问推荐模型
    available_models = TIER_MODEL_ACCESS.get(user_tier, [])
    if recommended_model in available_models:
        return recommended_model

    # 回退到可用的默认模型
    for model in available_models:
        return model

    # 最坏情况：返回免费版模型
    return "deepseek-v3"
