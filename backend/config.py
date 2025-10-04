"""
Configuration management with environment variables validation
"""
from pydantic_settings import BaseSettings
from typing import List
import re


class Settings(BaseSettings):
    """Application settings with validation"""
    
    # API Keys
    OPENROUTER_API_KEY: str
    ELEVENLABS_API_KEY: str
    DID_API_KEY: str
    
    # AWS Configuration
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str
    
    # Redis Configuration
    REDIS_URL: str
    
    # CORS Configuration
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:8080"
    
    # Environment
    ENV: str = "development"
    
    # WebRTC Configuration
    STUN_SERVER: str = "stun:stun.l.google.com:19302"
    TURN_SERVER: str = "turn:openrelay.metered.ca:80"
    TURN_USERNAME: str = "openrelayproject"
    TURN_CREDENTIAL: str = "openrelayproject"
    
    # TTL Configuration (seconds)
    ROOM_TTL: int = 7200  # 2 hours
    CONVERSATION_TTL: int = 7200  # 2 hours
    SESSION_HISTORY_TTL: int = 2592000  # 30 days
    COMPANIONS_CACHE_TTL: int = 3600  # 1 hour
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    
    # External API
    PERSONAS_API_URL: str = "https://persona-fetcher-api.up.railway.app/personas"
    
    # OpenRouter Configuration
    OPENROUTER_API_URL: str = "https://openrouter.ai/api/v1/chat/completions"
    GEMINI_MODEL: str = "google/gemini-2.0-flash-exp:free"
    GEMINI_TEMPERATURE: float = 0.7
    GEMINI_MAX_TOKENS: int = 200
    
    # ElevenLabs Configuration
    ELEVENLABS_MODEL: str = "eleven_monolingual_v1"
    ELEVENLABS_TOKEN_LIMIT: int = 100000
    
    # D-ID Configuration
    DID_API_URL: str = "https://api.d-id.com"
    DID_TALKS_ENDPOINT: str = "/talks"
    DID_STREAMS_ENDPOINT: str = "/talks/streams"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    def get_allowed_origins(self) -> List[str]:
        """Parse comma-separated origins"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    def validate_redis_url(self) -> bool:
        """Validate Redis URL format"""
        pattern = r'^redis://[^:]+:\d+$'
        return bool(re.match(pattern, self.REDIS_URL))
    
    def get_ice_servers(self) -> list:
        """Get WebRTC ICE server configuration"""
        return [
            {"urls": self.STUN_SERVER},
            {
                "urls": self.TURN_SERVER,
                "username": self.TURN_USERNAME,
                "credential": self.TURN_CREDENTIAL
            }
        ]


# Global settings instance
settings = Settings()
