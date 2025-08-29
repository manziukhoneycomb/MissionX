variable "prefix" {
  description = "Prefix for resource naming"
  type        = string
}

variable "environment" {
  description = "The environment name"
  type        = string
}

variable "api_task_role_arn" {
  description = "The ARN of the API task role"
  type        = string
}
