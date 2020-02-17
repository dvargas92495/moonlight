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

# lambda resource requires either filename or s3... wow
data "archive_file" "dummy" {
  type = "zip"
  output_path = "./dummy.zip"

  source {
    content = "// TODO IMPLEMENT"
    filename = "dummy.js"
  }
}

data "aws_iam_role" "lambda_execution_role" {
  name = "Moonlight-Lambda-Execution"
}

resource "aws_api_gateway_resource" "resource" {
  rest_api_id = var.rest_api_id
  parent_id   = var.root_resource_id
  path_part   = var.path
}

resource "aws_lambda_function" "lambda_function" {
  for_each      = toset(var.methods)

  function_name = "${var.env_name}-${each.value}-${var.path}"
  role          = data.aws_iam_role.lambda_execution_role.arn
  handler       = "${each.value}-${var.path}.handler"
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
