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

variable "subnet_db_id" {
  description = "The ID of the virtual network subnet to create the PostgreSQL Flexible Server."
}

variable "private_dns_zone_id" {
  description = "The ID of the private DNS zone to create the PostgreSQL Flexible Server."
}