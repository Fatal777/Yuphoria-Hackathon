"""
Redis client for session state and conversation memory
"""
import redis.asyncio as redis
import json
import asyncio
from typing import Optional, Dict, List, Any
from config import settings
from utils.logger import logger


class RedisClient:
    """Async Redis client with connection pooling"""
    
    def __init__(self):
        self.redis: Optional[redis.Redis] = None
        self.pool: Optional[redis.ConnectionPool] = None
    
    async def connect(self):
        """Initialize Redis connection with retry logic"""
        max_retries = 3
        retry_delay = 1
        
        for attempt in range(max_retries):
            try:
                self.pool = redis.ConnectionPool.from_url(
                    settings.REDIS_URL,
                    max_connections=10,
                    decode_responses=True
                )
                self.redis = redis.Redis(connection_pool=self.pool)
                await self.redis.ping()
                logger.info("Redis connection established successfully")
                return
            except Exception as e:
                logger.error(f"Redis connection attempt {attempt + 1} failed: {str(e)}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay * (2 ** attempt))
                else:
                    logger.error("Failed to connect to Redis after all retries")
                    raise
    
    async def disconnect(self):
        """Close Redis connection"""
        if self.redis:
            await self.redis.close()
        if self.pool:
            await self.pool.disconnect()
        logger.info("Redis connection closed")
    
    async def is_healthy(self) -> bool:
        """Check Redis connection health"""
        try:
            if not self.redis:
                return False
            await asyncio.wait_for(self.redis.ping(), timeout=2.0)
            return True
        except Exception as e:
            logger.error(f"Redis health check failed: {str(e)}")
            return False
    
    # Room Management
    async def set_room(self, room_id: str, data: Dict[str, Any], ttl: int = None) -> bool:
        """Store room metadata"""
        try:
            key = f"room:{room_id}"
            value = json.dumps(data)
            ttl = ttl or settings.ROOM_TTL
            await self.redis.setex(key, ttl, value)
            logger.info(f"Room {room_id} stored with TTL {ttl}s")
            return True
        except Exception as e:
            logger.error(f"Failed to store room {room_id}: {str(e)}")
            return False
    
    async def get_room(self, room_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve room metadata"""
        try:
            key = f"room:{room_id}"
            value = await self.redis.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Failed to retrieve room {room_id}: {str(e)}")
            return None
    
    async def delete_room(self, room_id: str) -> bool:
        """Delete room data"""
        try:
            key = f"room:{room_id}"
            await self.redis.delete(key)
            logger.info(f"Room {room_id} deleted")
            return True
        except Exception as e:
            logger.error(f"Failed to delete room {room_id}: {str(e)}")
            return False
    
    async def update_room_participants(self, room_id: str, participants: List[str]) -> bool:
        """Update room participants list"""
        try:
            room = await self.get_room(room_id)
            if room:
                room["participants"] = participants
                return await self.set_room(room_id, room)
            return False
        except Exception as e:
            logger.error(f"Failed to update participants for room {room_id}: {str(e)}")
            return False
    
    # Conversation Management
    async def set_conversation(self, room_id: str, messages: List[Dict[str, Any]], ttl: int = None) -> bool:
        """Store conversation history"""
        try:
            key = f"conversation:{room_id}"
            value = json.dumps(messages)
            ttl = ttl or settings.CONVERSATION_TTL
            await self.redis.setex(key, ttl, value)
            return True
        except Exception as e:
            logger.error(f"Failed to store conversation for room {room_id}: {str(e)}")
            return False
    
    async def get_conversation(self, room_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Retrieve conversation history"""
        try:
            key = f"conversation:{room_id}"
            value = await self.redis.get(key)
            if value:
                messages = json.loads(value)
                return messages[-limit:] if len(messages) > limit else messages
            return []
        except Exception as e:
            logger.error(f"Failed to retrieve conversation for room {room_id}: {str(e)}")
            return []
    
    async def append_message(self, room_id: str, message: Dict[str, Any]) -> bool:
        """Add single message to conversation"""
        try:
            conversation = await self.get_conversation(room_id, limit=1000)
            conversation.append(message)
            return await self.set_conversation(room_id, conversation)
        except Exception as e:
            logger.error(f"Failed to append message to room {room_id}: {str(e)}")
            return False
    
    # Session History
    async def set_session_history(self, user_id: str, sessions: List[Dict[str, Any]], ttl: int = None) -> bool:
        """Store user session history"""
        try:
            key = f"sessions:{user_id}"
            value = json.dumps(sessions)
            ttl = ttl or settings.SESSION_HISTORY_TTL
            await self.redis.setex(key, ttl, value)
            return True
        except Exception as e:
            logger.error(f"Failed to store session history for user {user_id}: {str(e)}")
            return False
    
    async def get_session_history(self, user_id: str, offset: int = 0, limit: int = 20) -> List[Dict[str, Any]]:
        """Retrieve user session history with pagination"""
        try:
            key = f"sessions:{user_id}"
            value = await self.redis.get(key)
            if value:
                sessions = json.loads(value)
                # Sort by timestamp descending
                sessions.sort(key=lambda x: x.get("started_at", 0), reverse=True)
                return sessions[offset:offset + limit]
            return []
        except Exception as e:
            logger.error(f"Failed to retrieve session history for user {user_id}: {str(e)}")
            return []
    
    async def append_session(self, user_id: str, session: Dict[str, Any]) -> bool:
        """Add session to user history"""
        try:
            key = f"sessions:{user_id}"
            value = await self.redis.get(key)
            sessions = json.loads(value) if value else []
            sessions.append(session)
            return await self.set_session_history(user_id, sessions)
        except Exception as e:
            logger.error(f"Failed to append session for user {user_id}: {str(e)}")
            return False
    
    # Caching
    async def cache_set(self, key: str, value: Any, ttl: int) -> bool:
        """Generic cache set operation"""
        try:
            serialized = json.dumps(value)
            await self.redis.setex(key, ttl, serialized)
            return True
        except Exception as e:
            logger.error(f"Failed to cache key {key}: {str(e)}")
            return False
    
    async def cache_get(self, key: str) -> Optional[Any]:
        """Generic cache get operation"""
        try:
            value = await self.redis.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Failed to retrieve cache key {key}: {str(e)}")
            return None
    
    # Rate Limiting
    async def check_rate_limit(self, identifier: str, limit: int, window: int = 60) -> bool:
        """Check if identifier is within rate limit"""
        try:
            key = f"rate_limit:{identifier}"
            current = await self.redis.get(key)
            
            if current is None:
                await self.redis.setex(key, window, 1)
                return True
            
            count = int(current)
            if count >= limit:
                return False
            
            await self.redis.incr(key)
            return True
        except Exception as e:
            logger.error(f"Rate limit check failed for {identifier}: {str(e)}")
            return True  # Allow on error to avoid blocking legitimate requests
    
    # Token Usage Tracking
    async def increment_token_usage(self, service: str, tokens: int) -> int:
        """Track token usage for external services"""
        try:
            key = f"tokens:{service}"
            new_count = await self.redis.incrby(key, tokens)
            # Set expiry to reset monthly
            await self.redis.expire(key, 2592000)  # 30 days
            return new_count
        except Exception as e:
            logger.error(f"Failed to increment token usage for {service}: {str(e)}")
            return 0
    
    async def get_token_usage(self, service: str) -> int:
        """Get current token usage"""
        try:
            key = f"tokens:{service}"
            usage = await self.redis.get(key)
            return int(usage) if usage else 0
        except Exception as e:
            logger.error(f"Failed to get token usage for {service}: {str(e)}")
            return 0


# Global Redis client instance
redis_client = RedisClient()
