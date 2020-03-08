variable "ATLAS_WORKSPACE_NAME" {}
variable "RDS_MASTER_USER_PASSWORD" {}

locals {
  env_name     = replace(var.ATLAS_WORKSPACE_NAME, "terraform-", "")
  domain       = "${replace(replace(local.env_name, "moonlight-health", ""), "-", ".")}moonlight-health.com"
  s3_origin_id = "S3-${local.env_name}"
  is_prod      = local.env_name == "moonlight-health"
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "client" {
  bucket = local.env_name
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
      "Resource": "arn:aws:s3:::${local.env_name}/*"
    },
    {
      "Sid": "RestrictedReadBuckets",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::643537615676:user/moonlight-health-admin"
      },
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::${local.env_name}"
    },
    {
      "Sid": "PublicReadObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${local.env_name}/*"
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

resource "aws_acm_certificate" "cert" {
  domain_name       = local.domain
  validation_method = "DNS"

  tags = {
    Application = "Moonlight"
  }

  lifecycle {
    create_before_destroy = true
  }

  subject_alternative_names = [
    "www.${local.domain}"
  ]
}

data "aws_route53_zone" "primary" {
  name         = "moonlight-health.com."
  private_zone = false
}

resource "aws_route53_record" "cert_validation" {
  name    = aws_acm_certificate.cert.domain_validation_options.0.resource_record_name
  type    = aws_acm_certificate.cert.domain_validation_options.0.resource_record_type
  zone_id = data.aws_route53_zone.primary.id
  records = ["${aws_acm_certificate.cert.domain_validation_options.0.resource_record_value}"]
  ttl     = 60
}

resource "aws_route53_record" "www_cert_validation" {
  name    = aws_acm_certificate.cert.domain_validation_options.1.resource_record_name
  type    = aws_acm_certificate.cert.domain_validation_options.1.resource_record_type
  zone_id = data.aws_route53_zone.primary.id
  records = ["${aws_acm_certificate.cert.domain_validation_options.1.resource_record_value}"]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "validation" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [
    "${aws_route53_record.cert_validation.fqdn}",
    "${aws_route53_record.www_cert_validation.fqdn}"
  ]
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.client.bucket_regional_domain_name
    origin_id   = local.s3_origin_id
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = ""
  default_root_object = "index.html"

  aliases = ["${local.domain}"]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
  }

  tags = {
    Application = "Moonlight"
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.cert.arn
    ssl_support_method = "sni-only"
    minimum_protocol_version = "TLSv1.2_2018"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  custom_error_response {
    error_caching_min_ttl = 300
    error_code = 403
    response_code = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_caching_min_ttl = 300
    error_code = 404
    response_code = 200
    response_page_path = "/index.html"
  }
}

resource "aws_route53_record" "A" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = local.domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.s3_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "AAAA" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = local.domain
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.s3_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_cognito_user_pool" "pool" {
  name                       = local.env_name
  username_attributes        = ["email"]
  auto_verified_attributes   = ["email"]
  email_verification_subject = "Your Moonlight Health verification code"
  email_verification_message = "Your Moonlight Health verification code is {####}."
  
  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  tags                       = {
    Application = "Moonlight"
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name                = "moonlight-client"
  user_pool_id        = aws_cognito_user_pool.pool.id
  generate_secret     = true
  explicit_auth_flows = [
    "ALLOW_CUSTOM_AUTH", 
    "ALLOW_USER_PASSWORD_AUTH", 
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]
  refresh_token_validity = 30
}

resource "aws_db_instance" "default" {
  allocated_storage     = 20
  max_allocated_storage = 1000
  storage_type          = "gp2"
  engine                = "postgres"
  engine_version        = "11.5"
  identifier            = local.env_name
  instance_class        = "db.t3.micro"
  name                  = "moonlight"
  username              = "moonlight"
  password              = var.RDS_MASTER_USER_PASSWORD
  parameter_group_name  = "default.postgres11"
  port                  = 5432
  publicly_accessible   = true
  skip_final_snapshot   = true
}

module "backend" {
  source = "./backend"

  env_name = local.env_name
}
