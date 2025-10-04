"""
D-ID Video Avatar Generation Service
Generates talking avatar videos from text and audio
"""
import httpx
import asyncio
from typing import Optional, Dict
from config import settings
from utils.logger import logger


class VideoAvatarService:
    """D-ID video avatar generation service"""
    
    def __init__(self):
        self.api_key = settings.DID_API_KEY
        self.base_url = settings.DID_API_URL
        self.http_client: Optional[httpx.AsyncClient] = None
    
    async def initialize(self):
        """Initialize async HTTP client"""
        self.http_client = httpx.AsyncClient(timeout=60.0)
        logger.info("Video Avatar service initialized")
    
    async def close(self):
        """Close HTTP client"""
        if self.http_client:
            await self.http_client.aclose()
    
    async def create_talking_avatar(
        self,
        text: str,
        audio_url: str,
        avatar_image_url: str,
        voice_id: Optional[str] = None
    ) -> Optional[Dict]:
        """
        Create talking avatar video using D-ID API
        
        Args:
            text: Script text for the avatar to speak
            audio_url: URL to pre-generated audio (from ElevenLabs)
            avatar_image_url: URL of the avatar image
            voice_id: Optional ElevenLabs voice ID
        
        Returns:
            Dictionary with video_url and id, or None on failure
        """
        try:
            headers = {
                "Authorization": f"Basic {self.api_key}",
                "Content-Type": "application/json"
            }
            
            # Build payload
            payload = {
                "source_url": avatar_image_url,
                "script": {
                    "type": "audio",
                    "audio_url": audio_url,
                    "subtitles": "false",
                    "ssml": "false"
                },
                "config": {
                    "fluent": "false",
                    "pad_audio": "0.0",
                    "stitch": True
                }
            }
            
            # If no audio_url, use text-to-speech
            if not audio_url and voice_id:
                payload["script"] = {
                    "type": "text",
                    "input": text,
                    "provider": {
                        "type": "elevenlabs",
                        "voice_id": voice_id
                    }
                }
            
            # Create talk
            url = f"{self.base_url}{settings.DID_TALKS_ENDPOINT}"
            response = await self.http_client.post(url, headers=headers, json=payload)
            
            if response.status_code == 201:
                data = response.json()
                talk_id = data.get("id")
                
                logger.info(f"D-ID talk created: {talk_id}")
                
                # Poll for completion
                video_url = await self._wait_for_video(talk_id, headers)
                
                if video_url:
                    return {
                        "id": talk_id,
                        "video_url": video_url,
                        "status": "completed"
                    }
            else:
                logger.error(f"D-ID API error: {response.status_code} - {response.text}")
            
            return None
            
        except Exception as e:
            logger.error(f"Error creating talking avatar: {str(e)}")
            return None
    
    async def _wait_for_video(self, talk_id: str, headers: Dict, max_attempts: int = 30) -> Optional[str]:
        """
        Poll D-ID API until video is ready
        
        Args:
            talk_id: The talk ID to poll
            headers: Authorization headers
            max_attempts: Maximum polling attempts (30 = ~60 seconds)
        
        Returns:
            Video URL when ready, or None on timeout/failure
        """
        url = f"{self.base_url}{settings.DID_TALKS_ENDPOINT}/{talk_id}"
        
        for attempt in range(max_attempts):
            try:
                response = await self.http_client.get(url, headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    status = data.get("status")
                    
                    if status == "done":
                        video_url = data.get("result_url")
                        logger.info(f"D-ID video ready: {video_url}")
                        return video_url
                    elif status == "error":
                        logger.error(f"D-ID video generation failed: {data.get('error')}")
                        return None
                    else:
                        # Still processing, wait and retry
                        await asyncio.sleep(2)
                else:
                    logger.error(f"D-ID poll error: {response.status_code}")
                    return None
                    
            except Exception as e:
                logger.error(f"Error polling D-ID: {str(e)}")
                return None
        
        logger.warning(f"D-ID video generation timeout for talk {talk_id}")
        return None
    
    async def create_streaming_avatar(
        self,
        text: str,
        avatar_image_url: str,
        voice_id: str
    ) -> Optional[Dict]:
        """
        Create streaming avatar session (for real-time streaming)
        
        Args:
            text: Initial text to speak
            avatar_image_url: Avatar image URL
            voice_id: ElevenLabs voice ID
        
        Returns:
            Stream session info with WebRTC offer
        """
        try:
            headers = {
                "Authorization": f"Basic {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "source_url": avatar_image_url,
                "script": {
                    "type": "text",
                    "provider": {
                        "type": "elevenlabs",
                        "voice_id": voice_id
                    },
                    "input": text
                }
            }
            
            url = f"{self.base_url}{settings.DID_STREAMS_ENDPOINT}"
            response = await self.http_client.post(url, headers=headers, json=payload)
            
            if response.status_code == 201:
                data = response.json()
                logger.info(f"D-ID streaming session created: {data.get('id')}")
                return data
            else:
                logger.error(f"D-ID streaming error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error creating streaming avatar: {str(e)}")
            return None
    
    async def get_talk_status(self, talk_id: str) -> Optional[Dict]:
        """Get status of a D-ID talk"""
        try:
            headers = {
                "Authorization": f"Basic {self.api_key}"
            }
            
            url = f"{self.base_url}{settings.DID_TALKS_ENDPOINT}/{talk_id}"
            response = await self.http_client.get(url, headers=headers)
            
            if response.status_code == 200:
                return response.json()
            return None
            
        except Exception as e:
            logger.error(f"Error getting talk status: {str(e)}")
            return None
    
    async def delete_talk(self, talk_id: str) -> bool:
        """Delete a D-ID talk"""
        try:
            headers = {
                "Authorization": f"Basic {self.api_key}"
            }
            
            url = f"{self.base_url}{settings.DID_TALKS_ENDPOINT}/{talk_id}"
            response = await self.http_client.delete(url, headers=headers)
            
            return response.status_code == 200
            
        except Exception as e:
            logger.error(f"Error deleting talk: {str(e)}")
            return False


# Global video avatar service instance
video_avatar_service = VideoAvatarService()
