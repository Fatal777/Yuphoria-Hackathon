"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class RoomStatus(str, Enum):
    """Room status enumeration"""
    ACTIVE = "active"
    ENDED = "ended"


class MessageRole(str, Enum):
    """Message role enumeration"""
    USER = "user"
    AI = "ai"
    SYSTEM = "system"


# Health Check
class HealthResponse(BaseModel):
    status: str
    timestamp: str
    redis_connected: bool
    environment: str


# Companions
class Companion(BaseModel):
    id: str
    name: str
    description: str
    avatar_url: str
    voice_id: str
    tags: List[str] = []


class CompanionsResponse(BaseModel):
    companions: List[Companion]


# Room Management
class CreateRoomRequest(BaseModel):
    user_id: str = Field(..., min_length=1)
    companion_id: str = Field(..., min_length=1)


class RoomMetadata(BaseModel):
    room_id: str
    user_id: str
    companion_id: str
    status: RoomStatus
    created_at: float
    ended_at: Optional[float] = None
    participants: List[str] = []


class CreateRoomResponse(BaseModel):
    room_id: str
    turn_config: Dict[str, Any]


class RoomDetailsResponse(BaseModel):
    room_id: str
    user_id: str
    companion_id: str
    status: str
    created_at: float
    participants: List[str]


# WebRTC
class WebRTCConfigResponse(BaseModel):
    iceServers: List[Dict[str, Any]]


class SDPMessage(BaseModel):
    room_id: str
    sdp: Dict[str, Any]
    from_id: Optional[str] = None


class ICECandidateMessage(BaseModel):
    room_id: str
    candidate: Dict[str, Any]
    from_id: Optional[str] = None


# Chat Messages
class ChatMessage(BaseModel):
    room_id: str
    message: str
    sender: MessageRole
    timestamp: Optional[float] = None


class AIResponse(BaseModel):
    text: str
    audio_url: Optional[str] = None
    timestamp: float


# Session History
class SessionSummary(BaseModel):
    session_id: str
    room_id: str
    companion: Dict[str, str]
    started_at: float
    ended_at: Optional[float] = None
    duration_seconds: int
    message_count: int
    transcript_preview: str


class SessionHistoryResponse(BaseModel):
    sessions: List[SessionSummary]
    total: int


class TranscriptMessage(BaseModel):
    role: MessageRole
    content: str
    timestamp: float


class TranscriptResponse(BaseModel):
    session_id: str
    room_id: str
    messages: List[TranscriptMessage]


# Socket.IO Events
class JoinRoomEvent(BaseModel):
    room_id: str
    user_id: str
    is_host: bool = False


class LeaveRoomEvent(BaseModel):
    room_id: str
    user_id: str


class OfferEvent(BaseModel):
    room_id: str
    sdp: Dict[str, Any]


class AnswerEvent(BaseModel):
    room_id: str
    sdp: Dict[str, Any]


class CandidateEvent(BaseModel):
    room_id: str
    candidate: Dict[str, Any]


class MessageEvent(BaseModel):
    room_id: str
    message: str
    sender: MessageRole


# Error Response
class ErrorDetail(BaseModel):
    code: str
    message: str
    request_id: Optional[str] = None
    timestamp: str


class ErrorResponse(BaseModel):
    error: ErrorDetail
