"""
LLM Provider Integration Tests

Tests to verify each LLM provider can work correctly.
By default, tests use mocking to avoid real API calls and token costs.
Set RUN_LLM_TESTS=1 to run real API tests.

Run with:
    # Mock tests only (fast, no cost)
    python -m pytest tests/test_llm_providers.py -v

    # Real API tests (uses tokens, requires valid API keys)
    RUN_LLM_TESTS=1 python -m pytest tests/test_llm_providers.py -v
"""

import pytest
import os
import litellm
from unittest.mock import patch
from dotenv import load_dotenv
from pathlib import Path


# Load environment variables
project_root = Path(__file__).parent.parent.parent
env_local_path = project_root / ".env.local"
if env_local_path.exists():
    load_dotenv(env_local_path, override=True)


# Control whether to run real API tests
RUN_LLM_TESTS = os.getenv("RUN_LLM_TESTS", "0").lower() in ["1", "true", "yes"]


def check_api_key(provider: str) -> bool:
    """Check if API key is configured for provider"""
    env_keys = {
        "deepseek": "DEEPSEEK_API_KEY",
        "minimax": "MINIMAX_API_KEY",
        "zhipu": "ZHIPU_API_KEY",
        "qwen": "QWEN_API_KEY",
    }
    key = os.getenv(env_keys.get(provider, ""))
    return key and key not in [
        "sk-your_deepseek_api_key_here",
        "sk-your_minimax_api_key_here",
        "sk-your_zhipu_api_key_here",
        "sk-your_qwen_api_key_here",
    ]


