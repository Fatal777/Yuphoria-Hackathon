"""
AI Tutor service integrating Google Gemini, ElevenLabs, and D-ID
"""
import httpx
import asyncio
from typing import Optional, Dict, List, Tuple
from datetime import datetime
from elevenlabs.client import ElevenLabs
from elevenlabs import VoiceSettings
from config import settings
from services.redis_client import redis_client
from services.s3_client import s3_client
from services.video_avatar import video_avatar_service
from utils.logger import logger


class AITutorService:
    """AI conversation service with Gemini and ElevenLabs integration"""
    
    def __init__(self):
        self.openrouter_url = settings.OPENROUTER_API_URL
        self.api_key = settings.OPENROUTER_API_KEY
        self.elevenlabs_client = ElevenLabs(api_key=settings.ELEVENLABS_API_KEY)
        self.http_client: Optional[httpx.AsyncClient] = None
    
    async def initialize(self):
        """Initialize async HTTP client"""
        self.http_client = httpx.AsyncClient(timeout=30.0)
        logger.info("AI Tutor service initialized")
    
    async def close(self):
        """Close HTTP client"""
        if self.http_client:
            await self.http_client.aclose()
    
    async def generate_response(
        self,
        room_id: str,
        user_message: str,
        companion_id: str
    ) -> Tuple[str, Optional[str], Optional[str]]:
        """
        Generate AI response with text, audio, and video avatar
        Returns: (response_text, audio_url, video_url)
        """
        try:
            # Get companion data
            companion = await self._get_companion_data(companion_id)
            if not companion:
                return self._fallback_response()
            
            # Get conversation history
            conversation = await redis_client.get_conversation(room_id, limit=10)
            
            # Build prompt for Gemini
            prompt = await self._build_prompt(companion, user_message, conversation)
            
            # Generate text response from Gemini
            response_text = await self._call_gemini(prompt)
            if not response_text:
                return self._fallback_response()
            
            # Check ElevenLabs token usage
            token_usage = await redis_client.get_token_usage("elevenlabs")
            audio_url = None
            video_url = None
            
            if token_usage < settings.ELEVENLABS_TOKEN_LIMIT:
                # Generate voice audio
                audio_url = await self._generate_audio(
                    response_text,
                    companion.get("voice_id", ""),
                    room_id
                )
                
                if audio_url:
                    # Track token usage (approximate)
                    estimated_tokens = len(response_text)
                    await redis_client.increment_token_usage("elevenlabs", estimated_tokens)
                    
                    # Generate video avatar with D-ID
                    avatar_image_url = companion.get("avatar_url", "")
                    if avatar_image_url:
                        video_result = await video_avatar_service.create_talking_avatar(
                            text=response_text,
                            audio_url=audio_url,
                            avatar_image_url=avatar_image_url,
                            voice_id=companion.get("voice_id")
                        )
                        
                        if video_result:
                            video_url = video_result.get("video_url")
                            logger.info(f"Video avatar generated: {video_url}")
                        else:
                            logger.warning("Failed to generate video avatar, falling back to audio only")
            else:
                logger.warning("ElevenLabs token limit reached, returning text-only response")
            
            return response_text, audio_url, video_url
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            return self._fallback_response()
    
    async def _get_companion_data(self, companion_id: str) -> Optional[Dict]:
        """Retrieve companion data from cache"""
        try:
            # Check cache first
            companions = await redis_client.cache_get("companions:all")
            if companions:
                for companion in companions:
                    if companion.get("id") == companion_id:
                        return companion
            
            # Fallback: fetch from external API
            response = await self.http_client.get(
                settings.PERSONAS_API_URL,
                timeout=10.0
            )
            if response.status_code == 200:
                companions = response.json()
                # Cache for future use
                await redis_client.cache_set(
                    "companions:all",
                    companions,
                    settings.COMPANIONS_CACHE_TTL
                )
                
                for companion in companions:
                    if companion.get("id") == companion_id:
                        return companion
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get companion data: {str(e)}")
            return None
    
    async def _build_prompt(
        self,
        companion: Dict,
        user_message: str,
        conversation: List[Dict]
    ) -> str:
        """Build prompt for Gemini"""
        tags = ", ".join(companion.get("tags", []))
        
        # Format conversation history
        history_text = ""
        for msg in conversation[-5:]:  # Last 5 messages for context
            role = "Student" if msg.get("sender") == "user" else "You"
            content = msg.get("message", msg.get("content", ""))
            history_text += f"{role}: {content}\n"
        
        prompt = f"""You are {companion.get('name')}, an expert AI tutor specializing in {tags}.
You are currently in a live video call tutoring session with a student.

Your personality: {companion.get('description', 'A helpful and encouraging tutor')}

Recent conversation:
{history_text}

Student's current question: "{user_message}"

IMPORTANT - You are an AUTONOMOUS and PROACTIVE tutor. Your responsibilities:
1. Answer the student's question clearly and concisely (2-3 sentences)
2. PROACTIVELY suggest related topics, exercises, or materials they should explore
3. Identify knowledge gaps and recommend specific learning resources
4. Suggest practice problems or real-world applications
5. Recommend courses, books, videos, or exercises that would help them master this topic

Format your response as:
[Your answer to their question]

📚 Suggested Resources:
- [Specific recommendation 1]
- [Specific recommendation 2]

Be encouraging, specific, and actionable in your suggestions."""

        return prompt
    
    async def _call_gemini(self, prompt: str, max_retries: int = 3) -> Optional[str]:
        """Call Google Gemini via OpenRouter API with retry logic"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://holo-tutor-hub.com",
            "X-Title": "Holo Tutor Hub"
        }
        
        payload = {
            "model": settings.GEMINI_MODEL,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": settings.GEMINI_TEMPERATURE,
            "max_tokens": settings.GEMINI_MAX_TOKENS
        }
        
        for attempt in range(max_retries):
            try:
                response = await self.http_client.post(
                    self.openrouter_url,
                    headers=headers,
                    json=payload,
                    timeout=20.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    if text:
                        logger.info("Gemini response generated successfully")
                        return text.strip()
                
                elif response.status_code == 429:
                    # Rate limited, exponential backoff
                    logger.warning(f"Gemini rate limited, attempt {attempt + 1}")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(2 ** attempt)
                        continue
                
                else:
                    logger.error(f"Gemini API error: {response.status_code} - {response.text}")
                    
            except Exception as e:
                logger.error(f"Gemini API call attempt {attempt + 1} failed: {str(e)}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
        
        return None
    
    async def _generate_audio(
        self,
        text: str,
        voice_id: str,
        room_id: str
    ) -> Optional[str]:
        """Generate audio using ElevenLabs and upload to S3"""
        try:
            if not voice_id:
                logger.warning("No voice_id provided, skipping audio generation")
                return None
            
            # Run ElevenLabs generation in thread pool (it's synchronous)
            loop = asyncio.get_event_loop()
            
            def generate_audio():
                return self.elevenlabs_client.generate(
                    text=text,
                    voice=voice_id,
                    model=settings.ELEVENLABS_MODEL,
                    voice_settings=VoiceSettings(
                        stability=0.5,
                        similarity_boost=0.75
                    )
                )
            
            # Generate audio bytes
            audio_generator = await loop.run_in_executor(None, generate_audio)
            audio_bytes = b"".join(audio_generator)
            
            if not audio_bytes:
                logger.error("ElevenLabs returned empty audio")
                return None
            
            # Upload to S3
            timestamp = int(datetime.now().timestamp())
            filename = f"response_{timestamp}.mp3"
            audio_url = await s3_client.upload_audio(room_id, audio_bytes, filename)
            
            if audio_url:
                logger.info(f"Audio generated and uploaded: {filename}")
            
            return audio_url
            
        except Exception as e:
            logger.error(f"Failed to generate audio: {str(e)}")
            return None
    
    def _fallback_response(self) -> Tuple[str, None, None]:
        """Return fallback response when AI fails"""
        return (
            "I'm having trouble processing that right now. Could you rephrase your question?",
            None,
            None
        )


# Global AI tutor service instance
ai_tutor_service = AITutorService()
