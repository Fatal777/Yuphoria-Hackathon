# 🎙️ Voice & Video Sync Guide

## ✅ What's Been Configured

### 1. **ElevenLabs Voice Generation**
- ✅ API key enabled with all permissions
- ✅ Generates natural voice from AI text responses
- ✅ Audio saved to S3 with public access
- ✅ Returns public URL for D-ID to access

### 2. **D-ID Video Avatar with Lip-Sync**
- ✅ Receives audio URL from ElevenLabs
- ✅ Generates talking avatar with perfect lip-sync
- ✅ Uses companion's avatar image
- ✅ Returns video URL for playback

### 3. **S3 Public Access**
- ✅ Audio files uploaded with `ACL='public-read'`
- ✅ Bucket policy allows public read on `audio/*` files
- ✅ Public URLs generated (no pre-signing needed)
- ✅ D-ID can fetch audio directly

---

## 🔄 Complete Flow

```
User sends message
    ↓
Backend receives via Socket.IO
    ↓
1. Gemini AI generates text response
    ↓
2. ElevenLabs generates voice audio
    ↓
3. Audio uploaded to S3 (public URL)
    ↓
4. D-ID receives:
   - Text (for fallback)
   - Audio URL (for lip-sync)
   - Avatar image URL
    ↓
5. D-ID generates video with synced lips
    ↓
6. Backend returns to frontend:
   {
     "message": "text response",
     "audio_url": "https://s3.../audio.mp3",
     "video_url": "https://d-id.../video.mp4"
   }
    ↓
7. Frontend:
   - Displays text in chat
   - Auto-plays audio
   - Shows video avatar speaking
```

---

## 🎯 Key Components

### Backend: `services/ai_tutor.py`
```python
async def generate_response(room_id, user_message, companion_id):
    # 1. Generate text (Gemini)
    response_text = await _call_gemini(prompt)
    
    # 2. Generate audio (ElevenLabs)
    audio_url = await _generate_audio(
        response_text,
        voice_id,
        room_id
    )
    
    # 3. Generate video (D-ID with audio)
    video_result = await video_avatar_service.create_talking_avatar(
        text=response_text,
        audio_url=audio_url,  # ← Syncs lips to this audio
        avatar_image_url=avatar_image_url,
        voice_id=voice_id
    )
    
    return response_text, audio_url, video_url
```

### Backend: `services/video_avatar.py`
```python
async def create_talking_avatar(text, audio_url, avatar_image_url):
    payload = {
        "source_url": avatar_image_url,
        "script": {
            "type": "audio",  # ← Uses audio for lip-sync
            "audio_url": audio_url,  # ← Public S3 URL
            "subtitles": "false",
            "ssml": "false"
        },
        "config": {
            "fluent": "false",
            "pad_audio": "0.0",
            "stitch": True
        }
    }
    
    # D-ID fetches audio and generates synced video
    response = await http_client.post(did_api_url, json=payload)
```

### Backend: `services/s3_client.py`
```python
async def upload_audio(room_id, audio_bytes, filename):
    # Upload with public read access
    s3_client.put_object(
        Bucket=bucket_name,
        Key=f"audio/{room_id}/{filename}",
        Body=audio_bytes,
        ContentType='audio/mpeg',
        ACL='public-read'  # ← D-ID can access
    )
    
    # Return public URL
    return f"https://{bucket}.s3.{region}.amazonaws.com/{key}"
```

### Frontend: `components/VideoCallModal.tsx`
```tsx
// Auto-play audio when AI responds
useEffect(() => {
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.sender === "ai" && lastMessage.audio_url) {
    playAudio(lastMessage.audio_url);
  }
}, [messages]);

// Display video avatar
{messages[messages.length - 1]?.video_url && (
  <video
    src={messages[messages.length - 1].video_url}
    autoPlay
    playsInline
    className="w-full h-full object-cover"
  />
)}
```

---

## ⚙️ Configuration