def create_mock_response(content: str) -> dict:
    """Create a mock litellm response"""
    return {
        "choices": [
            {
                "message": {"content": content, "role": "assistant"},
                "finish_reason": "stop",
            }
        ],
        "usage": {"prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30},
    }


class TestDeepSeekProvider:
    """Test DeepSeek provider"""

    @pytest.fixture
    def mock_completion(self):
        """Create mock for litellm.completion"""
        with patch("litellm.completion") as mock:
            mock.return_value = create_mock_response(
                "我是 DeepSeek，一个由 DeepSeek 公司开发的 AI 助手。"
            )
            yield mock

    def test_deepseek_config(self):
        """Test DeepSeek configuration is correct"""
        from utils.config import config

        cfg = config()
        cfg.set_provider("deepseek")
        llm_config = cfg.get_llm_config()

        assert llm_config["provider"] == "deepseek"
        assert llm_config["model"] == "deepseek-chat"
        assert "deepseek" in llm_config["api_base"]
        assert "api_key" in llm_config

    def test_deepseek_basic_completion_mock(self, mock_completion):
        """Test DeepSeek basic completion with mock"""
        from utils.config import config

        cfg = config()
        cfg.set_provider("deepseek")
        llm_config = cfg.get_llm_config()

        response = litellm.completion(
            model=llm_config["model"],
            messages=[{"role": "user", "content": "你好，请简单介绍一下你自己"}],
            temperature=0.7,
            api_key=llm_config["api_key"],
            api_base=llm_config["api_base"],
            custom_llm_provider="openai",
        )

        assert response is not None
        assert "choices" in response
        content = response["choices"][0]["message"]["content"]
        assert len(content) > 0
        mock_completion.assert_called_once()

    @pytest.mark.skipif(
        not RUN_LLM_TESTS or not check_api_key("deepseek"),
        reason="Set RUN_LLM_TESTS=1 and configure DEEPSEEK_API_KEY to run real tests",
    )
    def test_deepseek_basic_completion_real(self):
        """Test DeepSeek basic completion with real API (uses tokens!)"""
        from utils.config import config

        cfg = config()
        cfg.set_provider("deepseek")
        llm_config = cfg.get_llm_config()

        response = litellm.completion(
            model=llm_config["model"],
            messages=[{"role": "user", "content": "你好，请简单介绍一下你自己"}],
            temperature=0.7,
            api_key=llm_config["api_key"],
            api_base=llm_config["api_base"],
            custom_llm_provider="openai",
        )

        assert response is not None
        assert "choices" in response
        content = response["choices"][0]["message"]["content"]
        assert len(content) > 0
        print(f"DeepSeek response: {content[:100]}...")


class TestMiniMaxProvider:
    """Test MiniMax provider"""

    @pytest.fixture
    def mock_completion(self):
        """Create mock for litellm.completion"""
        with patch("litellm.completion") as mock:
            mock.return_value = create_mock_response("我是 MiniMax，一个 AI 助手。")
            yield mock

    def test_minimax_config(self):
        """Test MiniMax configuration is correct"""
        from utils.config import config

        cfg = config()
        cfg.set_provider("minimax")
        llm_config = cfg.get_llm_config()

        assert llm_config["provider"] == "minimax"
        assert llm_config["model"] == "minimax-m2"
        assert "minimax" in llm_config["api_base"]
        assert "api_key" in llm_config

    def test_minimax_basic_completion_mock(self, mock_completion):
        """Test MiniMax basic completion with mock"""
        from utils.config import config

        cfg = config()
        cfg.set_provider("minimax")
        llm_config = cfg.get_llm_config()

        response = litellm.completion(
            model=llm_config["model"],
            messages=[{"role": "user", "content": "你好，请简单介绍一下你自己"}],
            temperature=0.7,
            api_key=llm_config["api_key"],
            api_base=llm_config["api_base"],
            custom_llm_provider="openai",
        )

        assert response is not None
        assert "choices" in response
        content = response["choices"][0]["message"]["content"]
        assert len(content) > 0
        mock_completion.assert_called_once()

    @pytest.mark.skipif(
        not RUN_LLM_TESTS or not check_api_key("minimax"),
        reason="Set RUN_LLM_TESTS=1 and configure MINIMAX_API_KEY to run real tests",
    )
    def test_minimax_basic_completion_real(self):
        """Test MiniMax basic completion with real API (uses tokens!)"""
        from utils.config import config

        cfg = config()
        cfg.set_provider("minimax")
        llm_config = cfg.get_llm_config()

        response = litellm.completion(
            model=llm_config["model"],
            messages=[{"role": "user", "content": "你好，请简单介绍一下你自己"}],
            temperature=0.7,
            api_key=llm_config["api_key"],
            api_base=llm_config["api_base"],
            custom_llm_provider="openai",
        )

        assert response is not None
        assert "choices" in response
        content = response["choices"][0]["message"]["content"]
        assert len(content) > 0
        print(f"MiniMax response: {content[:100]}...")


class TestZhipuProvider:
    """Test 智谱AI (ChatGLM) provider"""

    @pytest.fixture
    def mock_completion(self):
        """Create mock for litellm.completion"""
        with patch("litellm.completion") as mock:
            mock.return_value = create_mock_response(
                "我是智谱清言，一个由智谱 AI 公司开发的 AI 助手。"
            )
            yield mock

    def test_zhipu_config(self):
        """Test Zhipu configuration is correct"""
        from utils.config import config

        cfg = config()
        cfg.set_provider("zhipu")
        llm_config = cfg.get_llm_config()

        assert llm_config["provider"] == "zhipu"
        assert llm_config["model"] == "glm-4"
        assert "bigmodel" in llm_config["api_base"]
        assert "api_key" in llm_config

    def test_zhipu_basic_completion_mock(self, mock_completion):
        """Test Zhipu basic completion with mock"""
        from utils.config import config

        cfg = config()
        cfg.set_provider("zhipu")
        llm_config = cfg.get_llm_config()

        response = litellm.completion(
            model=llm_config["model"],
            messages=[{"role": "user", "content": "你好，请简单介绍一下你自己"}],
            temperature=0.7,
            api_key=llm_config["api_key"],
            api_base=llm_config["api_base"],
            custom_llm_provider="openai",
        )

        assert response is not None
        assert "choices" in response
        content = response["choices"][0]["message"]["content"]
        assert len(content) > 0
        mock_completion.assert_called_once()

    @pytest.mark.skipif(
        not RUN_LLM_TESTS or not check_api_key("zhipu"),
        reason="Set RUN_LLM_TESTS=1 and configure ZHIPU_API_KEY to run real tests",
    )
    def test_zhipu_basic_completion_real(self):
        """Test Zhipu basic completion with real API (uses tokens!)"""
        from utils.config import config

        cfg = config()
        cfg.set_provider("zhipu")
        llm_config = cfg.get_llm_config()

        response = litellm.completion(
            model=llm_config["model"],
            messages=[{"role": "user", "content": "你好，请简单介绍一下你自己"}],
            temperature=0.7,
            api_key=llm_config["api_key"],
            api_base=llm_config["api_base"],
            custom_llm_provider="openai",
        )

        assert response is not None
        assert "choices" in response
        content = response["choices"][0]["message"]["content"]
        assert len(content) > 0
        print(f"Zhipu response: {content[:100]}...")


class TestQwenProvider:
    """Test 阿里千问 (Qwen) provider"""

    @pytest.fixture
    def mock_completion(self):
        """Create mock for litellm.completion"""
        with patch("litellm.completion") as mock:
            mock.return_value = create_mock_response(
                "我是通义千问，一个由阿里巴巴开发的 AI 助手。"
            )
            yield mock

    def test_qwen_config(self):
        """Test Qwen configuration is correct"""
        from utils.config import config

        cfg = config()
        cfg.set_provider("qwen")
        llm_config = cfg.get_llm_config()

        assert llm_config["provider"] == "qwen"
        assert llm_config["model"] == "qwen-max"
        assert "dashscope" in llm_config["api_base"]
        assert "api_key" in llm_config

    def test_qwen_basic_completion_mock(self, mock_completion):
        """Test Qwen basic completion with mock"""
        from utils.config import config

        cfg = config()
        cfg.set_provider("qwen")
        llm_config = cfg.get_llm_config()

        response = litellm.completion(
            model=llm_config["model"],
            messages=[{"role": "user", "content": "你好，请简单介绍一下你自己"}],
            temperature=0.7,
            api_key=llm_config["api_key"],
            api_base=llm_config["api_base"],
            custom_llm_provider="openai",
        )

        assert response is not None
        assert "choices" in response
        content = response["choices"][0]["message"]["content"]
        assert len(content) > 0
        mock_completion.assert_called_once()

    @pytest.mark.skipif(
        not RUN_LLM_TESTS or not check_api_key("qwen"),
        reason="Set RUN_LLM_TESTS=1 and configure QWEN_API_KEY to run real tests",
    )
    def test_qwen_basic_completion_real(self):
        """Test Qwen basic completion with real API (uses tokens!)"""
        from utils.config import config

        cfg = config()
        cfg.set_provider("qwen")
        llm_config = cfg.get_llm_config()

        response = litellm.completion(
            model=llm_config["model"],
            messages=[{"role": "user", "content": "你好，请简单介绍一下你自己"}],
            temperature=0.7,
            api_key=llm_config["api_key"],
            api_base=llm_config["api_base"],
            custom_llm_provider="openai",
        )

        assert response is not None
        assert "choices" in response
        content = response["choices"][0]["message"]["content"]
        assert len(content) > 0
        print(f"Qwen response: {content[:100]}...")


class TestUnifiedLLM:
    """Test unified LLM wrapper"""

    def test_get_llm_config(self):
        """Test get_llm_config returns correct structure"""
        from utils.config import config

        cfg = config()
        llm_config = cfg.get_llm_config()

        assert "provider" in llm_config
        assert "model" in llm_config
        assert "api_key" in llm_config
        assert "api_base" in llm_config
        assert "temperature" in llm_config
        assert "max_tokens" in llm_config

    def test_set_provider(self):
        """Test set_provider changes configuration"""
        from utils.config import config

        cfg = config()

        # Test switching to minimax
        result = cfg.set_provider("minimax")
        assert result is True
        assert cfg.LLM_PROVIDER == "minimax"
        assert cfg.LLM_MODEL == "minimax-m2"

        # Test switching to zhipu
        result = cfg.set_provider("zhipu")
        assert result is True
        assert cfg.LLM_PROVIDER == "zhipu"
        assert cfg.LLM_MODEL == "glm-4"

        # Test switching to qwen
        result = cfg.set_provider("qwen")
        assert result is True
        assert cfg.LLM_PROVIDER == "qwen"
        assert cfg.LLM_MODEL == "qwen-max"

        # Test invalid provider
        result = cfg.set_provider("invalid_provider")
        assert result is False

    def test_get_available_providers(self):
        """Test get_available_providers returns all providers"""
        from utils.config import config

        cfg = config()
        providers = cfg.get_available_providers()

        assert len(providers) >= 4
        provider_ids = [p["id"] for p in providers]
        assert "deepseek" in provider_ids
        assert "minimax" in provider_ids
        assert "zhipu" in provider_ids
        assert "qwen" in provider_ids


if __name__ == "__main__":
    # Print configuration status
    print("=" * 60)
    print("LLM Provider Test Configuration Status")
    print("=" * 60)
    print(f"RUN_LLM_TESTS: {RUN_LLM_TESTS}")
    print()

    for provider in ["deepseek", "minimax", "zhipu", "qwen"]:
        status = "✓ Configured" if check_api_key(provider) else "✗ Not configured"
        print(f"  {provider}: {status}")

    print()
    print("=" * 60)
    print("Run tests with:")
    print("  # Mock tests only (fast, no cost)")
    print("  python -m pytest tests/test_llm_providers.py -v")
    print()
    print("  # Real API tests (uses tokens!)")
    print("  RUN_LLM_TESTS=1 python -m pytest tests/test_llm_providers.py -v")
    print("=" * 60)
