# AWS Infrastructure Setup with CDK

This directory contains AWS CDK (Cloud Development Kit) code to automatically provision all required AWS resources for Holo Tutor Hub.

## 📦 What Gets Created

✅ **S3 Bucket** - `holo-tutor-recordings-2025`
- CORS enabled for frontend access
- Lifecycle rule: Auto-delete files after 7 days
- Server-side encryption (SSE-S3)
- Pre-signed URL support

⏸️ **ElastiCache Redis** - (Optional, commented out)
- Use local Docker Redis for development
- Uncomment code in `app.py` for production Redis

## 🚀 Quick Setup (One Command!)

### Prerequisites

1. **Install AWS CLI**
   ```bash
   # Windows (PowerShell as Admin)
   winget install Amazon.AWSCLI
   
   # Or download from: https://aws.amazon.com/cli/
   ```

2. **Install Node.js** (required for CDK)
   ```bash
   # Download from: https://nodejs.org/ (LTS version)
   ```

3. **Configure AWS Credentials**
   ```bash
   aws configure
   ```
   
   Enter:
   - AWS Access Key ID: (from IAM user)
   - AWS Secret Access Key: (from IAM user)
   - Default region: `ap-south-1` (Mumbai)
   - Default output format: `json`

### Deploy Infrastructure

```bash
# Navigate to infrastructure directory
cd infrastructure

# Install Python dependencies
pip install -r requirements.txt

# Install CDK CLI globally
npm install -g aws-cdk

# Bootstrap CDK (first time only)
cdk bootstrap aws://ACCOUNT-ID/ap-south-1

# Deploy the stack
cdk deploy
```

**That's it!** CDK will:
1. Create the S3 bucket with all configurations
2. Set up CORS automatically
3. Add lifecycle rules
4. Output the bucket name

## 📋 After Deployment

1. **Note the outputs** from `cdk deploy`:
   ```
   Outputs:
   HoloTutorInfraStack.S3BucketName = holo-tutor-recordings-2025
   ```

2. **Update your `backend/.env` file**:
   ```bash
   S3_BUCKET_NAME=holo-tutor-recordings-2025
   AWS_REGION=ap-south-1
   ```

3. **Get your AWS credentials** (if not already set):
   ```bash
   aws iam create-access-key --user-name your-username
   ```

## 🔧 CDK Commands

```bash
# See what will be created
cdk diff

# Deploy changes
cdk deploy

# Destroy all resources (cleanup)
cdk destroy

# List all stacks
cdk list

# Synthesize CloudFormation template
cdk synth
```

## 🗑️ Cleanup (After Hackathon)

```bash
cd infrastructure
cdk destroy
```

This will delete:
- S3 bucket (and all files inside)
- All associated resources

## 🔍 What If I Need ElastiCache Redis?

**For development:** Use Docker (recommended)
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

**For production:** Edit `app.py`
1. Uncomment the ElastiCache sections (lines 95-160)
2. Run `cdk deploy`
3. Use the output Redis endpoint in `.env`

## 💰 Cost Estimate

With this CDK stack deployed:
- S3 storage: ~$0.023/GB/month (free tier: 5GB)
- S3 requests: ~$0.005/1000 PUT (free tier: 2000)
- **Total for hackathon:** ~$0.10

## ⚠️ Troubleshooting

### Error: "Unable to resolve AWS account"
```bash
aws configure
# Enter your credentials again
```

### Error: "Stack already exists"
```bash
cdk destroy
cdk deploy
```

### Error: "Bootstrap required"
```bash
cdk bootstrap
```

### Error: Bucket name already taken
Edit `app.py` line 31:
```python
bucket_name="holo-tutor-recordings-YOUR-UNIQUE-ID",
```

## 📚 Learn More

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [CDK Python Examples](https://github.com/aws-samples/aws-cdk-examples/tree/master/python)
