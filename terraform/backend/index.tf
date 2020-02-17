variable "env_name" {
  type = string
}

resource "aws_api_gateway_rest_api" "rest_api" {
  name        = var.env_name
}

module "availability-resource" {
  source      = "./resource"

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  root_resource_id   = aws_api_gateway_rest_api.rest_api.root_resource_id
  path        = "availability"
  methods      = ["get", "post"]
  env_name    = var.env_name
}

module "confirm-signup-resource" {
  source      = "./resource"

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  root_resource_id   = aws_api_gateway_rest_api.rest_api.root_resource_id
  path        = "confirm-signup"
  methods      = ["post"]
  env_name    = var.env_name
}

module "events-resource" {
  source      = "./resource"

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  root_resource_id   = aws_api_gateway_rest_api.rest_api.root_resource_id
  path        = "events"
  methods      = ["get", "post"]
  env_name    = var.env_name
}

module "profile-resource" {
  source      = "./resource"

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  root_resource_id   = aws_api_gateway_rest_api.rest_api.root_resource_id
  path        = "profile"
  methods      = ["get", "post"]
  env_name    = var.env_name
}

module "signin-resource" {
  source      = "./resource"

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  root_resource_id   = aws_api_gateway_rest_api.rest_api.root_resource_id
  path        = "signin"
  methods      = ["post"]
  env_name    = var.env_name
}

module "signup-resource" {
  source      = "./resource"

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  root_resource_id   = aws_api_gateway_rest_api.rest_api.root_resource_id
  path        = "signup"
  methods      = ["post"]
  env_name    = var.env_name
}

module "specialist-views-resource" {
  source      = "./resource"

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  root_resource_id   = aws_api_gateway_rest_api.rest_api.root_resource_id
  path        = "specialist-views"
  methods      = ["get"]
  env_name    = var.env_name
}
