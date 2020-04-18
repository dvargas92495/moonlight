variable "ATLAS_WORKSPACE_NAME" {}
variable "RDS_MASTER_USER_PASSWORD" {}

locals {
  env_name     = replace(replace(var.ATLAS_WORKSPACE_NAME, "terraform-", ""), "moonlight-health", "emdeo")
  domain       = "${replace(local.env_name, "-", ".")}.com"
  s3_origin_id = "S3-${local.env_name}"
  is_prod      = local.env_name == "emdeo"
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "client" {
  bucket = local.env_name
  force_destroy = true
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
    Application = "Emdeo"
  }

  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}

resource "aws_s3_bucket" "www" {
  bucket = "www-${local.env_name}"
  acl    = "private"
  force_destroy = true
  tags = {
    Application = "Emdeo"
  }

  website {
    redirect_all_requests_to = "https://${local.domain}"
  }
}

resource "aws_s3_bucket_public_access_block" "client" {
  bucket = aws_s3_bucket.client.id

  block_public_acls       = true
  block_public_policy     = false
  ignore_public_acls      = true
  restrict_public_buckets = false
}

resource "aws_s3_bucket_public_access_block" "www" {
  bucket = aws_s3_bucket.www.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_acm_certificate" "cert" {
  domain_name       = local.domain
  validation_method = "DNS"

  tags = {
    Application = "Emdeo"
  }

  lifecycle {
    create_before_destroy = true
  }

  subject_alternative_names = [
    "www.${local.domain}"
  ]
}

data "aws_route53_zone" "primary" {
  name         = "emdeo.com."
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
  records = [aws_acm_certificate.cert.domain_validation_options.1.resource_record_value]
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
    compress         = true

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
    Application = "Emdeo"
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

resource "aws_cloudfront_distribution" "s3_www_distribution" {
  origin {
    domain_name = aws_s3_bucket.www.website_endpoint
    origin_id   = "www-${local.s3_origin_id}"
    
    custom_origin_config {
      http_port    = "80"
      https_port   = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols = [
        "TLSv1",
        "TLSv1.1",
        "TLSv1.2"
      ]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = ""

  aliases = ["www.${local.domain}"]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "www-${local.s3_origin_id}"

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
    Application = "Emdeo"
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

resource "aws_route53_record" "www-A" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = "www.${local.domain}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.s3_www_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_www_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www-AAAA" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = "www.${local.domain}"
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.s3_www_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_www_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_cognito_user_pool" "pool" {
  name                       = local.env_name
  username_attributes        = ["email"]
  auto_verified_attributes   = ["email"]
  email_verification_subject = "Your Emdeo verification code"
  email_verification_message = "Your Emdeo verification code is {####}."
  
  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  tags                       = {
    Application = "Emdeo"
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name                = "emdeo-client"
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
  allocated_storage            = 20
  max_allocated_storage        = 1000
  storage_type                 = "gp2"
  engine                       = "postgres"
  engine_version               = "11.5"
  identifier                   = local.env_name
  instance_class               = "db.t3.micro"
  name                         = "emdeo"
  username                     = "emdeo"
  password                     = var.RDS_MASTER_USER_PASSWORD
  parameter_group_name         = "default.postgres11"
  port                         = 5432
  publicly_accessible          = true
  skip_final_snapshot          = true
  storage_encrypted            = local.is_prod
  deletion_protection          = local.is_prod
  performance_insights_enabled = local.is_prod
  tags                         = {
    Application = "Emdeo"
  }
}

resource "aws_s3_bucket" "app_storage" {
  for_each = toset([
    "patient-forms",
    "profile-photos"
  ])

  bucket = "${local.env_name}-${each.value}"
  acl    = "private"
  force_destroy = true
  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "RestrictedActions",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::643537615676:user/moonlight-health-admin"
      },
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::${local.env_name}-${each.value}/*"
    }
  ]
}
POLICY

  tags = {
    Application = "Emdeo"
  }
}

module "backend" {
  source = "./backend"

  env_name = local.env_name
}
