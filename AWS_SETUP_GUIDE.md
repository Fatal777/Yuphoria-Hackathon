# AWS Setup Guide for Holo Tutor Hub

## 🎯 Overview

You need **2 AWS services** for the backend to work:
1. **S3 Bucket** - For storing audio files (required)
2. **ElastiCache Redis** - For session state (optional for local dev)

**Estimated time:** 20 minutes  
**Cost:** $0 (within free tier)

---

## 📦 Step 1: Create S3 Bucket

### Using AWS Console:

1. **Go to S3 Console**
   - Visit: https://console.aws.amazon.com/s3/
   - Click **"Create bucket"**

2. **Bucket Configuration:**
   ```
   Bucket name: holo-tutor-recordings-[your-unique-id]
   Example: holo-tutor-recordings-2025
   
   AWS Region: us-east-1 (or your preferred region)
   
   Object Ownership: ACLs disabled (recommended)
   
   Block Public Access: UNCHECK "Block all public access"
   ⚠️ Check "I acknowledge..." box
   
   Bucket Versioning: Disabled
   
   Tags (optional):
   - Key: Project, Value: HoloTutorHub
   - Key: Environment, Value: Development
   
   Encryption: SSE-S3 (default)
   ```

3. **Click "Create bucket"**

4. **Configure CORS** (allows frontend to access files)
   - Click on your bucket name
   - Go to **Permissions** tab
   - Scroll to **Cross-origin resource sharing (CORS)**
   - Click **Edit** and paste:

   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

5. **Add Lifecycle Rule** (auto-delete old audio after 7 days)
   - Go to **Management** tab
   - Click **Create lifecycle rule**
   ```
   Rule name: DeleteOldAudio
   Choose a rule scope: Apply to all objects
   
   Lifecycle rule actions:
   ✅ Permanently delete noncurrent versions of objects
   
   Days after objects become noncurrent: 7
   ```
   - Click **Create rule**

6. **Save your bucket name** for `.env` file:
   ```bash
   S3_BUCKET_NAME=holo-tutor-recordings-2025
   ```

---

## 🔑 Step 2: Get AWS Credentials

### Option A: Create New IAM User (Recommended)

1. **Go to IAM Console**
   - Visit: https://console.aws.amazon.com/iam/
   - Click **Users** → **Create user**

2. **User Details:**
   ```
   User name: holo-tutor-backend
   
   ✅ Provide user access to the AWS Management Console (optional)
   ```

