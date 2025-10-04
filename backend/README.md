# Holo Tutor Hub Backend

Production-ready FastAPI backend for AI Video Tutor application with WebRTC signaling, Socket.IO real-time chat, Redis session state, AWS S3 recordings, Google Gemini AI conversations, and ElevenLabs voice synthesis.

## Features

- **RESTful API** for tutor discovery and room management
- **WebSocket Server** (Socket.IO) for WebRTC signaling and real-time chat
- **AI Conversation Pipeline** with Google Gemini via OpenRouter
- **Voice Synthesis** with ElevenLabs SDK
- **Session Persistence** with Redis (AWS ElastiCache)
- **Audio Storage** with AWS S3
- **Lambda Deployment** ready with Mangum adapter

## Architecture

```
backend/
├── main.py                 # FastAPI app + Lambda handler
├── socket_server.py        # Socket.IO WebRTC signaling
├── config.py               # Configuration management
├── requirements.txt        # Python dependencies
├── services/
│   ├── ai_tutor.py        # Gemini + ElevenLabs integration
│   ├── redis_client.py    # ElastiCache connection
│   └── s3_client.py       # S3 recording uploads
├── models/
│   └── schemas.py         # Pydantic models
├── routes/
│   ├── companions.py      # Tutor endpoints
│   ├── rooms.py           # Video room management
│   └── sessions.py        # History endpoints
└── utils/
    ├── webrtc_config.py   # STUN/TURN configuration
    └── logger.py          # Logging setup
```

## Local Development Setup

### Prerequisites

- Python 3.11+
- Redis (via Docker recommended)
- AWS account with S3 bucket
- OpenRouter API key (for Gemini)
- ElevenLabs API key

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Setup Environment Variables

```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

Required environment variables:
- `OPENROUTER_API_KEY` - Get from https://openrouter.ai/
- `ELEVENLABS_API_KEY` - Get from https://elevenlabs.io/
- `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` - AWS credentials
- `S3_BUCKET_NAME` - Your S3 bucket name
- `REDIS_URL` - Redis connection URL

### Step 3: Start Redis (Docker)

```bash
docker run -d -p 6379:6379 redis:7-alpine
```

### Step 4: Run Development Server

```bash
# With auto-reload
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or directly
python main.py
```

The API will be available at:
- REST API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Socket.IO: ws://localhost:8000/socket.io

## API Endpoints

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/companions` | List AI tutors |
| GET | `/api/companions/{id}` | Get specific tutor |
| POST | `/api/video/rooms` | Create video room |
| GET | `/api/video/rooms/{id}` | Get room details |
| DELETE | `/api/video/rooms/{id}` | End session |
| GET | `/api/webrtc/config` | WebRTC ICE servers |
| GET | `/api/video/sessions/{user_id}` | User session history |
| GET | `/api/video/sessions/{user_id}/{session_id}/transcript` | Full transcript |

### Socket.IO Events

**Namespace:** `/` (default)

**Client → Server:**
- `join` - Join video room: `{room_id, user_id, is_host}`
- `leave` - Leave room: `{room_id}`
- `offer` - WebRTC offer: `{room_id, sdp}`
- `answer` - WebRTC answer: `{room_id, sdp}`
- `candidate` - ICE candidate: `{room_id, candidate}`
- `message` - Chat message: `{room_id, message, sender}`

**Server → Client:**
- `joined` - Successful join confirmation
- `peer-joined` - New peer joined
- `peer-left` - Peer disconnected
- `offer` - WebRTC offer from peer
- `answer` - WebRTC answer from peer
- `candidate` - ICE candidate from peer
- `message` - Chat message (user or AI)
- `error` - Error message

## Testing

### Manual Testing

```bash
# Health check
curl http://localhost:8000/health

# Get companions
curl http://localhost:8000/api/companions

# Create room
curl -X POST http://localhost:8000/api/video/rooms \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user123", "companion_id": "comp1"}'

# WebRTC config
curl http://localhost:8000/api/webrtc/config
```

### Socket.IO Testing

Use a WebSocket client or the test script:

```python
import socketio

sio = socketio.Client()
sio.connect('http://localhost:8000')

# Join room
sio.emit('join', {'room_id': 'room123', 'user_id': 'user1', 'is_host': True})

# Send message
sio.emit('message', {'room_id': 'room123', 'message': 'Hello AI!', 'sender': 'user'})

sio.wait()
```

## AWS Deployment

### Lambda + API Gateway

1. **Package Application**

```bash
# Install dependencies in project directory
pip install -r requirements.txt -t .

# Create deployment package
zip -r deployment.zip .
```

2. **Create Lambda Function**
   - Runtime: Python 3.11
   - Handler: `main.handler`
   - Memory: 512 MB
   - Timeout: 30 seconds
   - Environment variables: Set all required env vars

3. **Setup API Gateway**
   - Create HTTP API
   - Add route: `ANY /{proxy+}` → Lambda integration
   - Enable CORS with allowed origins

### ElastiCache Redis

```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id holo-tutor-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

Update `REDIS_URL` in Lambda environment variables with the endpoint.

### S3 Bucket

```bash
# Create bucket
aws s3 mb s3://holo-tutor-recordings

# Configure lifecycle (delete old recordings)
aws s3api put-bucket-lifecycle-configuration \
  --bucket holo-tutor-recordings \
  --lifecycle-configuration file://lifecycle.json
```

**lifecycle.json:**
```json
{
  "Rules": [{
    "Id": "DeleteOldRecordings",
    "Status": "Enabled",
    "Prefix": "",
    "Expiration": {"Days": 7}
  }]
}
```

## Cost Optimization

- **Lambda**: Pay-per-request (~$1/month for hackathon)
- **ElastiCache**: Free tier 750 hrs/month (cache.t3.micro)
- **S3**: Free tier 5GB storage
- **Data Transfer**: ~$2/month

**Estimated Total: ~$3.50** for hackathon + 1 week demo

## Monitoring

- Lambda logs automatically sent to CloudWatch
- Set up billing alerts at $50, $75, $90
- Monitor Redis memory usage
- Track ElevenLabs token usage

## Troubleshooting

### Redis Connection Failed
```bash
# Check Redis is running
docker ps

# Test connection
redis-cli -h localhost -p 6379 ping
```

### Import Errors
```bash
# Ensure you're in backend directory
cd backend
python main.py
```

### Socket.IO Connection Issues
- Verify CORS origins in config
- Check firewall allows WebSocket connections
- Ensure client connects to correct URL

## Security Notes

- Never commit `.env` file
- Rotate API keys regularly
- Use IAM roles for Lambda (not hardcoded credentials)
- Validate all user inputs with Pydantic
- Set aggressive Redis TTLs to prevent data leaks
- Use HTTPS only in production

## License

Built for hackathon purposes.
