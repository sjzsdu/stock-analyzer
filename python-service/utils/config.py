"""
配置管理模块

集中管理所有环境变量和应用配置，支持多环境部署。

支持的 LLM 提供商:
- DeepSeek (deepseek-chat)
- MiniMax (minimax-m2)
- 智谱AI (glm-4)
- 阿里千问 (qwen-turbo/qwen-plus/qwen-max)
"""

import os
from typing import Optional, List, Dict
from functools import lru_cache


# 支持的 LLM 提供商
LLM_PROVIDERS = {
    "deepseek": {
        "name": "DeepSeek",
        "models": ["deepseek-chat"],
        "api_base": "https://api.deepseek.com/v1",
        "env_key": "DEEPSEEK_API_KEY",
    },
    "minimax": {
        "name": "MiniMax",
        "models": ["minimax-m2"],
        "api_base": "https://api.minimax.chat/v1/text/chatcompletion_v2",
        "env_key": "MINIMAX_API_KEY",
    },
    "zhipu": {
        "name": "智谱AI (ChatGLM)",
        "models": ["glm-4"],
        "api_base": "https://open.bigmodel.cn/api/paas/v4/chat/completions",
        "env_key": "ZHIPU_API_KEY",
    },
    "qwen": {
        "name": "阿里千问 (Qwen)",
        "models": ["qwen-turbo", "qwen-plus", "qwen-max"],
        "api_base": "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
        "env_key": "QWEN_API_KEY",
    },
}

# 默认使用的模型（每个提供商最新的模型）
DEFAULT_MODEL_MAP = {
    "deepseek": "deepseek-chat",
    "minimax": "minimax-m2",
    "zhipu": "glm-4",
    "qwen": "qwen-max",
}

# 默认提供商
DEFAULT_PROVIDER = "deepseek"


