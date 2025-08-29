resource "aws_secretsmanager_secret" "app_secrets" {
  name        = "${var.prefix}-secrets-${var.environment}"
  description = "Secrets for the application"

  tags = {
    prefix      = var.prefix
    environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    API_KEY = "placeholder-api-key"
  })
}

resource "aws_iam_policy" "secrets_access" {
  name        = "${var.prefix}-secrets-access-${var.environment}"
  description = "Policy for accessing secrets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Effect   = "Allow"
        Resource = aws_secretsmanager_secret.app_secrets.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "api_secrets_access" {
  role       = element(split("/", var.api_task_role_arn), length(split("/", var.api_task_role_arn)) - 1)
  policy_arn = aws_iam_policy.secrets_access.arn
}
