variable "path" {
  type = string
}

variable "methods" {
  type    = list(string)
  default = []
}

variable "rest_api_id" {
  type = string
}

variable "root_resource_id" {
  type = string
}

variable "env_name" {
  type = string
}

locals {
  method_name = replace(replace(var.path, "/{", "-by-"), "}", "")
  path_parts = split("/", var.path)
  path_part = local.path_parts[length(local.path_parts) - 1]
}

# lambda resource requires either filename or s3... wow
data "archive_file" "dummy" {
  type        = "zip"
  output_path = "./dummy.zip"

  source {
    content   = "// TODO IMPLEMENT"
    filename  = "dummy.js"
  }
}

data "aws_iam_role" "lambda_execution_role" {
  name = "Moonlight-Lambda-Execution"
}

resource "aws_api_gateway_resource" "resource" {
  rest_api_id = var.rest_api_id
  parent_id   = var.root_resource_id
  path_part   = local.path_part
}

resource "aws_lambda_function" "lambda_function" {
  for_each      = toset(var.methods)

  function_name = "${var.env_name}-${each.value}-${local.method_name}"
  role          = data.aws_iam_role.lambda_execution_role.arn
  handler       = "${each.value}-${local.method_name}.handler"
  filename      = data.archive_file.dummy.output_path
  runtime       = "nodejs10.x"

  environment {
    variables = {
      HOME = "/"
    }
  }

  tags = {
    Application = "Moonlight"
  }
}

resource "aws_api_gateway_method" "method" {
  for_each      = toset(var.methods)

  rest_api_id   = var.rest_api_id
  resource_id   = aws_api_gateway_resource.resource.id
  http_method   = upper(each.value)
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "integration" {
  count                   = length(var.methods)

  rest_api_id             = var.rest_api_id
  resource_id             = aws_api_gateway_resource.resource.id
  http_method             = upper(var.methods[count.index])
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.lambda_function[var.methods[count.index]].invoke_arn
}

resource "aws_lambda_permission" "apigw_lambda" {
  count         = length(var.methods)

  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_function[var.methods[count.index]].function_name
  principal     = "apigateway.amazonaws.com"

  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "arn:aws:execute-api:us-east-1:643537615676:${var.rest_api_id}/*/${upper(var.methods[count.index])}${aws_api_gateway_resource.resource.path}"
}

resource "aws_api_gateway_method" "options" {
  rest_api_id   = var.rest_api_id
  resource_id   = aws_api_gateway_resource.resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "mock" {
  rest_api_id          = var.rest_api_id
  resource_id          = aws_api_gateway_resource.resource.id
  http_method          = aws_api_gateway_method.options.http_method
  type                 = "MOCK"
  passthrough_behavior = "WHEN_NO_TEMPLATES"

  request_templates = {
    "application/json" = jsonencode(
        {
            statusCode = 200
        }
    )
  }
}

resource "aws_api_gateway_method_response" "mock" {
  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.resource.id
  http_method = aws_api_gateway_method.options.http_method
  status_code = "200"
  
  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true 
  }
}

resource "aws_api_gateway_integration_response" "mock" {
  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.resource.id
  http_method = aws_api_gateway_method.options.http_method
  status_code = aws_api_gateway_method_response.mock.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,DELETE,OPTIONS,POST,PUT'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'" 
  }
}

output "resource_id" {
  value = aws_api_gateway_resource.resource.id
}