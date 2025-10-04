"""
AWS S3 client for audio and recording uploads
"""
import boto3
from botocore.exceptions import ClientError
from typing import Optional
import asyncio
from functools import partial
from config import settings
from utils.logger import logger


class S3Client:
    """S3 client for file uploads with retry logic"""
    
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.S3_BUCKET_NAME
    
    async def _retry_operation(self, operation, max_retries: int = 3):
        """Retry S3 operation with exponential backoff"""
        for attempt in range(max_retries):
            try:
                # Run blocking S3 operation in thread pool
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(None, operation)
                return result
            except ClientError as e:
                logger.error(f"S3 operation attempt {attempt + 1} failed: {str(e)}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
                else:
                    logger.error("S3 operation failed after all retries")
                    return None
            except Exception as e:
                logger.error(f"Unexpected error in S3 operation: {str(e)}")
                return None
    
    async def upload_audio(
        self, 
        room_id: str, 
        audio_bytes: bytes, 
        filename: str
    ) -> Optional[str]:
        """Upload audio file to S3 and return URL"""
        try:
            key = f"audio/{room_id}/{filename}"
            
            def upload_op():
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=key,
                    Body=audio_bytes,
                    ContentType='audio/mpeg',
                    CacheControl='max-age=3600',
                    ACL='public-read'  # Make publicly accessible for D-ID
                )
                return key
            
            result = await self._retry_operation(upload_op)
            
            if result:
                # Generate public URL (no pre-signing needed)
                public_url = f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
                logger.info(f"Audio uploaded successfully: {public_url}")
                return public_url
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to upload audio for room {room_id}: {str(e)}")
            return None
    
    async def upload_recording(
        self,
        room_id: str,
        video_bytes: bytes,
        filename: str
    ) -> Optional[str]:
        """Upload video recording to S3 and return URL"""
        try:
            key = f"recordings/{room_id}/{filename}"
            
            def upload_op():
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=key,
                    Body=video_bytes,
                    ContentType='video/webm',
                    CacheControl='max-age=3600'
                )
                return key
            
            result = await self._retry_operation(upload_op)
            
            if result:
                url = await self.generate_presigned_url(key, expiration=3600)
                logger.info(f"Recording uploaded successfully: {key}")
                return url
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to upload recording for room {room_id}: {str(e)}")
            return None
    
    async def generate_presigned_url(self, key: str, expiration: int = 3600) -> Optional[str]:
        """Generate pre-signed URL for S3 object"""
        try:
            def generate_url():
                return self.s3_client.generate_presigned_url(
                    'get_object',
                    Params={
                        'Bucket': self.bucket_name,
                        'Key': key
                    },
                    ExpiresIn=expiration
                )
            
            loop = asyncio.get_event_loop()
            url = await loop.run_in_executor(None, generate_url)
            return url
            
        except Exception as e:
            logger.error(f"Failed to generate pre-signed URL for {key}: {str(e)}")
            return None
    
    async def delete_object(self, key: str) -> bool:
        """Delete object from S3"""
        try:
            def delete_op():
                self.s3_client.delete_object(
                    Bucket=self.bucket_name,
                    Key=key
                )
                return True
            
            result = await self._retry_operation(delete_op)
            if result:
                logger.info(f"Object deleted: {key}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Failed to delete object {key}: {str(e)}")
            return False
    
    def check_bucket_exists(self) -> bool:
        """Check if S3 bucket exists"""
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            return True
        except ClientError:
            logger.error(f"Bucket {self.bucket_name} does not exist or is not accessible")
            return False


# Global S3 client instance
s3_client = S3Client()
