"""
Redis 任务存储模块

提供基于 Redis 的任务状态持久化存储，支持:
- 任务创建、更新、完成、失败
- TTL 自动过期清理
- 多实例共享任务状态

依赖:
- redis>=5.0.0
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, Optional
from dataclasses import dataclass, asdict
import redis

logger = logging.getLogger(__name__)


@dataclass
class TaskData:
    """任务数据结构"""

    symbol: str
    market: str
    status: str = "pending"
    progress: int = 0
    stage: str = "starting"
    message: str = "开始分析..."
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: str = ""
    updated_at: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TaskData":
        return cls(**data)


class RedisTaskStore:
    """
    Redis 任务存储类

    使用 Redis Hash 存储任务数据，支持:
    - 任务状态的增删改查
    - TTL 自动过期 (默认 1 小时)
    - JSON 序列化/反序列化
    """

    _instance: Optional["RedisTaskStore"] = None
    _redis: Optional[redis.Redis] = None

    # 配置
    KEY_PREFIX = "stock_analysis:task:"
    DEFAULT_TTL = 3600  # 1 小时
    MAX_TASKS = 500  # 最大任务数

    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        """
        初始化 Redis 任务存储

        Args:
            redis_url: Redis 连接 URL
        """
        self.redis_url = redis_url
        self._connect()

    def _connect(self) -> None:
        """建立 Redis 连接"""
        try:
            self._redis = redis.from_url(
                self.redis_url,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
            )
            # 测试连接
            self._redis.ping()
            logger.info(f"[RedisTaskStore] 已连接到 Redis: {self.redis_url}")
        except redis.ConnectionError as e:
            logger.warning(f"[RedisTaskStore] Redis 连接失败: {e}")
            logger.warning("[RedisTaskStore] 将使用内存存储作为后备")
            self._redis = None

    @classmethod
    def get_instance(
        cls, redis_url: str = "redis://localhost:6379/0"
    ) -> "RedisTaskStore":
        """获取单例实例"""
        if cls._instance is None:
            cls._instance = cls(redis_url)
        return cls._instance

    def _get_key(self, job_id: str) -> str:
        """生成 Redis key"""
        return f"{self.KEY_PREFIX}{job_id}"

    def _get_job_ids_key(self) -> str:
        """获取任务 ID 集合的 key"""
        return f"{self.KEY_PREFIX}ids"

    def create(self, job_id: str, task: TaskData) -> bool:
        """
        创建新任务

        Args:
            job_id: 任务 ID
            task: 任务数据

        Returns:
            是否创建成功
        """
        if self._redis is None:
            logger.warning("[RedisTaskStore] Redis 未连接，无法创建任务")
            return False

        try:
            now = datetime.now().isoformat()
            task.created_at = now
            task.updated_at = now

            key = self._get_key(job_id)
            job_ids_key = self._get_job_ids_key()

            # 使用事务确保原子性
            pipe = self._redis.pipeline()
            pipe.hset(key, mapping=task.to_dict())
            pipe.expire(key, self.DEFAULT_TTL)
            pipe.sadd(job_ids_key, job_id)
            pipe.expire(job_ids_key, self.DEFAULT_TTL)
            pipe.execute()

            # 清理过期任务
            self._cleanup_expired()

            logger.info(f"[RedisTaskStore] 创建任务成功: {job_id}")
            return True
        except redis.RedisError as e:
            logger.error(f"[RedisTaskStore] 创建任务失败: {e}")
            return False

    def get(self, job_id: str) -> Optional[TaskData]:
        """
        获取任务

        Args:
            job_id: 任务 ID

        Returns:
            任务数据，不存在返回 None
        """
        if self._redis is None:
            return None

        try:
            key = self._get_key(job_id)
            data = self._redis.hgetall(key)

            if not data:
                return None

            return TaskData.from_dict(data)
        except redis.RedisError as e:
            logger.error(f"[RedisTaskStore] 获取任务失败: {e}")
            return None

    def update(self, job_id: str, **kwargs) -> bool:
        """
        更新任务

        Args:
            job_id: 任务 ID
            **kwargs: 要更新的字段

        Returns:
            是否更新成功
        """
        if self._redis is None:
            return False

        try:
            key = self._get_key(job_id)
            kwargs["updated_at"] = datetime.now().isoformat()

            self._redis.hset(key, mapping=kwargs)
            self._redis.expire(key, self.DEFAULT_TTL)

            return True
        except redis.RedisError as e:
            logger.error(f"[RedisTaskStore] 更新任务失败: {e}")
            return False

    def complete(self, job_id: str, result: Dict[str, Any]) -> bool:
        """
        完成任务

        Args:
            job_id: 任务 ID
            result: 分析结果

        Returns:
            是否完成成功
        """
        if self._redis is None:
            return False

        try:
            key = self._get_key(job_id)
            now = datetime.now().isoformat()

            self._redis.hset(
                key,
                mapping={
                    "status": "completed",
                    "progress": 100,
                    "stage": "complete",
                    "message": "分析完成!",
                    "result": json.dumps(result),
                    "updated_at": now,
                },
            )

            logger.info(f"[RedisTaskStore] 任务完成: {job_id}")
            return True
        except redis.RedisError as e:
            logger.error(f"[RedisTaskStore] 完成任务失败: {e}")
            return False

    def fail(self, job_id: str, error: str) -> bool:
        """
        标记任务失败

        Args:
            job_id: 任务 ID
            error: 错误信息

        Returns:
            是否标记成功
        """
        if self._redis is None:
            return False

        try:
            key = self._get_key(job_id)
            now = datetime.now().isoformat()

            self._redis.hset(
                key,
                mapping={
                    "status": "failed",
                    "stage": "error",
                    "message": f"错误: {error}",
                    "error": error,
                    "updated_at": now,
                },
            )

            logger.info(f"[RedisTaskStore] 任务失败: {job_id}, error: {error}")
            return True
        except redis.RedisError as e:
            logger.error(f"[RedisTaskStore] 标记任务失败: {e}")
            return False

    def delete(self, job_id: str) -> bool:
        """
        删除任务

        Args:
            job_id: 任务 ID

        Returns:
            是否删除成功
        """
        if self._redis is None:
            return False

        try:
            key = self._get_key(job_id)
            job_ids_key = self._get_job_ids_key()

            pipe = self._redis.pipeline()
            pipe.delete(key)
            pipe.srem(job_ids_key, job_id)
            pipe.execute()

            logger.info(f"[RedisTaskStore] 删除任务: {job_id}")
            return True
        except redis.RedisError as e:
            logger.error(f"[RedisTaskStore] 删除任务失败: {e}")
            return False

    def list_all(self) -> Dict[str, TaskData]:
        """
        获取所有任务

        Returns:
            job_id -> TaskData 的映射
        """
        if self._redis is None:
            return {}

        try:
            job_ids_key = self._get_job_ids_key()
            job_ids = self._redis.smembers(job_ids_key)

            result = {}
            for job_id in job_ids:
                task = self.get(job_id)
                if task:
                    result[job_id] = task

            return result
        except redis.RedisError as e:
            logger.error(f"[RedisTaskStore] 列出任务失败: {e}")
            return {}

    def _cleanup_expired(self) -> int:
        """
        清理过期任务

        Returns:
            清理的任务数量
        """
        if self._redis is None:
            return 0

        try:
            job_ids_key = self._get_job_ids_key()
            job_ids = self._redis.smembers(job_ids_key)

            expired_count = 0
            for job_id in job_ids:
                key = self._get_key(job_id)
                ttl = self._redis.ttl(key)
                if ttl == -1:  # 没有设置 TTL
                    self._redis.expire(key, self.DEFAULT_TTL)
                elif ttl == -2:  # 已过期
                    pipe = self._redis.pipeline()
                    pipe.delete(key)
                    pipe.srem(job_ids_key, job_id)
                    pipe.execute()
                    expired_count += 1

            if expired_count > 0:
                logger.info(f"[RedisTaskStore] 清理了 {expired_count} 个过期任务")

            return expired_count
        except redis.RedisError as e:
            logger.error(f"[RedisTaskStore] 清理过期任务失败: {e}")
            return 0

    def is_available(self) -> bool:
        """检查 Redis 是否可用"""
        if self._redis is None:
            return False
        try:
            self._redis.ping()
            return True
        except redis.RedisError:
            return False


class MemoryTaskStore:
    """
    内存任务存储（Redis 不可用时的后备）

    警告：此实现不支持多进程/多实例共享
    """

    def __init__(self):
        self.jobs: Dict[str, TaskData] = {}
        self.max_jobs = 500
        self.job_ttl = 3600

    def create(self, job_id: str, task: TaskData) -> bool:
        now = datetime.now().isoformat()
        task.created_at = now
        task.updated_at = now
        self.jobs[job_id] = task
        self._cleanup_expired()
        return True

    def get(self, job_id: str) -> Optional[TaskData]:
        task = self.jobs.get(job_id)
        if task:
            self._check_ttl(job_id, task)
        return task

    def update(self, job_id: str, **kwargs) -> bool:
        if job_id not in self.jobs:
            return False
        task = self.jobs[job_id]
        for key, value in kwargs.items():
            setattr(task, key, value)
        task.updated_at = datetime.now().isoformat()
        return True

    def complete(self, job_id: str, result: Dict[str, Any]) -> bool:
        if job_id not in self.jobs:
            return False
        task = self.jobs[job_id]
        task.status = "completed"
        task.progress = 100
        task.stage = "complete"
        task.message = "分析完成!"
        task.result = result
        task.updated_at = datetime.now().isoformat()
        return True

    def fail(self, job_id: str, error: str) -> bool:
        if job_id not in self.jobs:
            return False
        task = self.jobs[job_id]
        task.status = "failed"
        task.stage = "error"
        task.message = f"错误: {error}"
        task.error = error
        task.updated_at = datetime.now().isoformat()
        return True

    def delete(self, job_id: str) -> bool:
        if job_id in self.jobs:
            del self.jobs[job_id]
            return True
        return False

    def list_all(self) -> Dict[str, TaskData]:
        return self.jobs.copy()

    def _check_ttl(self, job_id: str, task: TaskData) -> None:
        """检查任务是否过期"""
        if task.created_at:
            created = datetime.fromisoformat(task.created_at)
            if (datetime.now() - created).total_seconds() > self.job_ttl:
                del self.jobs[job_id]

    def _cleanup_expired(self) -> int:
        """清理过期任务"""
        expired = []
        for job_id, task in self.jobs.items():
            if task.created_at:
                created = datetime.fromisoformat(task.created_at)
                if (datetime.now() - created).total_seconds() > self.job_ttl:
                    expired.append(job_id)
        for job_id in expired:
            del self.jobs[job_id]
        return len(expired)

    def is_available(self) -> bool:
        return True


def get_task_store(redis_url: str = "redis://localhost:6379/0"):
    """
    获取任务存储实例

    Args:
        redis_url: Redis 连接 URL

    Returns:
        RedisTaskStore 或 MemoryTaskStore 实例
    """
    redis_store = RedisTaskStore.get_instance(redis_url)
    if redis_store.is_available():
        return redis_store
    logger.warning("[TaskStore] 使用内存存储作为后备")
    return MemoryTaskStore()
