"""
Development server runner with hot reload
"""
import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("🚀 Starting Holo Tutor Hub Backend (Development Mode)")
    print("=" * 60)
    print("\n📍 Server Info:")
    print("   - REST API: http://localhost:8000")
    print("   - API Docs: http://localhost:8000/docs")
    print("   - Socket.IO: ws://localhost:8000/socket.io")
    print("\n⚙️  Hot reload: ENABLED")
    print("🔍 Log level: INFO\n")
    print("=" * 60)
    print("\n✨ Press CTRL+C to stop the server\n")
    
    uvicorn.run(
        "main:asgi_app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True
    )
