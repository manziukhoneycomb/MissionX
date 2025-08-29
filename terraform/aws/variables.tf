variable "region" {
  description = "The AWS region where resources will be created"
  type        = string
  default     = "eu-west-1"
}

variable "prefix" {
  description = "Prefix for resource naming"
  type        = string
  default     = "templateapp"
}

variable "environment" {
  description = "The environment name. Keep it short. Usually dev, prod, sta, uat..."
}
