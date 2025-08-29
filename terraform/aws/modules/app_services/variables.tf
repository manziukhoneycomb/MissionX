variable "prefix" {
  description = "Prefix for resource naming"
  type        = string
}

variable "environment" {
  description = "The environment name"
  type        = string
}

variable "region" {
  description = "The AWS region where resources will be created"
  type        = string
}

variable "ecs_cluster_id" {
  description = "The ID of the ECS cluster"
  type        = string
}

variable "ecr_repository_url" {
  description = "The URL of the API ECR repository"
  type        = string
}

variable "vpc_id" {
  description = "The ID of the VPC"
  type        = string
}

variable "public_subnets" {
  description = "The IDs of the public subnets"
  type        = list(string)
}

variable "private_subnets" {
  description = "The IDs of the private subnets"
  type        = list(string)
}

variable "database_host" {
  description = "The database host"
  type        = string
  sensitive   = true
}

variable "database_username" {
  description = "The database username"
  type        = string
  sensitive   = true
}

variable "database_password" {
  description = "The database user password"
  type        = string
  sensitive   = true
}

variable "database_name" {
  description = "The database name"
  type        = string
  sensitive   = true
}

variable "ecs_security_group_id" {
  description = "The ID of the ECS security group"
  type        = string
  default     = ""
}

variable "alb_security_group_id" {
  description = "The ID of the ALB security group"
  type        = string
  default     = ""
}

variable "client_repository_url" {
  description = "The URL of the client ECR repository"
  type        = string
  default     = ""
}

variable "landing_repository_url" {
  description = "The URL of the landing ECR repository"
  type        = string
  default     = ""
}
