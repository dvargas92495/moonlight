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

resource "aws_route53_zone" "primary" {
  name          = "emdeo.com."
  force_destroy = false
  comment       = "Hosted zone for all emdeo environments"
  tags          = {
      Application = "Emdeo"
  }
}

data "aws_iam_policy_document" "admin_policy" {
  statement {
    actions = [
      "ses:VerifyDomainIdentity",
      "ses:GetIdentityVerificationAttributes",
      "ses:DeleteIdentity",
      "ses:SendEmail",
      "ec2:*"
    ]

    resources = ["*"]
  }
}

resource "aws_iam_group" "admin" {
  name = "emdeo-admin"
}

resource "aws_iam_group_policy" "admin_policy" {
  name   = "emdeo-admin-policy"
  group  = aws_iam_group.admin.id
  policy = data.aws_iam_policy_document.admin_policy.json
}

resource "aws_iam_user" "admin" {
  name = "emdeo-admin"

  tags = {
    Application = "Emdeo"
  }
}

resource "aws_iam_group_membership" "admin" {
  name = "emdeo-admin"

  users = [aws_iam_user.admin.name]

  group = aws_iam_group.admin.name
}

resource "aws_iam_group_policy_attachment" "rds" {
  group       = aws_iam_group.admin.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSFullAccess"
}

resource "aws_iam_group_policy_attachment" "lambda" {
  group       = aws_iam_group.admin.name
  policy_arn = "arn:aws:iam::aws:policy/AWSLambdaFullAccess"
}

resource "aws_iam_group_policy_attachment" "iam" {
  group       = aws_iam_group.admin.name
  policy_arn = "arn:aws:iam::aws:policy/IAMFullAccess"
}

resource "aws_iam_group_policy_attachment" "s3" {
  group       = aws_iam_group.admin.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_group_policy_attachment" "cloudfront" {
  group       = aws_iam_group.admin.name
  policy_arn = "arn:aws:iam::aws:policy/CloudFrontFullAccess"
}

resource "aws_iam_group_policy_attachment" "apigateway" {
  group       = aws_iam_group.admin.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonAPIGatewayAdministrator"
}

resource "aws_iam_group_policy_attachment" "cognito" {
  group       = aws_iam_group.admin.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonCognitoPowerUser"
}

resource "aws_iam_group_policy_attachment" "waf" {
  group       = aws_iam_group.admin.name
  policy_arn = "arn:aws:iam::aws:policy/AWSWAFFullAccess"
}

resource "aws_iam_group_policy_attachment" "route53" {
  group       = aws_iam_group.admin.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRoute53FullAccess"
}

resource "aws_iam_group_policy_attachment" "acm" {
  group       = aws_iam_group.admin.name
  policy_arn = "arn:aws:iam::aws:policy/AWSCertificateManagerFullAccess"
}

data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "image-id"
    values = ["ami-085925f297f89fce1"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"]
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t2.micro"
  key_name = "Emdeo-Github-Action"

  tags = {
    Application = "Emdeo"
  }
}