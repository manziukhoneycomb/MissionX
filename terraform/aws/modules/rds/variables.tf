variable "prefix" {
  description = "Prefix for resource naming"
  type        = string
}

variable "environment" {
  description = "The environment name"
  type        = string
}

variable "vpc_id" {
  description = "The ID of the VPC"
  type        = string
}

variable "private_subnets" {
  description = "The IDs of the private subnets"
  type        = list(string)
}

variable "database_security_group_id" {
  description = "The ID of the database security group"
  type        = string
  default     = ""
}

variable "db_subnet_group_name" {
  description = "The name of the database subnet group"
  type        = string
  default     = ""
}
