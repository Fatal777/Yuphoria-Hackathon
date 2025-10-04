"""
Session history endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List
from models.schemas import SessionHistoryResponse, TranscriptResponse, TranscriptMessage, SessionSummary
from services.redis_client import redis_client
from routes.companions import get_companion
from utils.logger import logger

router = APIRouter(prefix="/api/video/sessions", tags=["sessions"])


@router.get("/{user_id}", response_model=SessionHistoryResponse)
async def get_user_sessions(
    user_id: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Get user's past session history with pagination
    """
    try:
        sessions = await redis_client.get_session_history(user_id, offset, limit)
        
        # Enrich with companion data
        enriched_sessions = []
        for session in sessions:
            try:
                companion = await get_companion(session["companion_id"])
                session_summary = SessionSummary(
                    session_id=session["session_id"],
                    room_id=session["room_id"],
                    companion={
                        "id": companion.id,
                        "name": companion.name,
                        "avatar_url": companion.avatar_url
                    },
                    started_at=session["started_at"],
                    ended_at=session.get("ended_at"),
                    duration_seconds=session["duration_seconds"],
                    message_count=session["message_count"],
                    transcript_preview=session.get("transcript_preview", "")
                )
                enriched_sessions.append(session_summary)
            except Exception as e:
                logger.error(f"Error enriching session: {str(e)}")
                continue
        
        return SessionHistoryResponse(
            sessions=enriched_sessions,
            total=len(enriched_sessions)
        )
        
    except Exception as e:
        logger.error(f"Error fetching session history for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch session history"
        )


@router.get("/{user_id}/{session_id}/transcript", response_model=TranscriptResponse)
async def get_session_transcript(user_id: str, session_id: str):
    """
    Get full conversation transcript for a specific session
    """
    try:
        # Get user's sessions to find the room_id
        sessions = await redis_client.get_session_history(user_id, offset=0, limit=1000)
        
        target_session = None
        for session in sessions:
            if session["session_id"] == session_id:
                target_session = session
                break
        
        if not target_session:
            raise HTTPException(
                status_code=404,
                detail="Session not found"
            )
        
        # Get conversation from room
        room_id = target_session["room_id"]
        conversation = await redis_client.get_conversation(room_id, limit=1000)
        
        # Format messages
        messages = []
        for msg in conversation:
            messages.append(TranscriptMessage(
                role=msg.get("sender", "user"),
                content=msg.get("message", msg.get("content", "")),
                timestamp=msg.get("timestamp", 0)
            ))
        
        return TranscriptResponse(
            session_id=session_id,
            room_id=room_id,
            messages=messages
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching transcript for session {session_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch transcript"
        )
