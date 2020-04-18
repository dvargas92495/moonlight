variable "env_name" {
  type = string
}

locals {
  lambdas = [
    "accept/post",
    "availability/get",
    "availability/post",
    "confirm-signup/post",
    "events/get",
    "events/post",
    "events/{id}/delete",
    "events/{id}/patient/post",
    "patients/{id}/form/post",
    "patients/{id}/form/{name}/get",
    "patients/{id}/form/{name}/delete",
    "profile/get",
    "profile/post",
    "signin/post",
    "signup/post",
    "specialist-views/get",
    "user/{id}/delete",
    "user/{id}/photo/get",
    "user/{id}/photo/post"
  ]

  lambda_parts = {
     for method in local.lambdas:
     method => split("/", method)
  }

  lambda_levels = {
    for method in local.lambdas:
    method => length(local.lambda_parts[method])
  }

  lambda_path_parts = {
    for method in local.lambdas:
    method => slice(local.lambda_parts[method], 0, local.lambda_levels[method] - 1)
  }

  lambda_paths = {
    for method in local.lambdas:
    method => join("/", local.lambda_path_parts[method])
  }

  resources = distinct([
    for lambda in local.lambdas: local.lambda_parts[lambda][0]
  ])

  subresources = distinct([
    for lambda in local.lambdas: join("/", slice(local.lambda_parts[lambda], 0, 2)) if local.lambda_levels[lambda] > 2
  ])

  subsubresources = distinct([
    for lambda in local.lambdas: join("/", slice(local.lambda_parts[lambda], 0, 3)) if local.lambda_levels[lambda] > 3
  ])

  subsubsubresources = distinct([
    for lambda in local.lambdas: join("/", slice(local.lambda_parts[lambda], 0, 4)) if local.lambda_levels[lambda] > 4
  ])

  allsubresources = concat(local.subresources, local.subsubresources, local.subsubsubresources)

  allresources = concat(local.resources, local.allsubresources)

  resource_parts = {
    for path in local.allresources:
    path => split("/", path)
  }

  resource_levels = {
    for path in local.allresources:
    path => length(local.resource_parts[path])
  }

  parents = {
    for path in local.allsubresources:
    path => join("/", slice(local.resource_parts[path], 0, local.resource_levels[path] - 1))
  }

  methods = {
    for lambda in local.lambdas:
    lambda => local.lambda_parts[lambda][local.lambda_levels[lambda] - 1]
  }

  method_names = {
    for lambda in local.lambdas:
    lambda => "${local.methods[lambda]}-${replace(replace(join("-", local.lambda_path_parts[lambda]),"{","by-"),"}","")}"
  }
}      

resource "aws_api_gateway_rest_api" "rest_api" {
  name        = var.env_name
  
  endpoint_configuration {
    types = ["REGIONAL"]
  }

  binary_media_types = [
    "multipart/form-data",
    "application/octet-stream"
  ]
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
  for_each    = toset(local.resources)

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  parent_id   = aws_api_gateway_rest_api.rest_api.root_resource_id
  path_part   = each.value
}

resource "aws_api_gateway_resource" "subresource" {
  for_each    = toset(local.subresources)

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  parent_id   = aws_api_gateway_resource.resource[local.parents[each.value]].id
  path_part   = local.resource_parts[each.value][1]
}

resource "aws_api_gateway_resource" "subsubresource" {
  for_each    = toset(local.subsubresources)

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  parent_id   = aws_api_gateway_resource.subresource[local.parents[each.value]].id
  path_part   = local.resource_parts[each.value][2]
}

resource "aws_api_gateway_resource" "subsubsubresource" {
  for_each    = toset(local.subsubsubresources)

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  parent_id   = aws_api_gateway_resource.subsubresource[local.parents[each.value]].id
  path_part   = local.resource_parts[each.value][3]
}

resource "aws_lambda_function" "lambda_function" {
  for_each      = toset(local.lambdas)

  function_name = "${var.env_name}-${local.method_names[each.value]}"
  role          = data.aws_iam_role.lambda_execution_role.arn
  handler       = "${local.method_names[each.value]}.handler"
  filename      = data.archive_file.dummy.output_path
  runtime       = "nodejs12.x"
  publish       = false

  environment {
    variables = {
      HOME = "/"
    }
  }

  tags = {
    Application = "Emdeo"
  }
}

