output "ecs_cluster_id" {
  description = "The ID of the ECS cluster"
  value       = aws_ecs_cluster.main.id
}

output "ecs_cluster_name" {
  description = "The name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_log_group_name" {
  description = "The name of the CloudWatch log group for ECS"
  value       = aws_cloudwatch_log_group.ecs_logs.name
}
