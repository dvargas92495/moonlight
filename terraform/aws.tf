variable "ATLAS_WORKSPACE_NAME" {}

provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "client" {
  bucket = replace(var.ATLAS_WORKSPACE_NAME, "terraform-", "")
  acl    = "private"
  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "RestrictedWriteObjects",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::643537615676:user/moonlight-health-admin"
      },
      "Action": ["s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::${replace(var.ATLAS_WORKSPACE_NAME, "terraform-", "")}/*"
    },
    {
      "Sid": "RestrictedReadBuckets",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::643537615676:user/moonlight-health-admin"
      },
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::${replace(var.ATLAS_WORKSPACE_NAME, "terraform-", "")}"
    },
    {
      "Sid": "PublicReadObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${replace(var.ATLAS_WORKSPACE_NAME, "terraform-", "")}/*"
    }
  ]
}
POLICY

  tags = {
    Application = "Moonlight"
  }

  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "client" {
  bucket = aws_s3_bucket.client.id

  block_public_acls       = true
  block_public_policy     = false
  ignore_public_acls      = true
  restrict_public_buckets = false
}
