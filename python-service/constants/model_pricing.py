"""
模型定价常量配置

所有AI模型的价格配置（每百万token）
来源: 各大模型官方定价

支持的提供商:
- DeepSeek (deepseek-chat)
- MiniMax (minimax-m2)
- 智谱AI (ChatGLM/glm-4)
- 阿里千问 (Qwen/qwen-turbo/qwen-plus/qwen-max)
- OpenAI (GPT-4o)
- Anthropic (Claude)
"""

# 模型提供商配置
MODEL_PROVIDERS = {
    "deepseek": {
        "name": "DeepSeek",
        "models": {
            "deepseek-chat": {
                "name": "DeepSeek Chat",
                "pricing": {"input": 0.28, "output": 1.10},  # 更新后的价格
                "strengths": ["中文理解", "成本效益", "推理能力"],
                "max_tokens": 128000,
                "context_window": 128000,
            },
        },
    },
    "minimax": {
        "name": "MiniMax",
        "models": {
            "minimax-m2": {
                "name": "MiniMax M2",
                "pricing": {"input": 0.01, "output": 0.01},  # 约合 10元/百万token
                "strengths": ["超低成本", "快速响应", "中文优化"],
                "max_tokens": 8192,
                "context_window": 16384,
            },
        },
    },
    "zhipu": {
        "name": "智谱AI (ChatGLM)",
        "models": {
            "glm-4": {
                "name": "GLM-4",
                "pricing": {"input": 0.50, "output": 1.00},  # 约合 50-100元/百万token
                "strengths": ["中文理解", "长文本", "数学推理"],
                "max_tokens": 128000,
                "context_window": 128000,
            },
            "glm-4v": {
                "name": "GLM-4V (多模态)",
                "pricing": {"input": 0.50, "output": 1.00},
                "strengths": ["多模态理解", "图表分析"],
                "max_tokens": 128000,
                "context_window": 128000,
            },
        },
    },
    "qwen": {
        "name": "阿里千问 (Qwen)",
        "models": {
            "qwen-turbo": {
                "name": "Qwen Turbo",
                "pricing": {"input": 0.20, "output": 0.60},  # 约合 20-60元/百万token
                "strengths": ["快速响应", "成本效益", "中文优化"],
                "max_tokens": 16000,
                "context_window": 16000,
            },
            "qwen-plus": {
                "name": "Qwen Plus",
                "pricing": {"input": 0.40, "output": 1.20},  # 约合 40-120元/百万token
                "strengths": ["增强推理", "长上下文"],
                "max_tokens": 64000,
                "context_window": 64000,
            },
            "qwen-max": {
                "name": "Qwen Max",
                "pricing": {"input": 1.00, "output": 3.00},  # 约合 100-300元/百万token
                "strengths": ["最强性能", "复杂推理", "高质量输出"],
                "max_tokens": 64000,
                "context_window": 64000,
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

# 推荐的默认模型（按提供商）
RECOMMENDED_MODELS = {
    "deepseek": "deepseek-chat",
    "minimax": "minimax-m2",
    "zhipu": "glm-4",
    "qwen": "qwen-max",
    "openai": "gpt-4o",
    "anthropic": "claude-3-5-sonnet",
}


def get_model_info(model_name: str) -> dict | None:
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


def get_provider_for_model(model_name: str) -> str | None:
    """获取模型所属的提供商"""
    for provider_key, provider_data in MODEL_PROVIDERS.items():
        if model_name in provider_data["models"]:
            return provider_key
    return None


def get_available_providers() -> list:
    """获取所有可用的提供商"""
    return list(MODEL_PROVIDERS.keys())


def get_available_models() -> list:
    """获取所有可用的模型"""
    models = []
    for provider, data in MODEL_PROVIDERS.items():
        for model_name in data["models"]:
            models.append(
                {
                    "id": model_name,
                    "name": data["models"][model_name]["name"],
                    "provider": provider,
                    "provider_name": data["name"],
                }
            )
    return models


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
        "currency": "CNY",  # 国产模型使用人民币计价
    }


def get_recommended_model(provider: str) -> str:
    """获取指定提供商的推荐模型"""
    return RECOMMENDED_MODELS.get(provider, "")


# 成本对比示例
COST_COMPARISON = """
## 各模型成本对比 (每百万token)

| 提供商 | 模型 | 输入 (¥) | 输出 (¥) | 特点 |
|--------|------|----------|----------|------|
| DeepSeek | deepseek-chat | 0.28 | 1.10 | 性价比最高 |
| MiniMax | minimax-m2 | 0.01 | 0.01 | 超低成本 |
| 智谱AI | glm-4 | 0.50 | 1.00 | 长文本优秀 |
| 阿里千问 | qwen-turbo | 0.20 | 0.60 | 快速响应 |
| 阿里千问 | qwen-max | 1.00 | 3.00 | 最强性能 |
"""
