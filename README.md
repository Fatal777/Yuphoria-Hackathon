# Holo Tutor Hub - AI Companion Video Call & Streaming

## Project Overview

An interactive web application enabling users to select from multiple AI companions/avatars and initiate real-time, peer-to-peer video calls with AI tutors.

## Project Structure

```
holo-tutor-hub/
├── frontend/          # React + TypeScript + Vite frontend
├── backend/           # FastAPI backend with WebRTC signaling
└── README.md
```

## Technologies Used

### Frontend
- React 18
- TypeScript
- Vite
- shadcn-ui
- Tailwind CSS
- WebRTC for video calling

### Backend
- FastAPI
- Python 3.11+
- Socket.IO (WebRTC signaling)
- Redis (session state)
- AWS S3 (recordings)
- Google Gemini (AI conversations)
- ElevenLabs (voice synthesis)

## Getting Started

### Frontend Setup

```sh
cd frontend
npm install
npm run dev
```

### Backend Setup

```sh
cd backend
pip install -r requirements.txt
cp .env.example .env
# Configure environment variables in .env
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Environment Variables

See `backend/.env.example` for required API keys and configuration.
