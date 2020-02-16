variable "name" {
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

resource "aws_lambda_function" "test_lambda" {
  function_name = "${var.env_name}-${var.name}"
  role          = data.aws_iam_role.lambda_execution_role.arn
  handler       = "${var.name}.handler"
  filename      = data.archive_file.dummy.output_path

  runtime = "nodejs10.x"

  environment {
    variables = {
      HOME = "/"
    }
  }

  tags = {
    Application = "Moonlight"
  }
}