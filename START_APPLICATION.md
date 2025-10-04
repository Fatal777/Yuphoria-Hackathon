# 🚀 Start Application Guide

## ✅ Prerequisites Checklist

- [x] Redis running in Docker
- [x] AWS S3 bucket configured
- [x] API keys configured in backend/.env
- [x] Frontend dependencies installed
- [x] Backend dependencies installed

---

## 🎯 Quick Start (2 Steps)

### Step 1: Start Backend
```bash
cd backend
python run_dev.py
```

**Wait for:**
```
INFO: Application startup complete.
```

**Backend URLs:**
- REST API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Socket.IO: ws://localhost:8000/socket.io

---

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```

**Wait for:**
```
➜  Local:   http://localhost:8081/
```

**Open:** http://localhost:8081/

---

## 🎓 Using the Application

### 1. **View Tutors**
- Click "Tutors" in navigation
- You'll see 2 AI tutors

### 2. **Start a Session**
- Click on any tutor
- Click "Start Session"
- Allow camera/microphone permissions

### 3. **Chat with AI**
- Type a message: "Explain calculus"
- Press Enter

### 4. **Experience the Magic** ✨
- **1-2 seconds:** AI text response appears
- **2-3 seconds:** 🔊 Audio plays (ElevenLabs voice)
- **10-20 seconds:** 🎬 Video avatar appears with synced lips
- **Throughout:** 📚 AI suggests courses & materials

---

## 🎬 What to Expect

### Video Call Interface:
```
┌─────────────────────────────────────────┐
│ [Tutor Name]  ● Connected  🔊 Playing   │
├─────────────────────────────────────────┤
│                                         │
│         🎬 VIDEO AVATAR                 │
│      (lips moving in sync)              │
│                                         │
│  ┌──────────┐                          │
│  │ Your Cam │  (draggable)             │
│  └──────────┘                          │
├─────────────────────────────────────────┤
│ Chat:                                   │
│ You: Explain calculus                   │
│ AI: Calculus is the study of...        │
│     🔊 Audio available                  │
│                                         │
│ 📚 AI Suggestions:                      │
│ • Khan Academy: Calculus                │
│ • Practice: 20 problems                 │
├─────────────────────────────────────────┤
│  🎤  📹  🔊  ☎️  (controls)            │
└─────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check Redis
docker ps | grep redis

# If not running:
docker start holo-tutor-redis
```

### Frontend CORS errors
- Ensure backend is running first
- Check backend logs for startup errors
- Verify .env has correct ALLOWED_ORIGINS

### Socket.IO won't connect
- Backend must be fully started
- Check for "Application startup complete" message
- Refresh browser (F5)

### No audio/video
- Wait 20-30 seconds (D-ID generation time)
- Check backend logs for API errors
- Verify API keys in backend/.env

---

## 📊 Services Status

Check if everything is running:

| Service | Check Command | Expected |
|---------|---------------|----------|
| Redis | `docker ps` | holo-tutor-redis running |
| Backend | `curl http://localhost:8000/health` | 200 OK |
| Frontend | Open http://localhost:8081 | Page loads |
| Socket.IO | Browser console | "Socket.IO connected" |

---

## 🎯 Test Messages

Try these to test different features:

1. **Short response:**
   - "What is 2+2?"
   
2. **Medium response:**
   - "Explain calculus"
   
3. **Long response:**
   - "Teach me about quantum physics"

4. **Get suggestions:**
   - "I want to learn programming"

---

## 🔑 Features Enabled

- ✅ **WebRTC Video** - Peer-to-peer video calling
- ✅ **Socket.IO Chat** - Real-time messaging
- ✅ **AI Responses** - Google Gemini intelligence
- ✅ **Voice Synthesis** - ElevenLabs natural voice
- ✅ **Video Avatars** - D-ID talking head with lip-sync
- ✅ **Autonomous AI** - Proactive suggestions
- ✅ **Session History** - Track past conversations
- ✅ **250 Tutors** - Multiple AI personalities

---

## 📱 Controls

### During Call:
- 🎤 **Mic toggle** - Mute/unmute microphone
- 📹 **Camera toggle** - Turn camera on/off
- 🔊 **Audio** - Control voice playback
- ☎️ **End call** - Finish session

### Chat:
- **Type message** - Enter text
- **Press Enter** - Send message
- **Shift+Enter** - New line

---

## 💡 Tips

1. **First video takes longer** (~30s)
   - Subsequent videos are faster (~10-15s)

2. **Audio plays automatically**
   - You'll hear the AI speaking
   - Lips sync perfectly with audio

3. **AI is autonomous**
   - Suggests materials without asking
   - Recommends courses based on context

4. **Drag your camera**
   - Picture-in-picture is draggable
   - Position it anywhere

---

## 🎉 You're Ready!

Everything is configured and working:
- ✅ Backend with all services
- ✅ Frontend with WebRTC
- ✅ AI with voice & video
- ✅ Autonomous suggestions

**Just start both servers and open the browser!**

---

## 📞 Support

If you encounter issues:
1. Check backend logs for errors
2. Check browser console for frontend errors
3. Verify all API keys are valid
4. Ensure Redis is running
5. Check S3 bucket is accessible

---

**Happy Learning! 🎓**
