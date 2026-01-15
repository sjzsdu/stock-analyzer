"""
LLM Provider Integration Tests

Tests to verify each LLM provider can work correctly.
Requires API keys to be configured in .env.local

Run with:
    python -m pytest tests/test_llm_providers.py -v
"""

import pytest
import os
from dotenv import load_dotenv
from pathlib import Path


# Load environment variables
project_root = Path(__file__).parent.parent.parent
env_local_path = project_root / ".env.local"
if env_local_path.exists():
    load_dotenv(env_local_path, override=True)


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


class TestDeepSeekProvider:
    """Test DeepSeek provider"""

    @pytest.mark.skipif(
        not check_api_key("deepseek"), reason="DeepSeek API key not configured"
    )
    def test_deepseek_basic_completion(self):
        """Test DeepSeek basic completion"""
        from utils.config import config
        import litellm

        cfg = config()
        cfg.set_provider("deepseek")
        llm_config = cfg.get_llm_config()

        response = litellm.completion(
            model=llm_config["model"],
            messages=[{"role": "user", "content": "你好，请简单介绍一下你自己"}],
            temperature=0.7,
            api_key=llm_config["api_key"],
            api_base=llm_config["api_base"],
        )

        assert response is not None
        assert "choices" in response
        assert len(response["choices"]) > 0
        content = response["choices"][0]["message"]["content"]
        assert len(content) > 0
        print(f"DeepSeek response: {content[:100]}...")

    @pytest.mark.skipif(
        not check_api_key("deepseek"), reason="DeepSeek API key not configured"
    )
    def test_deepseek_stock_analysis_prompt(self):
        """Test DeepSeek with stock analysis prompt"""
        from utils.config import config
        import litellm

        cfg = config()
        cfg.set_provider("deepseek")
        llm_config = cfg.get_llm_config()

        prompt = """分析以下股票信息，给出简短的估值建议：
股票代码: 000001
当前价格: 12.5元
PE: 6.5
请直接回复"估值合理"或"估值偏高"或"估值偏低"
"""

        response = litellm.completion(
            model=llm_config["model"],
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            api_key=llm_config["api_key"],
            api_base=llm_config["api_base"],
            max_tokens=100,
        )

        assert response is not None
        content = response["choices"][0]["message"]["content"]
        print(f"DeepSeek stock analysis: {content}")
        assert "估值" in content


class TestMiniMaxProvider:
    """Test MiniMax provider"""

    @pytest.mark.skipif(
        not check_api_key("minimax"), reason="MiniMax API key not configured"
    )
    def test_minimax_basic_completion(self):
        """Test MiniMax basic completion"""
        from utils.config import config
        import litellm

        cfg = config()
        cfg.set_provider("minimax")
        llm_config = cfg.get_llm_config()

        response = litellm.completion(
            model=llm_config["model"],
            messages=[{"role": "user", "content": "你好，请简单介绍一下你自己"}],
            temperature=0.7,
            api_key=llm_config["api_key"],
            api_base=llm_config["api_base"],
        )

        assert response is not None
        assert "choices" in response
        content = response["choices"][0]["message"]["content"]
        assert len(content) > 0
        print(f"MiniMax response: {content[:100]}...")

    @pytest.mark.skipif(
        not check_api_key("minimax"), reason="MiniMax API key not configured"
    )
    def test_minimax_stock_analysis_prompt(self):
        """Test MiniMax with stock analysis prompt"""
        from utils.config import config
        import litellm

        cfg = config()
        cfg.set_provider("minimax")
        llm_config = cfg.get_llm_config()

        prompt = """分析以下股票信息，给出简短的估值建议：
股票代码: 000001
当前价格: 12.5元
PE: 6.5
请直接回复"估值合理"或"估值偏高"或"估值偏低"
"""

        response = litellm.completion(
            model=llm_config["model"],
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            api_key=llm_config["api_key"],
            api_base=llm_config["api_base"],
            max_tokens=100,
        )

        assert response is not None
        content = response["choices"][0]["message"]["content"]
        print(f"MiniMax stock analysis: {content}")


