"""
WebRTC configuration utilities
"""
from config import settings


def get_webrtc_config() -> dict:
    """Get WebRTC ICE server configuration"""
    return {
        "iceServers": settings.get_ice_servers()
    }


def validate_sdp(sdp: dict) -> bool:
    """Validate SDP offer/answer structure"""
    required_fields = ["type", "sdp"]
    return all(field in sdp for field in required_fields)


def validate_ice_candidate(candidate: dict) -> bool:
    """Validate ICE candidate structure"""
    required_fields = ["candidate", "sdpMLineIndex", "sdpMid"]
    return all(field in candidate for field in required_fields)
