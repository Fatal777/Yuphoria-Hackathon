# Architecture Documentation

## System Overview

The Holo Tutor Hub is a real-time AI video tutoring platform with WebRTC peer-to-peer video calls, Socket.IO signaling, AI-powered conversations, and voice synthesis.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Companion    │  │ VideoCall    │  │ WebRTC Hooks        │  │
│  │ Selection    │  │ Modal        │  │ (useWebRTC)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI + Socket.IO)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ REST API     │  │ Socket.IO    │  │ AI Tutor Service    │  │
│  │ (Companions, │  │ Signaling    │  │ (Gemini+ElevenLabs) │  │
│  │  Rooms)      │  │ (WebRTC)     │  │                     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼
    ┌──────────┐      ┌──────────┐       ┌──────────┐
    │  Redis   │      │   S3     │       │ External │
    │(Session) │      │ (Audio)  │       │   APIs   │
    └──────────┘      └──────────┘       └──────────┘
```

## Component Breakdown

### Frontend Components

1. **Companion Selection Page**
   - Fetches tutors from `/api/companions`
   - Displays avatar grid with filtering
   - Initiates room creation

2. **VideoCall Modal**
   - Manages WebRTC connection
   - Displays local/remote video streams
   - Chat interface
   - Call controls (mute, camera toggle)

3. **useWebRTC Hook**
   - WebRTC peer connection management
   - Socket.IO event handlers
   - Media stream handling
   - ICE candidate exchange

### Backend Services

1. **FastAPI Application (main.py)**
   - HTTP REST endpoints
   - CORS middleware
   - Rate limiting
   - Request ID tracking
   - Global error handling

2. **Socket.IO Server (socket_server.py)**
   - WebRTC signaling (offer/answer/candidate)
   - Room management (join/leave)
   - Real-time chat messaging
   - Peer notification

3. **AI Tutor Service (services/ai_tutor.py)**
   - Gemini API integration via OpenRouter
   - Prompt engineering with context
   - ElevenLabs voice synthesis
   - S3 audio upload
   - Token usage tracking

4. **Redis Client (services/redis_client.py)**
   - Room metadata storage
   - Conversation history
   - Session history
   - Caching layer
   - Rate limit counters

5. **S3 Client (services/s3_client.py)**
   - Audio file uploads
   - Video recording storage
   - Pre-signed URL generation
   - Retry logic with exponential backoff

## Sequence Diagrams

### Room Creation & WebRTC Signaling Flow

```
User          Frontend       Backend       Redis       Socket.IO
 │               │              │            │             │
 │ Select Tutor  │              │            │             │
 ├──────────────>│              │            │             │
 │               │ POST /rooms  │            │             │
 │               ├─────────────>│            │             │
 │               │              │ Store Room │             │
 │               │              ├───────────>│             │
 │               │              │            │             │
 │               │   room_id    │            │             │
 │               │<─────────────┤            │             │
 │               │              │            │             │
 │               │   Connect WS │            │             │
 │               ├──────────────┼────────────┼────────────>│
 │               │              │            │    join     │
 │               ├──────────────┼────────────┼────────────>│
 │               │              │ Update     │             │
 │               │              │Participants│             │
 │               │              ├───────────>│             │
 │               │              │            │peer-joined  │
 │               │<─────────────┼────────────┼─────────────┤
 │               │              │            │             │
 │ Start Media   │              │            │             │
 ├──────────────>│              │            │             │
 │               │              │            │             │
 │               │    offer     │            │             │
 │               ├──────────────┼────────────┼────────────>│
 │               │              │            │   forward   │
 │               │              │            │   to peer   │
 │               │<─────────────┼────────────┼─────────────┤
 │               │    answer    │            │             │
 │               ├──────────────┼────────────┼────────────>│
 │               │              │            │             │
 │               │  candidates  │            │             │
 │               │<────────────>│            │             │
 │               │              │            │             │
 │  Video Call Established      │            │             │
 └───────────────┴──────────────┴────────────┴─────────────┘
