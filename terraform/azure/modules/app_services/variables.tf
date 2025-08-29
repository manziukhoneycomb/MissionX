variable "resource_group_name" {
  description = "The name of the resource group"
  type        = string
}

variable "location" {
  description = "The Azure region where resources will be created"
  type        = string
}

variable "app_service_plan_id" {
  description = "The ID of the App Service Plan"
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

variable "acr_login_server" {
  description = "The login server URL for the container registry"
  type        = string
}

variable "acr_admin_username" {
  description = "The admin username for the container registry"
  type        = string
}

variable "acr_admin_password" {
  description = "The admin password for the container registry"
  type        = string
  sensitive   = true
}

variable "key_vault_uri" {
  description = "The URI of the Key Vault instance."
  type        = string
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

variable "subnet_api_id" {
  description = "The api subnet id which will be used by this Web App for regional virtual network integration."
}