resource "aws_api_gateway_method" "method" {
  for_each      = toset(local.lambdas)

  rest_api_id   = aws_api_gateway_rest_api.rest_api.id
  resource_id   = local.lambda_levels[each.value] == 2 ? aws_api_gateway_resource.resource[local.lambda_paths[each.value]].id : local.lambda_levels[each.value] == 3 ? aws_api_gateway_resource.subresource[local.lambda_paths[each.value]].id : local.lambda_levels[each.value] == 4 ? aws_api_gateway_resource.subsubresource[local.lambda_paths[each.value]].id : aws_api_gateway_resource.subsubsubresource[local.lambda_paths[each.value]].id
  http_method   = upper(local.methods[each.value])
  authorization = "NONE"

  request_parameters = {
    "method.request.header.Accept" = true
    "method.request.header.Content-Type" = true
  }
}

resource "aws_api_gateway_integration" "integration" {
  for_each                = toset(local.lambdas)

  rest_api_id             = aws_api_gateway_rest_api.rest_api.id
  resource_id             = local.lambda_levels[each.value] == 2 ? aws_api_gateway_resource.resource[local.lambda_paths[each.value]].id : local.lambda_levels[each.value] == 3 ? aws_api_gateway_resource.subresource[local.lambda_paths[each.value]].id : local.lambda_levels[each.value] == 4 ? aws_api_gateway_resource.subsubresource[local.lambda_paths[each.value]].id : aws_api_gateway_resource.subsubsubresource[local.lambda_paths[each.value]].id
  http_method             = upper(local.methods[each.value])
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.lambda_function[each.value].invoke_arn
}

resource "aws_lambda_permission" "apigw_lambda" {
  for_each      = toset(local.lambdas)

  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_function[each.value].function_name
  principal     = "apigateway.amazonaws.com"

  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "arn:aws:execute-api:us-east-1:643537615676:${aws_api_gateway_rest_api.rest_api.id}/*/${upper(local.methods[each.value])}${local.lambda_levels[each.value] == 2 ? aws_api_gateway_resource.resource[local.lambda_paths[each.value]].path : local.lambda_levels[each.value] == 3 ? aws_api_gateway_resource.subresource[local.lambda_paths[each.value]].path : local.lambda_levels[each.value] == 4 ? aws_api_gateway_resource.subsubresource[local.lambda_paths[each.value]].path : aws_api_gateway_resource.subsubsubresource[local.lambda_paths[each.value]].path}"
}

resource "aws_api_gateway_method" "options" {
  for_each      = toset(local.allresources)

  rest_api_id   = aws_api_gateway_rest_api.rest_api.id
  resource_id   = local.resource_levels[each.value] == 1 ? aws_api_gateway_resource.resource[each.value].id : local.resource_levels[each.value] == 2 ? aws_api_gateway_resource.subresource[each.value].id : local.resource_levels[each.value] == 3 ? aws_api_gateway_resource.subsubresource[each.value].id : aws_api_gateway_resource.subsubsubresource[each.value].id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "mock" {
  for_each             = toset(local.allresources)

  rest_api_id          = aws_api_gateway_rest_api.rest_api.id
  resource_id          = local.resource_levels[each.value] == 1 ? aws_api_gateway_resource.resource[each.value].id : local.resource_levels[each.value] == 2 ? aws_api_gateway_resource.subresource[each.value].id : local.resource_levels[each.value] == 3 ? aws_api_gateway_resource.subsubresource[each.value].id : aws_api_gateway_resource.subsubsubresource[each.value].id
  http_method          = aws_api_gateway_method.options[each.value].http_method
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
  for_each    = toset(local.allresources)

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = local.resource_levels[each.value] == 1 ? aws_api_gateway_resource.resource[each.value].id : local.resource_levels[each.value] == 2 ? aws_api_gateway_resource.subresource[each.value].id : local.resource_levels[each.value] == 3 ? aws_api_gateway_resource.subsubresource[each.value].id : aws_api_gateway_resource.subsubsubresource[each.value].id
  http_method = aws_api_gateway_method.options[each.value].http_method
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
  for_each    = toset(local.allresources)

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = local.resource_levels[each.value] == 1 ? aws_api_gateway_resource.resource[each.value].id : local.resource_levels[each.value] == 2 ? aws_api_gateway_resource.subresource[each.value].id : local.resource_levels[each.value] == 3 ? aws_api_gateway_resource.subsubresource[each.value].id : aws_api_gateway_resource.subsubsubresource[each.value].id
  http_method = aws_api_gateway_method.options[each.value].http_method
  status_code = aws_api_gateway_method_response.mock[each.value].status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,DELETE,OPTIONS,POST,PUT'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'" 
  }
}

resource "aws_api_gateway_deployment" "production" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  stage_name  = "production"
  stage_description = "2020.108.1"

  depends_on  = [
    aws_api_gateway_integration.integration, 
    aws_api_gateway_integration.mock, 
    aws_api_gateway_integration_response.mock,
    aws_api_gateway_method.method,
    aws_api_gateway_method.options,
    aws_api_gateway_method_response.mock,
    aws_lambda_permission.apigw_lambda
  ]
}