```

### AI Conversation Flow

```
User      Frontend    Socket.IO   Backend    Redis    Gemini   ElevenLabs   S3
 │            │           │          │         │        │           │        │
 │ Send Msg   │           │          │         │        │           │        │
 ├───────────>│           │          │         │        │           │        │
 │            │  message  │          │         │        │           │        │
 │            ├──────────>│          │         │        │           │        │
 │            │           │  Append  │         │        │           │        │
 │            │           │ Message  │         │        │           │        │
 │            │           ├─────────>│ Store   │        │           │        │
 │            │           │          ├────────>│        │           │        │
 │            │           │          │         │        │           │        │
 │            │           │ Broadcast│         │        │           │        │
 │            │<──────────┤ Message  │         │        │           │        │
 │            │           │          │         │        │           │        │
 │            │           │          │Get Conv │        │           │        │
 │            │           │          │History  │        │           │        │
 │            │           │          ├────────>│        │           │        │
 │            │           │          │<────────┤        │           │        │
 │            │           │          │         │        │           │        │
 │            │           │          │ Call AI │        │           │        │
 │            │           │          ├────────────────>│           │        │
 │            │           │          │         │  Response         │        │
 │            │           │          │<────────────────┤           │        │
 │            │           │          │         │        │           │        │
 │            │           │          │ Generate Voice  │           │        │
 │            │           │          ├─────────────────────────────>│        │
 │            │           │          │         │        │  Audio    │        │
 │            │           │          │<─────────────────────────────┤        │
 │            │           │          │         │        │           │        │
 │            │           │          │ Upload Audio    │           │        │
 │            │           │          ├──────────────────────────────────────>│
 │            │           │          │         │        │           │  URL   │
 │            │           │          │<──────────────────────────────────────┤
 │            │           │          │         │        │           │        │
 │            │           │          │ Store   │        │           │        │
 │            │           │          │AI Reply │        │           │        │
 │            │           │          ├────────>│        │           │        │
 │            │           │          │         │        │           │        │
 │            │           │Broadcast │         │        │           │        │
 │            │           │AI Reply  │         │        │           │        │
 │            │<──────────┤(+audio)  │         │        │           │        │
 │ Play Audio │           │          │         │        │           │        │
 └────────────┴───────────┴──────────┴─────────┴────────┴───────────┴────────┘
```

### Session End & History Flow

```
User      Frontend    Backend    Redis       S3
 │            │          │          │         │
 │ End Call   │          │          │         │
 ├───────────>│          │          │         │
 │            │ DELETE   │          │         │
 │            │  /room   │          │         │
 │            ├─────────>│          │         │
 │            │          │Get Room  │         │
 │            │          ├─────────>│         │
 │            │          │Get Conv  │         │
 │            │          ├─────────>│         │
 │            │          │          │         │
 │            │          │Create    │         │
 │            │          │Session   │         │
 │            │          │Record    │         │
 │            │          ├─────────>│         │
 │            │          │          │         │
 │            │          │Mark Ended│         │
 │            │          ├─────────>│         │
 │            │  200 OK  │          │         │
 │            │<─────────┤          │         │
 │            │          │          │         │
 │ View       │          │          │         │
 │ History    │          │          │         │
 ├───────────>│ GET      │          │         │
 │            │/sessions │          │         │
 │            ├─────────>│          │         │
 │            │          │Fetch     │         │
 │            │          │History   │         │
 │            │          ├─────────>│         │
 │            │Sessions  │          │         │
 │            │<─────────┤          │         │
 └────────────┴──────────┴──────────┴─────────┘
