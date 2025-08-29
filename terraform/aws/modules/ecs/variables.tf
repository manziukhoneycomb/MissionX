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
