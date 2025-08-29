output "secrets_arn" {
  description = "The ARN of the Secrets Manager secret"
  value       = aws_secretsmanager_secret.app_secrets.arn
}

output "secrets_name" {
  description = "The name of the Secrets Manager secret"
  value       = aws_secretsmanager_secret.app_secrets.name
}
