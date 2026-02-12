"""
Rate Limiting Middleware - Anti-DDoS Protection
"""
from flask import request, jsonify
from functools import wraps
from ...infra.cache.redis_service import RedisService
import time


class RateLimiter:
    """Rate limiter using Redis"""
    
    def __init__(self, redis_service: RedisService):
        self.redis = redis_service
    
    def limit(self, max_requests: int, window_seconds: int):
        """
        Decorator to limit requests per IP
        
        Usage:
            @rate_limiter.limit(max_requests=5, window_seconds=60)
            def login():
                ...
        """
        def decorator(f):
            @wraps(f)
            def wrapped(*args, **kwargs):
                # Get client IP
                ip = request.headers.get('X-Forwarded-For', request.remote_addr)
                key = f"rate_limit:{ip}:{request.endpoint}"
                
                # Check current count
                current = self.redis.get(key)
                
                if current is None:
                    # First request in window
                    self.redis.set(key, 1, ttl=window_seconds)
                elif int(current) >= max_requests:
                    # Rate limit exceeded
                    return jsonify({
                        "error": "Rate limit exceeded",
                        "retry_after": window_seconds
                    }), 429
                else:
                    # Increment counter
                    self.redis.increment(key)
                
                return f(*args, **kwargs)
            
            return wrapped
        return decorator


# Global instance (initialized in app factory)
rate_limiter = None


def init_rate_limiter(redis_service: RedisService):
    """Initialize rate limiter with Redis service"""
    global rate_limiter
    rate_limiter = RateLimiter(redis_service)
    return rate_limiter
