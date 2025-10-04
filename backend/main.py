"""
Main FastAPI application with Lambda handler
"""
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum
from datetime import datetime
import uuid
import traceback
from contextlib import asynccontextmanager

from config import settings
from services.redis_client import redis_client
from services.ai_tutor import ai_tutor_service
from services.video_avatar import video_avatar_service
from utils.logger import logger, request_id_var, user_id_var
from models.schemas import HealthResponse, ErrorResponse

# Import routers
from routes.companions import router as companions_router
from routes.rooms import router as rooms_router
from routes.sessions import router as sessions_router
from socket_server import socket_app, sio


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Holo Tutor Hub backend...")
    try:
        await redis_client.connect()
        await ai_tutor_service.initialize()
        await video_avatar_service.initialize()
        logger.info("All services initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize services: {str(e)}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down Holo Tutor Hub backend...")
    try:
        await redis_client.disconnect()
        await ai_tutor_service.close()
        await video_avatar_service.close()
        logger.info("All services closed successfully")
    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")


# Create FastAPI app
app = FastAPI(
    title="Holo Tutor Hub API",
    description="AI Video Tutor Backend with WebRTC and real-time chat",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    """Add unique request ID to each request for tracing"""
    request_id = str(uuid.uuid4())
    request_id_var.set(request_id)
    
    # Extract user_id from headers if available
    user_id = request.headers.get("X-User-ID")
    if user_id:
        user_id_var.set(user_id)
    
    # Add request ID to response headers
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    
    return response


@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    """Simple rate limiting based on IP address"""
    # Skip rate limiting for health check
    if request.url.path == "/health":
        return await call_next(request)
    
    client_ip = request.client.host
    is_allowed = await redis_client.check_rate_limit(
        client_ip,
        settings.RATE_LIMIT_PER_MINUTE,
        window=60
    )
    
    if not is_allowed:
        return JSONResponse(
            status_code=429,
            content={
                "error": {
                    "code": "RATE_LIMIT_EXCEEDED",
                    "message": "Too many requests. Please try again later.",
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }
            },
            headers={"Retry-After": "60"}
        )
    
    return await call_next(request)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for uncaught errors"""
    request_id = request_id_var.get()
    
    # Log full traceback
    logger.error(f"Unhandled exception: {str(exc)}\n{traceback.format_exc()}")
    
    # Determine status code
    if isinstance(exc, HTTPException):
        status_code = exc.status_code
        message = exc.detail
        code = "HTTP_ERROR"
    else:
        status_code = 500
        message = "Internal server error"
        code = "INTERNAL_ERROR"
    
    error_response = ErrorResponse(
        error=ErrorDetail(
            code=code,
            message=message,
            request_id=request_id,
            timestamp=datetime.utcnow().isoformat() + "Z"
        )
    )
    
    return JSONResponse(
        status_code=status_code,
        content=error_response.dict()
    )


# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint returning service status
    """
    redis_healthy = await redis_client.is_healthy()
    
    return HealthResponse(
        status="healthy" if redis_healthy else "degraded",
        timestamp=datetime.utcnow().isoformat() + "Z",
        redis_connected=redis_healthy,
        environment=settings.ENV
    )


# Include routers
app.include_router(companions_router)
app.include_router(rooms_router)
app.include_router(sessions_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Holo Tutor Hub API",
        "version": "1.0.0",
        "status": "operational",
        "documentation": "/docs",
        "socketio": "ws://localhost:8000/socket.io"
    }


@app.get("/socket-test")
async def socket_test():
    """Test Socket.IO availability"""
    return {
        "socketio_configured": True,
        "socketio_path": "/socket.io",
        "cors_origins": settings.get_allowed_origins()
    }


# Create combined ASGI app with Socket.IO
# Socket.IO needs to be mounted AFTER all FastAPI routes are registered
from socketio import ASGIApp
asgi_app = ASGIApp(
    socketio_server=sio,
    other_asgi_app=app,
    socketio_path='/socket.io'
)


# Lambda handler using Mangum  
handler = Mangum(app)


if __name__ == "__main__":
    import uvicorn
    # Run the combined app
    uvicorn.run(
        asgi_app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
