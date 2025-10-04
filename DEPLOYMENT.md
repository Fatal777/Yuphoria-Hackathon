# Deployment Guide

## Quick Start

### Backend (AWS Lambda)

1. **Setup Redis**
   - Create ElastiCache cluster (cache.t3.micro)
   - Note endpoint URL

2. **Setup S3**
   - Create bucket for audio storage
   - Add lifecycle policy (delete after 7 days)

3. **Deploy Lambda**
```bash
cd backend
pip install -r requirements.txt -t package/
cp -r . package/
cd package && zip -r ../deployment.zip . && cd ..
aws lambda create-function --function-name holo-tutor-backend \
  --runtime python3.11 --handler main.handler --zip-file fileb://deployment.zip
```

4. **Setup API Gateway**
   - Create HTTP API
   - Add route: ANY /{proxy+} → Lambda
   - Enable CORS

5. **Configure Environment Variables**
   - OPENROUTER_API_KEY
   - ELEVENLABS_API_KEY
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - S3_BUCKET_NAME
   - REDIS_URL
   - ALLOWED_ORIGINS

### Frontend (Vercel)

1. **Deploy**
```bash
cd frontend
vercel --prod
```

2. **Environment Variables**
   - VITE_API_URL=https://your-api-gateway-url
   - VITE_SOCKET_URL=https://your-api-gateway-url

3. **Update Backend CORS**
   - Add Vercel URL to ALLOWED_ORIGINS in Lambda

## Testing

```bash
# Health check
curl https://your-api/health

# Companions
curl https://your-api/api/companions
```

See backend/README.md for detailed instructions.
