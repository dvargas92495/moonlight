variable "env_name" {
  type = string
}

module "lambda-signUp" {
  source = "./lambda"
  name = "signUp"
  env_name = var.env_name
}

module "lambda-confirmSignUp" {
  source = "./lambda"
  name = "confirmSignUp"
  env_name = var.env_name
}

module "lambda-signIn" {
  source = "./lambda"
  name = "signIn"
  env_name = var.env_name
}

module "lambda-getAvailability" {
  source = "./lambda"
  name = "getAvailability"
  env_name = var.env_name
}

module "lambda-putAvailability" {
  source = "./lambda"
  name = "putAvailability"
  env_name = var.env_name
}

module "lambda-getProfile" {
  source = "./lambda"
  name = "getProfile"
  env_name = var.env_name
}

module "lambda-putProfile" {
  source = "./lambda"
  name = "putProfile"
  env_name = var.env_name
}

module "lambda-getSpecialistViews" {
  source = "./lambda"
  name = "getSpecialistViews"
  env_name = var.env_name
}

module "lambda-getEvents" {
  source = "./lambda"
  name = "getEvents"
  env_name = var.env_name
}

module "lambda-postEvents" {
  source = "./lambda"
  name = "postEvents"
  env_name = var.env_name
}