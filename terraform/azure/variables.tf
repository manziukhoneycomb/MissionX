variable "location" {
  description = "The Azure region where resources will be created"
  type        = string
  default     = "westus2"
}

variable "prefix" {
  description = "Prefix for resource naming"
  type        = string
  default     = "app"
}

variable "environment" {
  description = "The environment name. Keep it short. Usually dev, prod, sta, uat..."
}
