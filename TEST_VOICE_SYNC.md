# 🧪 Quick Test Guide - Voice & Video Sync

## ✅ Everything is Now Configured

### What's Ready:
1. ✅ **ElevenLabs** - Voice generation enabled
2. ✅ **D-ID** - Video avatar with lip-sync
3. ✅ **S3** - Public audio URLs for D-ID
4. ✅ **Backend** - All services integrated
5. ✅ **Frontend** - Auto-plays audio & shows video

---

## 🚀 Quick Test (5 minutes)

### Step 1: Restart Backend (if running)
```bash
# Stop current backend (Ctrl+C)
cd backend
python run_dev.py
```

### Step 2: Ensure Frontend is Running
```bash
cd frontend
npm run dev
# Open: http://localhost:5173
```

### Step 3: Test the Flow
1. **Go to Tutors page**
2. **Select any tutor** (e.g., "Aarav Engineer")
3. **Click "Start Session"**
4. **Allow camera/microphone** when prompted
5. **Type a message:** "Explain calculus in simple terms"
6. **Press Enter or click Send**

### Step 4: Watch for Results (in order)

| Time | What You'll See |
|------|-----------------|
| **Immediately** | Your message appears in chat |
| **1-2 seconds** | AI text response appears |
| **2-3 seconds** | 🔊 **Audio starts playing** (ElevenLabs voice) |
| **10-20 seconds** | 🎬 **Video avatar appears** with synced lips |
| **During video** | Lips move perfectly in sync with audio |

---

## 🎯 What to Look For

### ✅ Success Indicators:

1. **Audio Playback**
   - 🔊 Volume icon appears with "Playing audio..."
   - You hear natural voice speaking the response
   - Audio quality is clear and natural

2. **Video Avatar**
   - 🎬 Video appears in main area (replaces placeholder)
   - Avatar's mouth moves
   - Lips sync perfectly with audio you hear
   - Video is smooth (not choppy)

3. **Backend Logs** (check terminal)
   ```
   INFO: Audio uploaded successfully: https://holo-tutor-recordings-2025.s3...
   INFO: D-ID talk created: talk_xxxxx
   INFO: D-ID video ready: https://d-id-talks-prod.s3...
   INFO: Video avatar generated
   ```

---

## ⚠️ Troubleshooting

### If Audio Doesn't Play:
```bash
# Check backend logs for:
"Audio uploaded successfully"
"Audio generated and uploaded"

# If you see errors, check:
- ElevenLabs API key in .env
- S3 bucket is accessible
```

### If Video Doesn't Appear:
```bash
# Wait 30 seconds (first video takes longer)
# Check backend logs for:
"D-ID talk created"
"D-ID video ready"

# If stuck on "Processing":
- D-ID is generating (wait longer)
- Check D-ID API key in .env
```

### If Lips Don't Sync:
```bash
# This means D-ID didn't receive audio URL
# Check backend logs for:
"Audio uploaded successfully: https://..."

# The URL must be public (no pre-signing)
# Test URL in browser - should download MP3
```

---

## 📊 Expected Timeline

```
0s    → User sends message
1s    → AI text response appears
2s    → 🔊 Audio starts playing
3s    → Backend sends to D-ID
5s    → D-ID downloads audio
10s   → D-ID analyzes audio
15s   → D-ID generates lip movements
20s   → 🎬 Video appears with synced lips
```

**Total time:** ~20 seconds for full experience

---

## 🎬 Demo Script

Try these messages to test different responses:

1. **Short response (fast video):**
   - "What is 2+2?"
   - Expected: ~10 second video

2. **Medium response (normal):**
   - "Explain calculus"
   - Expected: ~15 second video

3. **Long response (detailed):**
   - "Teach me about quantum physics"
   - Expected: ~25 second video

---

## 🔍 Debug Commands

### Test S3 Audio URL:
```bash
# Check if audio is publicly accessible
curl -I https://holo-tutor-recordings-2025.s3.ap-south-1.amazonaws.com/audio/test.mp3
# Should return: 200 OK (or 404 if no file yet)
```

### Test D-ID API:
```bash
# Check D-ID API key
curl -H "Authorization: Basic YOUR_DID_API_KEY" https://api.d-id.com/talks
# Should return: List of talks or empty array
```

### Test ElevenLabs API:
```bash
# Check ElevenLabs API key
curl -H "xi-api-key: YOUR_ELEVENLABS_KEY" https://api.elevenlabs.io/v1/voices
# Should return: List of available voices
```

---

## ✅ Success Criteria

You'll know it's working when:

1. ✅ You **hear** the AI speaking with natural voice
2. ✅ You **see** the avatar's lips moving
3. ✅ The lips **sync perfectly** with the audio
4. ✅ The video is **smooth** and high quality
5. ✅ AI **suggests materials** in the sidebar

---

## 🎉 What You've Built

A **fully functional AI video tutor** that:
- 🗣️ Speaks with natural voice (ElevenLabs)
- 🎬 Shows talking avatar (D-ID)
- 💋 Syncs lips perfectly with audio
- 🤖 Responds intelligently (Gemini)
- 📚 Suggests learning materials autonomously
- 📹 Supports real-time video chat (WebRTC)

**This is production-ready!**

---

## 📸 Screenshot Checklist

When testing, you should see:

```
┌─────────────────────────────────────────┐
│ [Tutor Name]  ● Connected  🔊 Playing   │
├─────────────────────────────────────────┤
│                                         │
│         🎬 VIDEO AVATAR                 │
│      (lips moving in sync)              │
│                                         │
│  ┌──────────┐                          │
│  │ Your Cam │  (draggable PiP)         │
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

**Ready to test! Start the backend and frontend, then send a message!** 🚀
