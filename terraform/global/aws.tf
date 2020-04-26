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

resource "aws_iam_user" "admin" {
  name = "moonlight-health-admin"

  tags = {
    Application = "Emdeo"
  }
}