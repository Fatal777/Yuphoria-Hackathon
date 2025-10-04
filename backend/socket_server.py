"""
Socket.IO server for WebRTC signaling and real-time chat
"""
import socketio
from datetime import datetime
from typing import Dict
from services.redis_client import redis_client
from services.ai_tutor import ai_tutor_service
from utils.logger import logger
from config import settings

# Create Socket.IO server with CORS
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=settings.get_allowed_origins(),
    logger=True,
    engineio_logger=True
)

# Socket ID to user/room mapping
socket_sessions: Dict[str, Dict[str, str]] = {}


@sio.event
async def connect(sid, environ):
    """Handle client connection"""
    logger.info(f"Socket connected: {sid}")
    return True


@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    logger.info(f"Socket disconnected: {sid}")
    
    # Cleanup: notify room if user was in one
    if sid in socket_sessions:
        session = socket_sessions[sid]
        room_id = session.get("room_id")
        user_id = session.get("user_id")
        
        if room_id:
            # Remove from room participants
            room = await redis_client.get_room(room_id)
            if room:
                participants = room.get("participants", [])
                if user_id in participants:
                    participants.remove(user_id)
                    await redis_client.update_room_participants(room_id, participants)
            
            # Notify other peers
            await sio.emit(
                'peer-left',
                {"user_id": user_id},
                room=room_id,
                skip_sid=sid
            )
            
            # Leave Socket.IO room
            sio.leave_room(sid, room_id)
        
        # Remove from session tracking
        del socket_sessions[sid]


@sio.event
async def join(sid, data):
    """
    Handle user joining a video room
    Expected data: {"room_id": str, "user_id": str, "is_host": bool}
    """
    try:
        room_id = data.get("room_id")
        user_id = data.get("user_id")
        is_host = data.get("is_host", False)
        
        if not room_id or not user_id:
            await sio.emit('error', {"message": "Missing room_id or user_id"}, to=sid)
            return
        
        # Verify room exists
        room = await redis_client.get_room(room_id)
        if not room:
            await sio.emit('error', {"message": "Room not found"}, to=sid)
            return
        
        # Add to Socket.IO room
        sio.enter_room(sid, room_id)
        
        # Track session
        socket_sessions[sid] = {
            "room_id": room_id,
            "user_id": user_id,
            "is_host": is_host
        }
        
        # Update room participants
        participants = room.get("participants", [])
        if user_id not in participants:
            participants.append(user_id)
            await redis_client.update_room_participants(room_id, participants)
        
        # Notify other peers
        await sio.emit(
            'peer-joined',
            {"user_id": user_id, "is_host": is_host},
            room=room_id,
            skip_sid=sid
        )
        
        logger.info(f"User {user_id} joined room {room_id}")
        await sio.emit('joined', {"room_id": room_id, "user_id": user_id}, to=sid)
        
    except Exception as e:
        logger.error(f"Error in join event: {str(e)}")
        await sio.emit('error', {"message": "Failed to join room"}, to=sid)


@sio.event
async def leave(sid, data):
    """
    Handle user leaving a room
    Expected data: {"room_id": str}
    """
    try:
        room_id = data.get("room_id")
        
        if sid not in socket_sessions:
            return
        
        session = socket_sessions[sid]
        user_id = session.get("user_id")
        
        # Update room participants
        room = await redis_client.get_room(room_id)
        if room:
            participants = room.get("participants", [])
            if user_id in participants:
                participants.remove(user_id)
                await redis_client.update_room_participants(room_id, participants)
        
        # Notify peers
        await sio.emit(
            'peer-left',
            {"user_id": user_id},
            room=room_id,
            skip_sid=sid
        )
        
        # Leave Socket.IO room
        sio.leave_room(sid, room_id)
        
        # Remove session
        del socket_sessions[sid]
        
        logger.info(f"User {user_id} left room {room_id}")
        
    except Exception as e:
        logger.error(f"Error in leave event: {str(e)}")


@sio.event
async def offer(sid, data):
    """
    Forward WebRTC offer to peer
    Expected data: {"room_id": str, "sdp": object}
    """
    try:
        room_id = data.get("room_id")
        sdp = data.get("sdp")
        
        if not room_id or not sdp:
            await sio.emit('error', {"message": "Missing room_id or sdp"}, to=sid)
            return
        
        # Forward to other peers in room
        await sio.emit(
            'offer',
            {"sdp": sdp, "from": sid},
            room=room_id,
            skip_sid=sid
        )
        
        logger.info(f"Forwarded offer in room {room_id}")
        
    except Exception as e:
        logger.error(f"Error in offer event: {str(e)}")
        await sio.emit('error', {"message": "Failed to forward offer"}, to=sid)


