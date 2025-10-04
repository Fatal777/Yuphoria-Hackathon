"""
Companions/Tutors endpoints
"""
from fastapi import APIRouter, HTTPException
from typing import List
import httpx
from config import settings
from services.redis_client import redis_client
from models.schemas import Companion
from utils.logger import logger

router = APIRouter(prefix="/api/companions", tags=["companions"])


@router.get("")
async def get_companions():
    """
    Get list of available AI tutors/companions.
    Cached for 1 hour to reduce API calls.
    """
    try:
        # Check cache first
        cached_companions = await redis_client.cache_get("companions:all")
        if cached_companions:
            logger.info("Returning cached companions")
            return cached_companions
        
        # Generate tutors list
        companions = [
            {
                "id": "tutor_math_ada",
                "name": "Professor Ada Lovelace",
                "description": "Expert mathematics tutor specializing in algebra, calculus, geometry, and statistics. Known for patient explanations and real-world applications. Perfect for high school and college students.",
                "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ada&backgroundColor=b6e3f4",
                "voice_id": "21m00Tcm4TlvDq8ikWAM",
                "tags": ["Mathematics", "High School", "College"]
            },
            {
                "id": "tutor_physics_newton",
                "name": "Dr. Isaac Newton",
                "description": "Physics enthusiast with expertise in classical mechanics, thermodynamics, electromagnetism, and quantum physics. Makes complex concepts accessible through intuitive explanations and practical examples.",
                "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Newton&backgroundColor=c0aede",
                "voice_id": "pNInz6obpgDQGcFmaJgB",
                "tags": ["Physics", "College", "Advanced"]
            }
        ]
        
        # Cache the companions
        await redis_client.cache_set(
            "companions:all",
            companions,
            settings.COMPANIONS_CACHE_TTL
        )
        logger.info(f"Generated and cached {len(companions)} companions")
        return companions
                
    except Exception as e:
        logger.error(f"Error generating companions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to load tutors"
        )


@router.get("/{companion_id}")
async def get_companion(companion_id: str):
    """Get specific companion by ID"""
    try:
        companions = await get_companions()
        for companion in companions:
            if companion.get("id") == companion_id:
                return companion
        
        raise HTTPException(
            status_code=404,
            detail=f"Companion {companion_id} not found"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching companion {companion_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )
