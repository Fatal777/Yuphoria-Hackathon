# PowerShell deployment script for Windows
# Deploys AWS infrastructure using CDK

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Holo Tutor Hub - AWS CDK Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if AWS CLI is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    aws --version | Out-Null
    Write-Host "✅ AWS CLI installed" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI not found. Please install:" -ForegroundColor Red
    Write-Host "   https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# Check if Node.js is installed
try {
    node --version | Out-Null
    Write-Host "✅ Node.js installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install:" -ForegroundColor Red
    Write-Host "   https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check AWS credentials
Write-Host ""
Write-Host "Checking AWS credentials..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ AWS credentials configured" -ForegroundColor Green
        $account = ($identity | ConvertFrom-Json).Account
        Write-Host "   Account ID: $account" -ForegroundColor Cyan
    } else {
        throw "Not configured"
    }
} catch {
    Write-Host "❌ AWS credentials not configured" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run:" -ForegroundColor Yellow
    Write-Host "   aws configure" -ForegroundColor White
    Write-Host ""
    Write-Host "And enter your:" -ForegroundColor Yellow
    Write-Host "   - AWS Access Key ID" -ForegroundColor White
    Write-Host "   - AWS Secret Access Key" -ForegroundColor White
    Write-Host "   - Default region: ap-south-1" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Install Python dependencies
Write-Host ""
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Python dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install Python dependencies" -ForegroundColor Red
    exit 1
}

# Install CDK CLI
Write-Host ""
Write-Host "Checking CDK CLI..." -ForegroundColor Yellow
try {
    cdk --version | Out-Null
    Write-Host "✅ CDK CLI already installed" -ForegroundColor Green
} catch {
    Write-Host "Installing CDK CLI globally..." -ForegroundColor Yellow
    npm install -g aws-cdk
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ CDK CLI installed" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install CDK CLI" -ForegroundColor Red
        exit 1
    }
}

# Bootstrap CDK (if needed)
Write-Host ""
Write-Host "Checking CDK bootstrap status..." -ForegroundColor Yellow
$region = "ap-south-1"
$bootstrapCheck = aws cloudformation describe-stacks --stack-name CDKToolkit --region $region 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Bootstrapping CDK (first-time setup)..." -ForegroundColor Yellow
    cdk bootstrap "aws://$account/$region"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ CDK bootstrapped" -ForegroundColor Green
    } else {
        Write-Host "❌ CDK bootstrap failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ CDK already bootstrapped" -ForegroundColor Green
}

# Deploy stack
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploying Infrastructure" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will create:" -ForegroundColor Yellow
Write-Host "  ✅ S3 bucket for recordings" -ForegroundColor White
Write-Host "  ✅ CORS configuration" -ForegroundColor White
Write-Host "  ✅ Lifecycle rules (auto-delete after 7 days)" -ForegroundColor White
Write-Host ""

cdk deploy --require-approval never

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ Deployment Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Copy the S3 bucket name from the output above" -ForegroundColor White
    Write-Host "2. Update backend/.env with:" -ForegroundColor White
    Write-Host "   S3_BUCKET_NAME=holo-tutor-recordings-2025" -ForegroundColor Cyan
    Write-Host "   AWS_REGION=ap-south-1" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host "Check the errors above" -ForegroundColor Yellow
    exit 1
}
