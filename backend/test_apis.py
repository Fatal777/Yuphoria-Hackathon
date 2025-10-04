"""
Quick test script to verify API integrations
"""
import asyncio
import sys
from config import settings
from services.ai_tutor import ai_tutor_service
from services.video_avatar import video_avatar_service

async def test_apis():
    """Test all API integrations"""
    print("=" * 60)
    print("Testing API Integrations")
    print("=" * 60)
    
    # Initialize services
    await ai_tutor_service.initialize()
    await video_avatar_service.initialize()
    
    # Test 1: OpenRouter (Gemini)
    print("\n1. Testing OpenRouter API...")
    try:
        response = await ai_tutor_service._call_gemini("Say 'Hello, I am working!'")
        if response:
            print(f"   ✅ OpenRouter: {response[:50]}...")
        else:
            print("   ❌ OpenRouter: No response")
    except Exception as e:
        print(f"   ❌ OpenRouter Error: {str(e)}")
    
    # Test 2: ElevenLabs
    print("\n2. Testing ElevenLabs API...")
    try:
        audio_url = await ai_tutor_service._generate_audio(
            "Hello, this is a test.",
            "21m00Tcm4TlvDq8ikWAM",
            "test_room"
        )
        if audio_url:
            print(f"   ✅ ElevenLabs: Audio generated at {audio_url[:50]}...")
        else:
            print("   ❌ ElevenLabs: No audio generated")
    except Exception as e:
        print(f"   ❌ ElevenLabs Error: {str(e)}")
    
    # Test 3: D-ID
    print("\n3. Testing D-ID API...")
    try:
        result = await video_avatar_service.create_talking_avatar(
            text="Hello, this is a test.",
            audio_url=None,
            avatar_image_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Test",
            voice_id="21m00Tcm4TlvDq8ikWAM"
        )
        if result:
            print(f"   ✅ D-ID: Video ID {result.get('id', 'N/A')}")
        else:
            print("   ❌ D-ID: No video generated")
    except Exception as e:
        print(f"   ❌ D-ID Error: {str(e)}")
    
    # Cleanup
    await ai_tutor_service.close()
    await video_avatar_service.close()
    
    print("\n" + "=" * 60)
    print("Test Complete")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_apis())
