output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.vpc.vpc_id
}

output "ecr_repository_url" {
  description = "The URL of the ECR repository"
  value       = module.ecr.ecr_repository_url
}

output "api_repository_url" {
  description = "The URL of the API ECR repository"
  value       = module.ecr.api_repository_url
}

output "client_repository_url" {
  description = "The URL of the client ECR repository"
  value       = module.ecr.client_repository_url
}

output "landing_repository_url" {
  description = "The URL of the landing ECR repository"
  value       = module.ecr.landing_repository_url
}

output "ecs_cluster_id" {
  description = "The ID of the ECS cluster"
  value       = module.ecs.ecs_cluster_id
}

output "cluster_name" {
  description = "The name of the ECS cluster"
  value       = "${var.prefix}-cluster-${var.environment}"
}

output "api_service_name" {
  description = "The name of the API ECS service"
  value       = "${var.prefix}-api-service-${var.environment}"
}

output "client_service_name" {
  description = "The name of the client ECS service"
  value       = "${var.prefix}-client-service-${var.environment}"
}

output "landing_service_name" {
  description = "The name of the landing ECS service"
  value       = "${var.prefix}-landing-service-${var.environment}"
}

output "api_service_url" {
  description = "The URL of the API service"
  value       = module.app_services.api_service_url
}

output "client_service_url" {
  description = "The URL of the client service"
  value       = module.app_services.client_service_url
}

output "landing_service_url" {
  description = "The URL of the landing service"
  value       = module.app_services.landing_service_url
}

output "db_endpoint" {
  description = "The endpoint of the RDS database"
  value       = module.rds.db_endpoint
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket"
  value       = module.s3.s3_bucket_name
}
