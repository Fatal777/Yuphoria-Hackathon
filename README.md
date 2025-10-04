# 🎓 Holo Tutor Hub - AI Video Tutoring Platform

> **Yuphoria Hackathon Submission** - An intelligent video tutoring platform with AI-powered tutors, real-time video chat, and interactive learning experiences.

## 🌟 Features

- 🎥 **Real-time Video Chat** - WebRTC-powered video calls with AI tutors
- 🤖 **AI-Powered Tutors** - Intelligent tutors for Mathematics and Physics
- 🗣️ **Voice Synthesis** - Natural-sounding tutor voices via ElevenLabs
- 🎬 **Talking Avatars** - Animated video avatars using D-ID technology
- 💬 **Real-time Chat** - Socket.IO-based instant messaging
- 📊 **Session History** - Track your learning progress
- ☁️ **Cloud Storage** - AWS S3 for recording storage

## 🏗️ Architecture

```
holo-tutor-hub/
├── frontend/              # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Route pages
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities
│   └── package.json
│
├── backend/              # FastAPI + Python
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── models/          # Data models
│   ├── utils/           # Helper functions
│   ├── main.py          # Application entry
│   └── requirements.txt
│
└── infrastructure/      # AWS CDK (optional)
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **Docker Desktop** (for Redis)
- **Git**

### Required API Keys

You'll need accounts and API keys from:
1. [OpenRouter](https://openrouter.ai/) - For AI responses (Gemini)
2. [ElevenLabs](https://elevenlabs.io/) - For voice synthesis
3. [D-ID](https://www.d-id.com/) - For talking avatars
4. [AWS](https://aws.amazon.com/) - For S3 storage

---

## 📦 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/Fatal777/Yuphoria-Hackathon.git
cd Yuphoria-Hackathon
```

### Step 2: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create environment file from example
cp .env.example .env

# Edit .env and add your API keys
# Use any text editor (notepad, VS Code, etc.)
notepad .env

# Install Python dependencies
pip install -r requirements.txt

# Start Redis using Docker
docker-compose up -d

# Verify Redis is running
docker ps
```

**Backend `.env` Configuration:**
```env
# API Keys
OPENROUTER_API_KEY=your_openrouter_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here
DID_API_KEY=your_did_key_here

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your-bucket-name

# Redis Configuration
REDIS_URL=redis://localhost:6379

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Environment
ENV=development
```

### Step 3: Setup Frontend

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Create environment file
cp .env.example .env

# Install dependencies
npm install
```

**Frontend `.env` Configuration:**
```env
VITE_API_URL=http://localhost:8000
VITE_SOCKET_URL=http://localhost:8000
```

---

## ▶️ Running the Application

### Terminal 1: Start Backend

```bash
cd backend
python run_dev.py
```

You should see:
```
🚀 Starting Holo Tutor Hub Backend (Development Mode)
📍 Server Info:
   - REST API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Socket.IO: ws://localhost:8000/socket.io
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.4.19  ready in 278 ms
➜  Local:   http://localhost:8080/
```

### Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:8080
- **Backend API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## 🎯 Usage

1. **Browse Tutors** - View available AI tutors on the home page
2. **Start Session** - Click on a tutor to begin a video session
3. **Video Chat** - Interact with the AI tutor via video and text
4. **Ask Questions** - Type or speak your questions
5. **Get Responses** - Receive AI-generated answers with voice and video

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **Socket.IO Client** - Real-time communication
- **WebRTC** - Video streaming

### Backend
- **FastAPI** - Web framework
- **Python 3.9+** - Programming language
- **Socket.IO** - WebSocket server
- **Redis** - Session storage
- **httpx** - HTTP client
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### AI & Media Services
- **OpenRouter (Gemini)** - AI conversation generation
- **ElevenLabs** - Text-to-speech synthesis
- **D-ID** - Talking avatar generation
- **AWS S3** - Cloud storage for recordings

### Infrastructure
- **Docker** - Redis containerization
- **AWS CDK** - Infrastructure as code (optional)

---

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

- `GET /api/companions` - List available tutors
- `POST /api/video/rooms` - Create video session
- `GET /api/sessions/history` - Get session history
- `GET /health` - Health check

---

## 🐛 Troubleshooting

### Redis Connection Failed
```bash
# Check if Redis is running
docker ps

# Restart Redis
docker-compose restart
```

### Port Already in Use
```bash
# Backend (port 8000)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Frontend (port 8080)
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### WebSocket Connection Failed
- Ensure backend is running with `python run_dev.py` (not `uvicorn main:app`)
- Check CORS settings in backend `.env`
- Verify frontend `.env` has correct `VITE_SOCKET_URL`

### API Key Errors
- Verify all API keys are correctly set in `backend/.env`
- Check API key validity on respective platforms
- Ensure no extra spaces or quotes in `.env` file

---

## 🔒 Security Notes

- ⚠️ **Never commit `.env` files** to Git
- ⚠️ **Keep API keys secure** and rotate them regularly
- ⚠️ **Use environment variables** for sensitive data
- ⚠️ The `.gitignore` file protects `.env` files automatically

---

## 📝 Project Status

### ✅ Completed Features
- AI tutor selection interface
- Real-time video chat setup
- Text-based chat with AI
- Backend API with FastAPI
- Redis integration
- AWS S3 setup
- Docker configuration

### 🚧 In Progress
- Voice input from user
- Full video avatar integration
- Session recording
- Advanced analytics

---

## 👥 Team

**Yuphoria Hackathon Submission**

---

## 📄 License

This project is created for the Yuphoria Hackathon.

---

## 🙏 Acknowledgments

- OpenRouter for AI API access
- ElevenLabs for voice synthesis
- D-ID for avatar technology
- shadcn/ui for beautiful components
- The open-source community

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation at `/docs`
3. Verify all environment variables are set correctly
4. Ensure all services (Redis, Backend, Frontend) are running

---

**Made with ❤️ for Yuphoria Hackathon**