```

## Data Models

### Room Metadata (Redis)
```json
{
  "room_id": "uuid",
  "user_id": "string",
  "companion_id": "string",
  "status": "active|ended",
  "created_at": 1696723200.0,
  "ended_at": 1696726800.0,
  "participants": ["user1", "user2"]
}
```

### Conversation Message (Redis)
```json
{
  "message": "string",
  "sender": "user|ai",
  "timestamp": 1696723200.0,
  "audio_url": "https://s3.../audio.mp3" // optional
}
```

### Session History (Redis)
```json
{
  "session_id": "uuid",
  "room_id": "uuid",
  "companion_id": "string",
  "started_at": 1696723200.0,
  "ended_at": 1696726800.0,
  "duration_seconds": 3600,
  "message_count": 42,
  "transcript_preview": "First 100 chars..."
}
```

## Design Decisions

### WebRTC Strategy: Peer-to-Peer

**Decision:** Use P2P WebRTC without SFU/MCU

**Rationale:**
- Reduces server costs (no media proxying)
- Lower latency for 1-to-1 calls
- Simplifies architecture
- TURN servers for NAT traversal

**Trade-offs:**
- Limited to 1-to-1 calls
- Client bandwidth requirements higher
- NAT traversal reliability depends on TURN

### TURN Service: OpenRelay (Free)

**Decision:** Use openrelay.metered.ca as TURN server

**Rationale:**
- Free tier available
- Good reliability for hackathon
- No setup required

**Production Alternative:**
- Twilio TURN (paid, more reliable)
- LiveKit (managed infrastructure)
- Self-hosted Coturn

### AI Model: Gemini via OpenRouter

**Decision:** Use Google Gemini through OpenRouter API

**Rationale:**
- Free tier with generous limits
- Fast response times
- Good quality responses
- Single API for multiple models

**Alternative Considered:**
- OpenAI GPT-4 (higher cost)
- Claude (limited free tier)

### Voice Synthesis: ElevenLabs

**Decision:** ElevenLabs API for TTS

**Rationale:**
- High-quality natural voices
- 100k character free tier
- Multiple voice options per companion
- Simple API

**Cost Optimization:**
- Track token usage in Redis
- Disable voice when limit reached
- Provide text-only fallback

### Session State: Redis

**Decision:** Redis for all ephemeral state

**Rationale:**
- Fast in-memory operations
- Built-in TTL for auto-cleanup
- Pub/sub for real-time features (future)
- ElastiCache free tier available

**Data TTL Strategy:**
- Room metadata: 2 hours
- Conversations: 2 hours (active session)
- Session history: 30 days
- Companions cache: 1 hour

### Audio Storage: S3

**Decision:** Store audio in S3 with lifecycle policy

**Rationale:**
- Cheap storage (~$0.023/GB)
- Pre-signed URLs for secure access
- Lifecycle rules for auto-deletion
- CDN integration possible

**Lifecycle:**
- Delete audio files after 7 days
- Saves costs for hackathon demo

## Security Considerations

### Authentication
- **Current:** No authentication (hackathon)
- **Production:** Add JWT tokens, OAuth2

### Input Validation
- All requests validated with Pydantic
- SDP/ICE candidate structure validation
- SQL injection prevention (no SQL)

### Rate Limiting
- 100 requests/minute per IP
- Redis-based counter with TTL
- 429 response with Retry-After header

### API Keys
- Stored in environment variables
- Never exposed to frontend
- Backend acts as proxy

### CORS
- Configurable allowed origins
- Credentials enabled for cookies
- Restricts frontend domains

## Scalability

### Current Limitations
- Single Lambda instance (cold starts)
- Redis single node (no replication)
- No load balancing

### Scaling Strategy
1. **Lambda Concurrency**
   - Increase reserved concurrency
   - Optimize cold start time

2. **Redis Scaling**
   - Add read replicas
   - Enable cluster mode for partitioning

3. **Socket.IO Multi-Instance**
   - Use Redis adapter for pub/sub
   - Sticky sessions in ALB

4. **S3 Performance**
   - CloudFront CDN for audio delivery
   - Multipart uploads for large files

## Monitoring & Observability

### Logging
- Structured JSON logs
- CloudWatch Logs (Lambda)
- Request ID tracing
- Error stack traces

### Metrics
- API response times
- Redis connection health
- Token usage (Gemini, ElevenLabs)
- Active session count
- Error rates

### Alerting
- Billing alerts at $50/$75/$90
- Redis memory usage > 80%
- API error rate > 5%
- Token limit approaching

## Cost Breakdown

| Service | Free Tier | Usage | Cost |
|---------|-----------|-------|------|
| Lambda | 1M requests/month | ~100K requests | $0.20 |
| API Gateway | 1M requests/month | ~100K requests | Free |
| ElastiCache | 750 hrs/month | 720 hrs | Free |
| S3 Storage | 5 GB | 2 GB | Free |
| S3 Requests | 2000 PUT, 20K GET | 5K PUT, 50K GET | $0.50 |
| Data Transfer | 1 GB | 10 GB | $0.90 |
| CloudWatch Logs | 5 GB | 2 GB | Free |
| **Total** | | | **~$1.60/month** |

External APIs (not included):
- OpenRouter/Gemini: $5 free credit
- ElevenLabs: 100K chars free

## Future Enhancements

1. **Multi-Party Calls**
   - Implement SFU with LiveKit/Janus
   - Group tutoring sessions

2. **Screen Sharing**
   - WebRTC screen capture API
   - Collaborative whiteboard

3. **Recording**
   - Server-side recording to S3
   - Transcript generation with Whisper

4. **Analytics**
   - Session duration tracking
   - Engagement metrics
   - Learning outcomes

5. **Personalization**
   - User profiles and preferences
   - Adaptive AI difficulty
   - Progress tracking

## References

- [WebRTC Specification](https://webrtc.org/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [OpenRouter API](https://openrouter.ai/docs)
- [ElevenLabs API](https://docs.elevenlabs.io/)