class TestZhipuProvider:
    """Test 智谱AI (ChatGLM) provider"""

    @pytest.mark.skipif(
        not check_api_key("zhipu"), reason="Zhipu API key not configured"
    )
    def test_zhipu_basic_completion(self):
        """Test Zhipu basic completion"""
        from utils.config import config
        import litellm

        cfg = config()
        cfg.set_provider("zhipu")
        llm_config = cfg.get_llm_config()

        response = litellm.completion(
            model=llm_config["model"],
            messages=[{"role": "user", "content": "你好，请简单介绍一下你自己"}],
            temperature=0.7,
            api_key=llm_config["api_key"],
            api_base=llm_config["api_base"],
        )

        assert response is not None
        assert "choices" in response
        content = response["choices"][0]["message"]["content"]
        assert len(content) > 0
        print(f"Zhipu response: {content[:100]}...")

    @pytest.mark.skipif(
        not check_api_key("zhipu"), reason="Zhipu API key not configured"
    )
    def test_zhipu_stock_analysis_prompt(self):
        """Test Zhipu with stock analysis prompt"""
        from utils.config import config
        import litellm

        cfg = config()
        cfg.set_provider("zhipu")
        llm_config = cfg.get_llm_config()

        prompt = """分析以下股票信息，给出简短的估值建议：
股票代码: 000001
当前价格: 12.5元
PE: 6.5
请直接回复"估值合理"或"估值偏高"或"估值偏低"
"""

        response = litellm.completion(
            model=llm_config["model"],
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            api_key=llm_config["api_key"],
            api_base=llm_config["api_base"],
            max_tokens=100,
        )

        assert response is not None
        content = response["choices"][0]["message"]["content"]
        print(f"Zhipu stock analysis: {content}")


class TestQwenProvider:
    """Test 阿里千问 (Qwen) provider"""

    @pytest.mark.skipif(not check_api_key("qwen"), reason="Qwen API key not configured")
    def test_qwen_basic_completion(self):
        """Test Qwen basic completion"""
        from utils.config import config
        import litellm

        cfg = config()
        cfg.set_provider("qwen")
        llm_config = cfg.get_llm_config()

        response = litellm.completion(
            model=llm_config["model"],
            messages=[{"role": "user", "content": "你好，请简单介绍一下你自己"}],
            temperature=0.7,
            api_key=llm_config["api_key"],
            api_base=llm_config["api_base"],
        )

        assert response is not None
        assert "choices" in response
        content = response["choices"][0]["message"]["content"]
        assert len(content) > 0
        print(f"Qwen response: {content[:100]}...")

    @pytest.mark.skipif(not check_api_key("qwen"), reason="Qwen API key not configured")
    def test_qwen_stock_analysis_prompt(self):
        """Test Qwen with stock analysis prompt"""
        from utils.config import config
        import litellm

        cfg = config()
        cfg.set_provider("qwen")
        llm_config = cfg.get_llm_config()

        prompt = """分析以下股票信息，给出简短的估值建议：
股票代码: 000001
当前价格: 12.5元
PE: 6.5
请直接回复"估值合理"或"估值偏高"或"估值偏低"
"""

        response = litellm.completion(
            model=llm_config["model"],
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            api_key=llm_config["api_key"],
            api_base=llm_config["api_base"],
            max_tokens=100,
        )

        assert response is not None
        content = response["choices"][0]["message"]["content"]
        print(f"Qwen stock analysis: {content}")


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


class TestProviderComparison:
    """Comparison tests for all providers"""

    @pytest.mark.skipif(
        not all(check_api_key(p) for p in ["deepseek", "minimax"]),
        reason="Multiple API keys required",
    )
    def test_response_time_comparison(self):
        """Compare response times between providers"""
        import time
        from utils.config import config
        import litellm

        cfg = config()
        prompt = "请用一句话回答：1+1等于几？"
        results = {}

        for provider in ["deepseek", "minimax"]:
            cfg.set_provider(provider)
            llm_config = cfg.get_llm_config()

            start = time.time()
            try:
                response = litellm.completion(
                    model=llm_config["model"],
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.1,
                    max_tokens=50,
                    api_key=llm_config["api_key"],
                    api_base=llm_config["api_base"],
                )
                elapsed = time.time() - start
                results[provider] = {
                    "success": True,
                    "time": elapsed,
                    "content": response["choices"][0]["message"]["content"],
                }
            except Exception as e:
                results[provider] = {"success": False, "error": str(e)}

        print(f"\nProvider comparison:")
        for provider, result in results.items():
            if result["success"]:
                print(f"  {provider}: {result['time']:.2f}s - {result['content']}")
            else:
                print(f"  {provider}: FAILED - {result['error']}")


if __name__ == "__main__":
    # Print configuration status
    print("=" * 60)
    print("LLM Provider Test Configuration Status")
    print("=" * 60)

    for provider in ["deepseek", "minimax", "zhipu", "qwen"]:
        status = "✓ Configured" if check_api_key(provider) else "✗ Not configured"
        print(f"  {provider}: {status}")

    print("=" * 60)
    print("Run tests with: python -m pytest tests/test_llm_providers.py -v")
