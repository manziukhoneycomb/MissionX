output "api_repository_url" {
  description = "The URL of the API ECR repository"
  value       = aws_ecr_repository.api.repository_url
}

output "client_repository_url" {
  description = "The URL of the client ECR repository"
  value       = aws_ecr_repository.client.repository_url
}

output "landing_repository_url" {
  description = "The URL of the landing ECR repository"
  value       = aws_ecr_repository.landing.repository_url
}

output "ecr_repository_url" {
  description = "The URL of the API ECR repository (for backward compatibility)"
  value       = aws_ecr_repository.api.repository_url
}
