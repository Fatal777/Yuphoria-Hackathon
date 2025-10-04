#!/usr/bin/env python3
"""
AWS CDK app for Holo Tutor Hub infrastructure
Automatically provisions S3 bucket and ElastiCache Redis
"""
import os
from aws_cdk import (
    App,
    Stack,
    Environment,
    RemovalPolicy,
    Duration,
    CfnOutput,
)
from aws_cdk import aws_s3 as s3
from aws_cdk import aws_elasticache as elasticache
from aws_cdk import aws_ec2 as ec2
from constructs import Construct


class HoloTutorInfraStack(Stack):
    """Main infrastructure stack for Holo Tutor Hub"""

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # ========================================
        # S3 Bucket for Audio/Video Storage
        # ========================================
        
        self.recordings_bucket = s3.Bucket(
            self,
            "RecordingsBucket",
            bucket_name="holo-tutor-recordings-2025",
            # Public access settings (for pre-signed URLs)
            public_read_access=False,
            block_public_access=s3.BlockPublicAccess(
                block_public_acls=False,
                block_public_policy=False,
                ignore_public_acls=False,
                restrict_public_buckets=False
            ),
            # CORS configuration
            cors=[
                s3.CorsRule(
                    allowed_methods=[
                        s3.HttpMethods.GET,
                        s3.HttpMethods.PUT,
                        s3.HttpMethods.POST,
                        s3.HttpMethods.HEAD
                    ],
                    allowed_origins=["*"],
                    allowed_headers=["*"],
                    exposed_headers=["ETag"],
                    max_age=3000
                )
            ],
            # Lifecycle rule - delete old recordings after 7 days
            lifecycle_rules=[
                s3.LifecycleRule(
                    id="DeleteOldRecordings",
                    enabled=True,
                    expiration=Duration.days(7),
                )
            ],
            # Encryption
            encryption=s3.BucketEncryption.S3_MANAGED,
            # Versioning
            versioned=False,
            # Deletion policy (for development)
            removal_policy=RemovalPolicy.DESTROY,  # Change to RETAIN for production
            auto_delete_objects=True,  # Clean up on stack deletion
        )

        # Output bucket name
        CfnOutput(
            self,
            "S3BucketName",
            value=self.recordings_bucket.bucket_name,
            description="S3 bucket for audio/video recordings",
            export_name="HoloTutorS3Bucket"
        )

        CfnOutput(
            self,
            "S3BucketArn",
            value=self.recordings_bucket.bucket_arn,
            description="S3 bucket ARN"
        )

        # ========================================
        # ElastiCache Redis (Optional)
        # ========================================
        
        # Create VPC for ElastiCache (optional - only if you want production Redis)
        # Uncomment the sections below if you want AWS ElastiCache
        
        # vpc = ec2.Vpc(
        #     self,
        #     "HoloTutorVPC",
        #     max_azs=2,
        #     nat_gateways=0,  # Save costs
        #     subnet_configuration=[
        #         ec2.SubnetConfiguration(
        #             name="Public",
        #             subnet_type=ec2.SubnetType.PUBLIC,
        #             cidr_mask=24
        #         )
        #     ]
        # )
        
        # # Security group for Redis
        # redis_sg = ec2.SecurityGroup(
        #     self,
        #     "RedisSG",
        #     vpc=vpc,
        #     description="Security group for Redis cluster",
        #     allow_all_outbound=True
        # )
        
        # # Allow Redis port from anywhere (restrict in production!)
        # redis_sg.add_ingress_rule(
        #     peer=ec2.Peer.any_ipv4(),
        #     connection=ec2.Port.tcp(6379),
        #     description="Allow Redis access"
        # )
        
        # # Subnet group for ElastiCache
        # subnet_group = elasticache.CfnSubnetGroup(
        #     self,
        #     "RedisSubnetGroup",
        #     description="Subnet group for Redis",
        #     subnet_ids=[subnet.subnet_id for subnet in vpc.public_subnets],
        #     cache_subnet_group_name="holo-tutor-redis-subnets"
        # )
        
        # # ElastiCache Redis cluster
        # redis_cluster = elasticache.CfnCacheCluster(
        #     self,
        #     "RedisCluster",
        #     cache_node_type="cache.t3.micro",
        #     engine="redis",
        #     num_cache_nodes=1,
        #     cluster_name="holo-tutor-redis",
        #     vpc_security_group_ids=[redis_sg.security_group_id],
        #     cache_subnet_group_name=subnet_group.cache_subnet_group_name,
        #     engine_version="7.0"
        # )
        # redis_cluster.add_dependency(subnet_group)
        
        # # Output Redis endpoint
        # CfnOutput(
        #     self,
        #     "RedisEndpoint",
        #     value=redis_cluster.attr_redis_endpoint_address,
        #     description="Redis cluster endpoint"
        # )
        
        # CfnOutput(
        #     self,
        #     "RedisPort",
        #     value=redis_cluster.attr_redis_endpoint_port,
        #     description="Redis cluster port"
        # )

        # ========================================
        # Deployment Instructions Output
        # ========================================
        
        CfnOutput(
            self,
            "DeploymentInstructions",
            value="Update your .env file with the S3 bucket name above",
            description="Next steps"
        )


# Create CDK app
app = App()

# Get AWS account and region from environment or use defaults
env = Environment(
    account=os.environ.get("CDK_DEFAULT_ACCOUNT"),
    region=os.environ.get("CDK_DEFAULT_REGION", "ap-south-1")
)

# Create stack
HoloTutorInfraStack(
    app,
    "HoloTutorInfraStack",
    env=env,
    description="Infrastructure for Holo Tutor Hub - S3 bucket for recordings"
)

app.synth()
