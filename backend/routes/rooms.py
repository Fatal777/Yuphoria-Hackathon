"""
Video room management endpoints
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid
from models.schemas import (
    CreateRoomRequest,
    CreateRoomResponse,
    RoomDetailsResponse,
    WebRTCConfigResponse
)
from services.redis_client import redis_client
from utils.webrtc_config import get_webrtc_config
from utils.logger import logger
from config import settings

router = APIRouter(prefix="/api/video", tags=["rooms"])


@router.post("/rooms", response_model=CreateRoomResponse)
async def create_room(request: CreateRoomRequest):
    """
    Create new video session room
    """
    try:
        # Generate unique room ID
        room_id = str(uuid.uuid4())
        
        # Create room metadata
        room_data = {
            "room_id": room_id,
            "user_id": request.user_id,
            "companion_id": request.companion_id,
            "status": "active",
            "created_at": datetime.now().timestamp(),
            "participants": []
        }
        
        # Store in Redis with TTL
        success = await redis_client.set_room(
            room_id,
            room_data,
            settings.ROOM_TTL
        )
        
        if not success:
            logger.error(f"Failed to store room {room_id}")
            raise HTTPException(
                status_code=500,
                detail="Failed to create room"
            )
        
        # Initialize empty conversation
        await redis_client.set_conversation(
            room_id,
            [],
            settings.CONVERSATION_TTL
        )
        
        logger.info(f"Room {room_id} created for user {request.user_id}")
        
        return CreateRoomResponse(
            room_id=room_id,
            turn_config=get_webrtc_config()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating room: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create room"
        )


@router.get("/rooms/{room_id}", response_model=RoomDetailsResponse)
async def get_room(room_id: str):
    """
    Get room details and status
    """
    try:
        room = await redis_client.get_room(room_id)
        
        if not room:
            raise HTTPException(
                status_code=404,
                detail="Room not found or expired"
            )
        
        return RoomDetailsResponse(**room)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching room {room_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch room details"
        )


@router.delete("/rooms/{room_id}")
async def end_room(room_id: str):
    """
    End video session and save to history
    """
    try:
        room = await redis_client.get_room(room_id)
        
        if not room:
            raise HTTPException(
                status_code=404,
                detail="Room not found"
            )
        
        # Update room status
        room["status"] = "ended"
        room["ended_at"] = datetime.now().timestamp()
        
        # Save final state temporarily
        await redis_client.set_room(room_id, room, ttl=300)  # Keep for 5 minutes
        
        # Get conversation for session history
        conversation = await redis_client.get_conversation(room_id, limit=1000)
        
        # Create session record
        duration = int(room["ended_at"] - room["created_at"])
        session_data = {
            "session_id": str(uuid.uuid4()),
            "room_id": room_id,
            "companion_id": room["companion_id"],
            "started_at": room["created_at"],
            "ended_at": room["ended_at"],
            "duration_seconds": duration,
            "message_count": len(conversation),
            "transcript_preview": conversation[0]["message"][:100] if conversation else ""
        }
        
        # Append to user's session history
        await redis_client.append_session(room["user_id"], session_data)
        
        logger.info(f"Room {room_id} ended and saved to history")
        
        return {"message": "Room ended successfully", "room_id": room_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ending room {room_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to end room"
        )


@router.get("/webrtc/config", response_model=WebRTCConfigResponse)
async def get_webrtc_configuration():
    """
    Get WebRTC ICE server configuration (STUN/TURN)
    """
    try:
        return WebRTCConfigResponse(**get_webrtc_config())
    except Exception as e:
        logger.error(f"Error getting WebRTC config: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get WebRTC configuration"
        )