class Config:
    """应用配置类"""

    # API 配置
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_DEBUG: bool = False
    API_TITLE: str = "Stock Data & Analysis API"
    API_VERSION: str = "1.0.0"

    # LLM 提供商配置
    LLM_PROVIDER: str = DEFAULT_PROVIDER
    LLM_MODEL: str = DEFAULT_MODEL_MAP[DEFAULT_PROVIDER]
    LLM_API_KEY: Optional[str] = None
    LLM_API_BASE: str = LLM_PROVIDERS[DEFAULT_PROVIDER]["api_base"]
    LLM_TEMPERATURE: float = 0.5
    LLM_MAX_TOKENS: int = 2000

    # CORS 配置
    CORS_ALLOW_ORIGINS: List[str] = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]

    # 数据采集配置
    COLLECT_MAX_RETRIES: int = 3
    COLLECT_RETRY_DELAY: int = 1
    COLLECT_KLINE_DAYS: int = 730

    # 分析配置
    ANALYSIS_DEFAULT_CONFIDENCE: float = 75.0
    ANALYSIS_DEFAULT_PROCESSING_TIME: float = 30.0

    # Agent 配置
    AGENT_ROLES: tuple = (
        "value",
        "technical",
        "growth",
        "fundamental",
        "risk",
        "macro",
        "synthesizer",
    )

    AGENT_WEIGHTS: dict = {
        "value": 0.25,
        "technical": 0.15,
        "growth": 0.20,
        "fundamental": 0.15,
        "risk": 0.15,
        "macro": 0.10,
        "synthesizer": 0.0,
    }

    # 推荐等级映射
    RECOMMENDATION_MAP: dict = {
        85: "strong_buy",
        75: "buy",
        60: "hold",
        50: "wait",
    }

    def __init__(self):
        """从环境变量加载配置"""
        self._load_from_env()

    def _load_from_env(self):
        """从环境变量加载配置"""
        # API 配置
        self.API_HOST = os.getenv("API_HOST", self.API_HOST)
        port = os.getenv("API_PORT")
        if port:
            self.API_PORT = int(port)
        self.API_DEBUG = os.getenv("API_DEBUG", str(self.API_DEBUG)).lower() == "true"

        # LLM 提供商配置
        provider = os.getenv("LLM_PROVIDER", DEFAULT_PROVIDER).lower()
        if provider in LLM_PROVIDERS:
            self.LLM_PROVIDER = provider
            self.LLM_API_BASE = LLM_PROVIDERS[provider]["api_base"]
            fallback_model = LLM_PROVIDERS[provider]["models"][0]
            model_from_env = os.getenv("LLM_MODEL")
            default_model = DEFAULT_MODEL_MAP.get(provider)
            # 确保 LLM_MODEL 是字符串
            if model_from_env:
                self.LLM_MODEL = model_from_env
            elif default_model:
                self.LLM_MODEL = default_model
            else:
                self.LLM_MODEL = fallback_model

            # 获取 API key
            env_key = LLM_PROVIDERS[provider]["env_key"]
            self.LLM_API_KEY = os.getenv(env_key) or os.getenv(
                f"{provider.upper()}_API_KEY"
            )

        # LLM 其他配置
        temperature = os.getenv("LLM_TEMPERATURE")
        if temperature:
            self.LLM_TEMPERATURE = float(temperature)

        max_tokens = os.getenv("LLM_MAX_TOKENS")
        if max_tokens:
            self.LLM_MAX_TOKENS = int(max_tokens)

        # CORS 配置
        cors_origins = os.getenv("CORS_ALLOW_ORIGINS")
        if cors_origins:
            self.CORS_ALLOW_ORIGINS = cors_origins.split(",")

        # 数据采集配置
        max_retries = os.getenv("COLLECT_MAX_RETRIES")
        if max_retries:
            self.COLLECT_MAX_RETRIES = int(max_retries)

    def get_llm_config(self) -> Dict:
        """获取当前 LLM 配置"""
        return {
            "provider": self.LLM_PROVIDER,
            "model": self.LLM_MODEL,
            "api_key": self.LLM_API_KEY,
            "api_base": self.LLM_API_BASE,
            "temperature": self.LLM_TEMPERATURE,
            "max_tokens": self.LLM_MAX_TOKENS,
        }

    def validate_llm_config(self) -> tuple:
        """验证 LLM API 配置"""
        api_key = self.LLM_API_KEY

        if not api_key:
            return False, None, f"{self.LLM_PROVIDER.upper()}_API_KEY 未配置"

        # 检查占位符
        placeholders = [
            "sk-your_deepseek_api_key_here",
            "sk-your_minimax_api_key_here",
            "sk-your_zhipu_api_key_here",
            "sk-your_qwen_api_key_here",
        ]
        if api_key in placeholders:
            return (
                False,
                None,
                f"请在 .env.local 中设置有效的 {self.LLM_PROVIDER.upper()}_API_KEY",
            )

        return True, api_key, None

    def set_provider(self, provider: str) -> bool:
        """设置 LLM 提供商"""
        provider = provider.lower()
        if provider in LLM_PROVIDERS:
            self.LLM_PROVIDER = provider
            self.LLM_API_BASE = LLM_PROVIDERS[provider]["api_base"]
            models_list = LLM_PROVIDERS[provider]["models"]
            if provider in DEFAULT_MODEL_MAP:
                self.LLM_MODEL = DEFAULT_MODEL_MAP[provider]
            else:
                self.LLM_MODEL = models_list[0] if models_list else "default"
            env_key = LLM_PROVIDERS[provider]["env_key"]
            self.LLM_API_KEY = os.getenv(env_key)
            return True
        return False

    def get_available_providers(self) -> List[Dict]:
        """获取可用的提供商列表"""
        return [
            {"id": k, "name": v["name"], "models": v["models"]}
            for k, v in LLM_PROVIDERS.items()
        ]

    def get_recommendation(self, score: float) -> str:
        """根据分数获取推荐等级"""
        for threshold, recommendation in sorted(self.RECOMMENDATION_MAP.items()):
            if score >= threshold:
                return recommendation
        return "sell"

    def get_agent_weight(self, agent_role: str) -> float:
        """获取 Agent 权重"""
        return self.AGENT_WEIGHTS.get(agent_role, 0.1)


@lru_cache()
def get_config() -> Config:
    """获取配置单例"""
    return Config()


def config() -> Config:
    """获取配置"""
    return get_config()