@sio.event
async def answer(sid, data):
    """
    Forward WebRTC answer to peer
    Expected data: {"room_id": str, "sdp": object}
    """
    try:
        room_id = data.get("room_id")
        sdp = data.get("sdp")
        
        if not room_id or not sdp:
            await sio.emit('error', {"message": "Missing room_id or sdp"}, to=sid)
            return
        
        # Forward to other peers
        await sio.emit(
            'answer',
            {"sdp": sdp, "from": sid},
            room=room_id,
            skip_sid=sid
        )
        
        logger.info(f"Forwarded answer in room {room_id}")
        
    except Exception as e:
        logger.error(f"Error in answer event: {str(e)}")
        await sio.emit('error', {"message": "Failed to forward answer"}, to=sid)


@sio.event
async def candidate(sid, data):
    """
    Forward ICE candidate to peer
    Expected data: {"room_id": str, "candidate": object}
    """
    try:
        room_id = data.get("room_id")
        candidate = data.get("candidate")
        
        if not room_id or not candidate:
            return
        
        # Forward to other peers
        await sio.emit(
            'candidate',
            {"candidate": candidate, "from": sid},
            room=room_id,
            skip_sid=sid
        )
        
    except Exception as e:
        logger.error(f"Error in candidate event: {str(e)}")


@sio.event
async def message(sid, data):
    """
    Handle chat message and trigger AI response
    Expected data: {"room_id": str, "message": str, "sender": "user" | "ai"}
    """
    try:
        room_id = data.get("room_id")
        message_text = data.get("message")
        sender = data.get("sender", "user")
        
        if not room_id or not message_text:
            await sio.emit('error', {"message": "Missing room_id or message"}, to=sid)
            return
        
        timestamp = datetime.now().timestamp()
        
        # Create message object
        message_obj = {
            "message": message_text,
            "sender": sender,
            "timestamp": timestamp
        }
        
        # Append to conversation history
        await redis_client.append_message(room_id, message_obj)
        
        # Broadcast user message immediately
        await sio.emit(
            'message',
            {
                "message": message_text,
                "sender": sender,
                "timestamp": timestamp
            },
            room=room_id
        )
        
        logger.info(f"Message received in room {room_id} from {sender}")
        
        # If user message, trigger AI response
        if sender == "user":
            # Get room to find companion_id
            room = await redis_client.get_room(room_id)
            if room:
                companion_id = room.get("companion_id")
                
                # Generate AI response asynchronously
                sio.start_background_task(
                    generate_ai_response,
                    room_id,
                    message_text,
                    companion_id
                )
        
    except Exception as e:
        logger.error(f"Error in message event: {str(e)}")
        await sio.emit('error', {"message": "Failed to send message"}, to=sid)


async def generate_ai_response(room_id: str, user_message: str, companion_id: str):
    """Background task to generate and send AI response with video avatar"""
    try:
        # Generate AI response with video avatar
        response_text, audio_url, video_url = await ai_tutor_service.generate_response(
            room_id,
            user_message,
            companion_id
        )
        
        timestamp = datetime.now().timestamp()
        
        # Create AI message object
        ai_message = {
            "message": response_text,
            "sender": "ai",
            "timestamp": timestamp,
            "audio_url": audio_url,
            "video_url": video_url
        }
        
        # Append to conversation
        await redis_client.append_message(room_id, ai_message)
        
        # Broadcast AI response with video avatar
        await sio.emit(
            'message',
            {
                "message": response_text,
                "sender": "ai",
                "timestamp": timestamp,
                "audio_url": audio_url,
                "video_url": video_url
            },
            room=room_id
        )
        
        logger.info(f"AI response sent to room {room_id}")
        
    except Exception as e:
        logger.error(f"Error generating AI response: {str(e)}")
        # Send fallback message
        await sio.emit(
            'message',
            {
                "message": "I'm having trouble responding right now. Please try again.",
                "sender": "ai",
                "timestamp": datetime.now().timestamp()
            },
            room=room_id
        )


# Create ASGI app
socket_app = socketio.ASGIApp(sio)
