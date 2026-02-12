"""
Redis Cache Service - Infrastructure Layer
"""
import redis
import json
from typing import Any, Optional
import os


class RedisService:
    """Redis client for caching and queuing"""
    
    def __init__(self):
        self.client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            db=0,
            decode_responses=True
        )
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        value = self.client.get(key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        return None
    
    def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Set value in cache with TTL (default 1 hour)"""
        try:
            serialized = json.dumps(value) if not isinstance(value, str) else value
            return self.client.setex(key, ttl, serialized)
        except Exception as e:
            print(f"Redis set error: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        return self.client.delete(key) > 0
    
    def exists(self, key: str) -> bool:
        """Check if key exists"""
        return self.client.exists(key) > 0
    
    def increment(self, key: str, amount: int = 1) -> int:
        """Increment counter"""
        return self.client.incrby(key, amount)
    
    def push_to_queue(self, queue_name: str, data: dict) -> bool:
        """Push task to queue (for Celery)"""
        try:
            serialized = json.dumps(data)
            self.client.rpush(queue_name, serialized)
            return True
        except Exception as e:
            print(f"Queue push error: {e}")
            return False
