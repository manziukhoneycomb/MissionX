variable "resource_group_name" {
  description = "The name of the resource group"
  type        = string
}

variable "location" {
  description = "The Azure region where resources will be created"
  type        = string
}

variable "prefix" {
  description = "The prefix used when naming services."
  type        = string
}

variable "environment" {
  description = "The environment name. Keep it short. Usually dev, prod, sta, uat..."
  type        = string
}