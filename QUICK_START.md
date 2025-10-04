# 🚀 Quick Start Guide

Get Holo Tutor Hub running in **15 minutes**!

## 📋 Prerequisites

1. **Install Node.js** - https://nodejs.org/ (for CDK)
2. **Install Docker Desktop** - https://www.docker.com/products/docker-desktop/ (for Redis)
3. **Install Python 3.11+** - https://www.python.org/downloads/
4. **AWS Account** - https://aws.amazon.com/

## ⚡ Step-by-Step Setup

### 1️⃣ Get API Keys (5 minutes)

#### OpenRouter (for AI)
1. Visit: https://openrouter.ai/
2. Sign up and create API key
3. Copy: `sk-or-v1-...` ✅ You already have this!

#### ElevenLabs (for voice)
1. Visit: https://elevenlabs.io/
2. Sign up and go to Profile → API Keys
3. Copy: `sk_...` ✅ You already have this!

#### D-ID (for video avatar)
1. Visit: https://studio.d-id.com/
2. Sign up and create API key
3. Copy: `Basic ...` ✅ You already have this!

### 2️⃣ Setup AWS (Automated - 5 minutes)

#### Install AWS CLI
```powershell
# Windows
winget install Amazon.AWSCLI
```

#### Configure Credentials
```bash
aws configure
```
Enter:
- **AWS Access Key ID**: Get from AWS IAM Console
- **AWS Secret Access Key**: Get from AWS IAM Console  
- **Default region**: `ap-south-1`
- **Output format**: `json`

#### Deploy Infrastructure (ONE COMMAND!)
```bash
cd infrastructure
.\deploy.ps1
```

This automatically creates:
- ✅ S3 bucket with CORS
- ✅ Lifecycle rules
- ✅ All permissions

**Note the S3 bucket name** from the output!

### 3️⃣ Configure Backend (2 minutes)

Edit `backend/.env`:
```bash
# API Keys
OPENROUTER_API_KEY=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
ELEVENLABS_API_KEY=sk_44045ba7600c363c2dba865cda13d5797d6de8f96f7f8084
DID_API_KEY=aGViYmFyYWRpdGh5YTY5QGdtYWlsLmNvbQ:_Mcl29JgZ5kj_qTLz5Lnl

# AWS (from CDK output and aws configure)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
S3_BUCKET_NAME=holo-tutor-recordings-2025

# Redis (local)
REDIS_URL=redis://localhost:6379

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Environment
ENV=development
```

### 4️⃣ Start Services (2 minutes)

#### Terminal 1 - Redis
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

#### Terminal 2 - Backend
```bash
cd backend
pip install -r requirements.txt
python run_dev.py
```

You should see:
```
🚀 Starting Holo Tutor Hub Backend
✨ Press CTRL+C to stop the server
INFO: Uvicorn running on http://0.0.0.0:8000
```

#### Terminal 3 - Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5️⃣ Test Everything

**Backend:**
```bash
# Health check
curl http://localhost:8000/health
# Should return: {"status": "healthy", "redis_connected": true}

# Get AI tutors
curl http://localhost:8000/api/companions
```

**Frontend:**
Open browser: http://localhost:8080

---

## ✅ You're Ready!

Your full stack is now running:
- ✅ Backend API on port 8000
- ✅ Frontend on port 8080
- ✅ Redis on port 6379
- ✅ S3 bucket for audio storage
- ✅ AI responses (Gemini)
- ✅ Voice synthesis (ElevenLabs)
- ✅ Video avatars (D-ID)
- ✅ WebRTC signaling

---

## 🎯 Next Steps

1. **Select an AI tutor** on the frontend
2. **Start video call** - WebRTC connection
3. **Send a message** - AI responds with text, audio, and video avatar!
4. **Test recording** - Audio saved to S3

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Redis is running
docker ps

# Check .env file has all values
cat backend/.env

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### S3 upload fails
```bash
# Test AWS credentials
aws s3 ls

# Verify bucket exists
aws s3 ls s3://holo-tutor-recordings-2025
```

### Redis connection error
```bash
# Restart Redis
docker restart $(docker ps -q --filter ancestor=redis:7-alpine)

# Or start fresh
docker run -d -p 6379:6379 redis:7-alpine
```

---

## 💰 Costs

- OpenRouter: $0 (free $5 credit)
- ElevenLabs: $0 (free 10K chars)
- D-ID: $0 (free 20 credits)
- AWS S3: ~$0.10/month (free tier eligible)
- Total: **~$0 for hackathon!**

---

## 🗑️ Cleanup After Hackathon

```bash
# Stop services
docker stop $(docker ps -q)

# Delete AWS resources
cd infrastructure
cdk destroy

# Rotate API keys
# - OpenRouter dashboard
# - ElevenLabs dashboard
# - D-ID dashboard
```

---

Need help? Check:
- `backend/README.md` - Backend details
- `infrastructure/README.md` - AWS CDK details
- `AWS_SETUP_GUIDE.md` - Manual AWS setup
