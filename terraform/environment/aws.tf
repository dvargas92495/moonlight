variable "ATLAS_WORKSPACE_NAME" {}
variable "RDS_MASTER_USER_PASSWORD" {}

locals {
  env_name      = replace(replace(var.ATLAS_WORKSPACE_NAME, "terraform-", ""), "moonlight-health", "emdeo")
  domain        = "${replace(local.env_name, "-", ".")}.com"
  camelcase_env = replace(title(replace(local.env_name, "-"," ")), " ", "")
  s3_origin_id  = "S3-${local.env_name}"
  is_prod       = local.env_name == "emdeo"
  is_dev        = replace(local.env_name, "-dev-emdeo", "") != local.env_name
  dev_ip        = "72.226.107.58/32"
  ips           = toset(local.is_dev ? [local.dev_ip] : [
    local.dev_ip,
    "72.66.88.213/32", // Ryan's IP
    "10.0.1.58/32",    // Raj's IP
    "34.73.34.132/32",    // Travis CI
    "34.73.65.1/32", 
    "34.73.66.97/32", 
    "34.74.79.111/32", 
    "34.74.91.53/32", 
    "34.74.253.255/32", 
    "35.185.97.135/32", 
    "35.196.72.151/32", 
    "35.196.82.30/32", 
    "35.196.158.85/32", 
    "35.227.58.83/32", 
    "35.227.97.188/32", 
    "35.231.58.0/32", 
    "35.237.8.208/32", 
    "35.237.56.208/32", 
    "35.237.212.185/32", 
    "104.196.57.92/32", 
    "104.196.213.122/32",
    "34.66.25.221/32",
    "34.66.50.208/32", 
    "34.66.178.120/32", 
    "34.66.200.49/32", 
    "34.68.144.114/32", 
    "35.184.226.236/32", 
    "35.188.1.99/32", 
    "35.188.15.155/32", 
    "35.188.73.34/32", 
    "35.192.10.37/32", 
    "35.192.85.2/32", 
    "35.192.91.101/32", 
    "35.192.136.167/32", 
    "35.192.187.174/32", 
    "35.193.7.13/32", 
    "35.193.14.140/32", 
    "35.202.145.110/32", 
    "35.202.245.105/32", 
    "35.222.7.205/32", 
    "35.224.112.202/32", 
    "104.154.113.151/32", 
    "104.154.120.187/32", 
    "104.197.122.201/32", 
    "104.198.131.58/32"
  ])
  app_storage   = [
    "patient-forms",
    "profile-photos"
  ]
}

terraform {
    backend "remote" {
        hostname = "app.terraform.io"
        organization = "Moonlight"
        workspaces {
            prefix = "terraform-"
        }
    }
}

provider "aws" {
  region = "us-east-1"
}

data "aws_iam_user" "admin" {
  user_name = "emdeo-admin"
}

resource "aws_waf_ipset" "ipset" {
  name        = "ip${local.camelcase_env}"

  dynamic "ip_set_descriptors" {
    for_each = local.ips
    content {
      type  = "IPV4"
      value = ip_set_descriptors.value
    }
  }
}

resource "aws_waf_rule" "waf_rule" {
  name        = "rule${local.camelcase_env}"
  metric_name = "rule${local.camelcase_env}"

  predicates {
    data_id = aws_waf_ipset.ipset.id
    negated = false
    type    = "IPMatch"
  }
}

resource "aws_waf_web_acl" "waf_acl" {
  name        = "acl${local.camelcase_env}"
  metric_name = "acl${local.camelcase_env}"

  default_action {
    type = "BLOCK"
  }

  rules {
    action {
      type = "ALLOW"
    }

    priority = 1
    rule_id  = aws_waf_rule.waf_rule.id
    type     = "REGULAR"
  }

  tags = {
    Application = "Emdeo"
  }
}

resource "aws_s3_bucket" "client" {
  bucket = local.env_name
  force_destroy = true
  acl    = "private"

  tags = {
    Application = "Emdeo"
  }

  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}

data "aws_iam_policy_document" "client" {
  statement {
    sid = "RestrictedWriteObjects"
    principals {
      type = "AWS"
      identifiers = [data.aws_iam_user.admin.arn]
    }
    actions = ["s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.client.arn}/*"]
  }

  statement {
    sid = "RestrictedReadBuckets"
    principals {
      type = "AWS"
      identifiers = [data.aws_iam_user.admin.arn]
    }
    actions = ["s3:ListBucket"]
    resources = [aws_s3_bucket.client.arn]
  }

  statement {
    sid = "PublicReadObject"
    principals {
      type = "*"
      identifiers = ["*"]
    }
    actions = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.client.arn}/*"]
  }
}

resource "aws_s3_bucket_policy" "client" {
  bucket = aws_s3_bucket.client.id
  policy = data.aws_iam_policy_document.client.json
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

  web_acl_id = local.is_prod ? null : aws_waf_web_acl.waf_acl.id
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

  web_acl_id = local.is_prod ? null : aws_waf_web_acl.waf_acl.id
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

resource "aws_ses_domain_identity" "emailer" {
  domain = local.domain
}

resource "aws_route53_record" "emailer_record" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = "_amazonses.${local.domain}"
  type    = "TXT"
  ttl     = "600"
  records = [aws_ses_domain_identity.emailer.verification_token]
}

resource "aws_ses_domain_identity_verification" "email_verification" {
  domain = aws_ses_domain_identity.emailer.id

  depends_on = [aws_route53_record.emailer_record]
}

resource "aws_cognito_user_pool" "pool" {
  name                       = local.env_name
  username_attributes        = ["email"]
  auto_verified_attributes   = ["email"]
  email_verification_subject = "Your Password Reset Link for Emdeo"
  email_verification_message = "Click on the following link https://${local.domain}/reset?confirm={####} to reset your password."
  admin_create_user_config   {
    allow_admin_create_user_only = true
    invite_message_template {
      email_subject = "New Emdeo Account"
      email_message = "A new account has been created for you on Emdeo. Log in with {username} as your username and {####} as your temporary password."
      sms_message = "Click the following link to create your emdeo account https://${local.domain}/password?username={username}&temporary={####}"
    }
  }
  
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
  for_each = toset(local.app_storage)

  bucket = "${local.env_name}-${each.value}"
  acl    = "private"
  force_destroy = true

  tags = {
    Application = "Emdeo"
  }
}

module "backend" {
  source = "./backend"

  env_name = local.env_name
  domain   = local.domain
  cognito_pool_arn = aws_cognito_user_pool.pool.arn
  app_storage_arns = values(aws_s3_bucket.app_storage)[*].arn
  ses_identity_arn = aws_ses_domain_identity.emailer.arn
}
