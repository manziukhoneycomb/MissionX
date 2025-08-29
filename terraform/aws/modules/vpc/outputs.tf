output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnets" {
  description = "The IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnets" {
  description = "The IDs of the private subnets"
  value       = aws_subnet.private[*].id
}

output "database_subnets" {
  description = "The IDs of the database subnets"
  value       = aws_subnet.database[*].id
}

output "db_subnet_group_name" {
  description = "The name of the database subnet group"
  value       = aws_db_subnet_group.database.name
}

output "ecs_security_group_id" {
  description = "The ID of the ECS tasks security group"
  value       = aws_security_group.ecs_tasks.id
}

output "alb_security_group_id" {
  description = "The ID of the ALB security group"
  value       = aws_security_group.alb.id
}

output "database_security_group_id" {
  description = "The ID of the database security group"
  value       = aws_security_group.database.id
}