### S3 Bucket Policy (Applied)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::holo-tutor-recordings-2025/audio/*"
    }
  ]
}
```

### Environment Variables
```bash
# .env
ELEVENLABS_API_KEY=sk_...  # ✅ All permissions enabled
DID_API_KEY=aGViYmFy...     # ✅ Configured
AWS_ACCESS_KEY_ID=AKIA...   # ✅ Configured
AWS_SECRET_ACCESS_KEY=...   # ✅ Configured
S3_BUCKET_NAME=holo-tutor-recordings-2025  # ✅ Public read enabled
```

---

## 🧪 Testing

### 1. **Start Backend**
```bash
cd backend
python run_dev.py
```

### 2. **Start Frontend**
```bash
cd frontend
npm run dev
```

### 3. **Test Flow**
1. Open http://localhost:5173
2. Go to Tutors page
3. Select any tutor
4. Click "Start Session"
5. Allow camera/mic permissions
6. Send a message: "Explain calculus"
7. **Watch for:**
   - ✅ AI text response appears
   - ✅ Audio plays automatically (ElevenLabs voice)
   - ✅ Video avatar appears (may take 10-20 seconds)
   - ✅ Avatar's lips sync perfectly with audio

### 4. **Check Logs**
Backend terminal should show:
```
INFO: Audio uploaded successfully: https://holo-tutor-recordings-2025.s3.ap-south-1.amazonaws.com/audio/...
INFO: D-ID talk created: talk_xxxxx
INFO: D-ID video ready: https://d-id-talks-prod.s3.us-west-2.amazonaws.com/...
INFO: Video avatar generated: https://...
```

---

## 🎬 D-ID Video Generation Timeline

| Time | Status | What's Happening |
|------|--------|------------------|
| 0s | Request sent | Backend sends audio URL to D-ID |
| 0-2s | Processing | D-ID downloads audio from S3 |
| 2-10s | Generating | D-ID analyzes audio and generates lip movements |
| 10-20s | Rendering | D-ID renders final video with synced lips |
| 20s+ | Complete | Video URL returned and displayed |

**Note:** First video may take longer (~30s). Subsequent videos are faster (~10-15s).

---

## 🔍 Troubleshooting

### Audio doesn't play
- ✅ Check: Audio URL is public (test in browser)
- ✅ Check: Browser allows autoplay
- ✅ Check: ElevenLabs API key has permissions

### Video doesn't appear
- ⏳ Wait 20-30 seconds (D-ID generation time)
- ✅ Check: Audio URL is accessible by D-ID
- ✅ Check: D-ID API key is valid
- ✅ Check backend logs for D-ID errors

### Lips don't sync
- ✅ Verify: Audio URL is passed to D-ID (not text-to-speech)
- ✅ Check: `script.type` is `"audio"` not `"text"`
- ✅ Check: Audio file is valid MP3 format

### S3 Access Denied
```bash
# Re-apply bucket policy
cd infrastructure
aws s3api put-bucket-policy --bucket holo-tutor-recordings-2025 --policy file://update-bucket-policy.json
```

---

## 📊 API Usage

### ElevenLabs
- **Free tier:** 10,000 characters/month
- **Cost:** $0.30 per 1,000 characters after free tier
- **Voice quality:** High (natural, emotional)

### D-ID
- **Free tier:** 20 credits (20 videos)
- **Cost:** $0.30 per video after free tier
- **Generation time:** 10-20 seconds per video

### AWS S3
- **Storage:** $0.023 per GB/month
- **Requests:** $0.005 per 1,000 PUT requests
- **Data transfer:** $0.09 per GB (first 1GB free)

---

## ✅ Verification Checklist

- [x] ElevenLabs API key enabled
- [x] D-ID API key configured
- [x] S3 bucket created
- [x] S3 public read policy applied
- [x] Audio uploads with public ACL
- [x] Public URLs generated (no pre-signing)
- [x] D-ID receives audio URL
- [x] Video generation with lip-sync
- [x] Frontend plays audio automatically
- [x] Frontend displays video avatar
- [x] Backend logs show success

---

## 🎉 Expected Result

When you send a message:

1. **Text appears immediately** in chat
2. **Audio starts playing** within 1-2 seconds
3. **Video avatar appears** within 10-20 seconds
4. **Lips perfectly sync** with the audio you hear
5. **AI suggestions** appear in sidebar

The tutor now **speaks with voice** and **moves lips in sync** with the audio!

---

## 🚀 Next Steps (Optional)

1. **Faster Video Generation**
   - Use D-ID Streaming API for real-time
   - Cache common responses

2. **Better Audio Quality**
   - Use ElevenLabs Turbo model
   - Adjust voice settings (stability, clarity)

3. **Multiple Voices**
   - Different voice per tutor
   - Voice cloning for custom tutors

4. **Offline Mode**
   - Cache generated videos
   - Pre-generate common responses

---

**🎓 Your AI tutor now speaks and lip-syncs perfectly!**
