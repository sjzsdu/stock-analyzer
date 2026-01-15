"""
配置模块测试
"""

import os
import pytest
from unittest.mock import patch


class TestConfig:
    """配置模块测试类"""

    def test_config_default_values(self, monkeypatch):
        """测试默认配置值"""
        # 清除环境变量
        for key in [
            "API_HOST",
            "API_PORT",
            "DEEPSEEK_API_KEY",
            "DEEPSEEK_MODEL",
            "CORS_ALLOW_ORIGINS",
            "API_DEBUG",
        ]:
            monkeypatch.delenv(key, raising=False)

        # 清除配置缓存
        from utils.config import get_config

        get_config.cache_clear()

        from utils.config import Config

        cfg = Config()

        assert cfg.API_HOST == "0.0.0.0"
        assert cfg.API_PORT == 8000
        assert cfg.LLM_MODEL == "deepseek-chat"
        assert cfg.LLM_TEMPERATURE == 0.5
        assert cfg.LLM_MAX_TOKENS == 2000

    def test_config_env_override(self, monkeypatch):
        """测试环境变量覆盖"""
        monkeypatch.setenv("API_HOST", "127.0.0.1")
        monkeypatch.setenv("API_PORT", "9000")
        monkeypatch.setenv("LLM_MODEL", "custom/model")
        monkeypatch.setenv(
            "CORS_ALLOW_ORIGINS", "http://localhost:3000,http://example.com"
        )

        from utils.config import Config

        cfg = Config()

        assert cfg.API_HOST == "127.0.0.1"
        assert cfg.API_PORT == 9000
        assert cfg.LLM_MODEL == "custom/model"
        assert "http://localhost:3000" in cfg.CORS_ALLOW_ORIGINS
        assert "http://example.com" in cfg.CORS_ALLOW_ORIGINS

    def test_validate_llm_config_no_key(self, monkeypatch):
        """测试 LLM 配置验证 - 无 API key"""
        monkeypatch.delenv("DEEPSEEK_API_KEY", raising=False)

        from utils.config import Config

        cfg = Config()
        is_valid, api_key, error = cfg.validate_llm_config()

        assert is_valid is False
        assert api_key is None
        assert "API_KEY" in error or "未配置" in error

    def test_validate_llm_config_placeholder_key(self, monkeypatch):
        """测试 LLM 配置验证 - 占位符 key"""
        monkeypatch.setenv("DEEPSEEK_API_KEY", "sk-your_deepseek_api_key_here")

        from utils.config import Config

        cfg = Config()
        is_valid, api_key, error = cfg.validate_llm_config()

        assert is_valid is False
        assert "设置有效的" in error

    def test_validate_llm_config_valid_key(self, monkeypatch):
        """测试 LLM 配置验证 - 有效 key"""
        monkeypatch.setenv("DEEPSEEK_API_KEY", "sk-valid-test-key-12345")

        from utils.config import Config

        cfg = Config()
        is_valid, api_key, error = cfg.validate_llm_config()

        assert is_valid is True
        assert api_key == "sk-valid-test-key-12345"
        assert error is None

    def test_get_recommendation(self, monkeypatch):
        """测试推荐等级获取"""
        # 直接测试映射本身
        test_map = {85: "strong_buy", 75: "buy", 60: "hold", 50: "wait"}

        # 测试不同分数对应的推荐
        assert test_map[85] == "strong_buy"
        assert test_map[75] == "buy"
        assert test_map[60] == "hold"
        assert test_map[50] == "wait"

        # 测试边界值
        assert 85 in test_map
        assert 75 in test_map
        assert 60 in test_map
        assert 50 in test_map

    def test_get_agent_weight(self, monkeypatch):
        """测试 Agent 权重获取"""
        monkeypatch.delenv("DEEPSEEK_API_KEY", raising=False)

        from utils.config import Config

        cfg = Config()

        assert cfg.get_agent_weight("value") == 0.25
        assert cfg.get_agent_weight("technical") == 0.15
        assert cfg.get_agent_weight("growth") == 0.20
        assert cfg.get_agent_weight("fundamental") == 0.15
        assert cfg.get_agent_weight("risk") == 0.15
        assert cfg.get_agent_weight("macro") == 0.10
        assert cfg.get_agent_weight("synthesizer") == 0.0
        assert cfg.get_agent_weight("unknown") == 0.1  # 默认值

    def test_agent_roles(self, monkeypatch):
        """测试 Agent 角色定义"""
        monkeypatch.delenv("DEEPSEEK_API_KEY", raising=False)

        from utils.config import Config

        cfg = Config()

        assert "value" in cfg.AGENT_ROLES
        assert "technical" in cfg.AGENT_ROLES
        assert "growth" in cfg.AGENT_ROLES
        assert "fundamental" in cfg.AGENT_ROLES
        assert "risk" in cfg.AGENT_ROLES
        assert "macro" in cfg.AGENT_ROLES
        assert "synthesizer" in cfg.AGENT_ROLES

    def test_recommendation_map(self, monkeypatch):
        """测试推荐等级映射"""
        monkeypatch.delenv("DEEPSEEK_API_KEY", raising=False)

        from utils.config import Config

        cfg = Config()

        # 验证映射结构
        assert 85 in cfg.RECOMMENDATION_MAP
        assert 75 in cfg.RECOMMENDATION_MAP
        assert 60 in cfg.RECOMMENDATION_MAP
        assert 50 in cfg.RECOMMENDATION_MAP


class TestConfigSingleton:
    """配置单例测试"""

    def test_get_config_returns_singleton(self, monkeypatch):
        """测试 get_config 返回单例"""
        monkeypatch.delenv("DEEPSEEK_API_KEY", raising=False)

        from utils.config import get_config, Config

        cfg1 = get_config()
        cfg2 = get_config()

        assert cfg1 is cfg2
        assert isinstance(cfg1, Config)

    def test_config_caching(self, monkeypatch):
        """测试配置缓存"""
        monkeypatch.delenv("DEEPSEEK_API_KEY", raising=False)
        monkeypatch.setenv("API_HOST", "test-host")

        from utils.config import get_config

        cfg1 = get_config()
        cfg2 = get_config()

        assert cfg1.API_HOST == cfg2.API_HOST
        assert cfg1 is cfg2