3. **Set Permissions:**
   - Select **Attach policies directly**
   - Search and attach:
     - ✅ `AmazonS3FullAccess`
     - ✅ `AmazonElastiCacheFullAccess` (if using Redis)
   
   Or create custom policy (more secure):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::holo-tutor-recordings-*/*"
       }
     ]
   }
   ```

4. **Review and Create User**

5. **Create Access Key:**
   - Click on the user you just created
   - Go to **Security credentials** tab
   - Click **Create access key**
   - Choose **Application running outside AWS**
   - Click **Next** → **Create access key**
   
   **⚠️ IMPORTANT:** Copy both values immediately:
   ```bash
   AWS_ACCESS_KEY_ID=AKIA... (20 chars)
   AWS_SECRET_ACCESS_KEY=... (40 chars)
   ```
   
   You won't be able to see the secret key again!

### Option B: Use Existing Credentials

If you already have AWS CLI configured:

```bash
cat ~/.aws/credentials
```

Use the `aws_access_key_id` and `aws_secret_access_key` values.

---

## 🗄️ Step 3: Setup Redis (Optional)

### Option A: Local Redis (Recommended for Development)

**Fastest setup using Docker:**

```bash
# Start Redis container
docker run -d --name holo-tutor-redis -p 6379:6379 redis:7-alpine

# Verify it's running
docker ps

# Test connection
docker exec -it holo-tutor-redis redis-cli ping
# Should return: PONG
```

Update `.env`:
```bash
REDIS_URL=redis://localhost:6379
```

### Option B: AWS ElastiCache (For Production)

1. **Go to ElastiCache Console**
   - Visit: https://console.aws.amazon.com/elasticache/
   - Click **Get started** or **Create**

2. **Choose Redis**

3. **Configuration:**
   ```
   Cluster mode: Disabled
   
   Name: holo-tutor-redis
   
   Engine version: 7.0
   
   Node type: cache.t3.micro (free tier eligible)
   
   Number of replicas: 0 (single node to save costs)
   
   Multi-AZ: Disabled
   
   Subnet group: Create new or use default
   
   Security: Create new security group
   ```

4. **Security Group Configuration:**
   - After creation, note the security group ID
   - Go to **EC2 Console** → **Security Groups**
   - Find the Redis security group
   - **Edit inbound rules:**
     ```
     Type: Custom TCP
     Port: 6379
     Source: 0.0.0.0/0 (for development)
     or: Your IP address (more secure)
     ```

5. **Get Redis Endpoint:**
   - Wait 5-10 minutes for cluster to be available
   - Go to cluster details
   - Copy **Primary endpoint**
   - Format: `xxx.cache.amazonaws.com:6379`

6. **Update `.env`:**
   ```bash
   REDIS_URL=redis://xxx.cache.amazonaws.com:6379
   ```

---

## ✅ Step 4: Update Backend `.env` File

Edit `backend/.env` with your AWS values:

```bash
# API Keys
OPENROUTER_API_KEY=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
ELEVENLABS_API_KEY=sk_44045ba7600c363c2dba865cda13d5797d6de8f96f7f8084
DID_API_KEY=aGViYmFyYWRpdGh5YTY5QGdtYWlsLmNvbQ:_Mcl29JgZ5kj_qTLz5Lnl

# AWS Configuration
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
S3_BUCKET_NAME=holo-tutor-recordings-2025

# Redis Configuration
REDIS_URL=redis://localhost:6379

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Environment
ENV=development
```

---

## 🧪 Step 5: Test Your Setup

### Test S3 Connection:

```bash
cd backend
python -c "
import boto3
from dotenv import load_dotenv
import os

load_dotenv()

s3 = boto3.client('s3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)

bucket = os.getenv('S3_BUCKET_NAME')
try:
    s3.head_bucket(Bucket=bucket)
    print(f'✅ S3 bucket {bucket} is accessible!')
except Exception as e:
    print(f'❌ Error: {e}')
"
```

### Test Redis Connection:

```bash
python -c "
import redis
from dotenv import load_dotenv
import os

load_dotenv()

try:
    r = redis.from_url(os.getenv('REDIS_URL'))
    r.ping()
    print('✅ Redis connection successful!')
except Exception as e:
    print(f'❌ Error: {e}')
"
```

---

## 🚀 Step 6: Run the Backend

```bash
cd backend

# Install dependencies (if not done)
pip install -r requirements.txt

# Start the server
python run_dev.py
```

You should see:
```
🚀 Starting Holo Tutor Hub Backend (Development Mode)
...
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Test Endpoints:

```bash
# Health check
curl http://localhost:8000/health

# Should return:
{
  "status": "healthy",
  "timestamp": "2025-10-04T...",
  "redis_connected": true,
  "environment": "development"
}

# Get companions
curl http://localhost:8000/api/companions
```

---

## 💰 Cost Breakdown

| Service | Configuration | Monthly Cost | Free Tier |
|---------|--------------|--------------|-----------|
| S3 Storage | 2GB | $0.046 | ✅ 5GB free |
| S3 Requests | 5K PUT, 50K GET | $0.50 | ✅ 20K GET free |
| ElastiCache | cache.t3.micro | $12.40 | ✅ 750 hrs free |
| Data Transfer | 10GB out | $0.90 | ✅ 1GB free |
| **Total** | | **~$0.50/month** | (within free tier) |

**For hackathon (7 days):** Approximately **$0.12 total**

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** (it's in `.gitignore`)
2. **Rotate AWS credentials** after hackathon
3. **Use IAM roles** instead of access keys in production
4. **Enable S3 bucket versioning** for important data
5. **Set up CloudWatch billing alerts:**
   - Go to AWS Console → Billing → Budgets
   - Create budget: $10/month with alerts at 80%, 90%, 100%

---

## ⚠️ Troubleshooting

### S3 Access Denied Error:
```
Check: IAM user has S3 permissions
Check: Bucket name is correct in .env
Check: AWS credentials are valid
```

### Redis Connection Timeout:
```
Check: Redis is running (docker ps)
Check: Security group allows port 6379
Check: REDIS_URL format is correct
```

### Backend Won't Start:
```
Check: All .env variables are set
Check: Python dependencies installed (pip install -r requirements.txt)
Check: Redis is running
```

---

## 🎉 You're Ready!

Once all tests pass, your backend is fully configured with:
- ✅ S3 for audio storage
- ✅ Redis for session state
- ✅ All API keys configured
- ✅ D-ID video avatar integration

**Next steps:**
1. Start building the frontend
2. Test WebRTC video calling
3. Test AI responses with video avatars

Need help? Check the logs in your terminal!
