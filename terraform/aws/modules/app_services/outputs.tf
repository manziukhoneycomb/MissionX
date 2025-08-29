output "api_service_url" {
  description = "The URL of the API service"
  value       = "http://${aws_lb.main.dns_name}/api"
}

output "client_service_url" {
  description = "The URL of the client service"
  value       = "http://${aws_lb.main.dns_name}"
}

output "landing_service_url" {
  description = "The URL of the landing service"
  value       = "http://${aws_lb.main.dns_name}"
}

output "api_task_role_arn" {
  description = "The ARN of the API task role"
  value       = aws_iam_role.api_task_role.arn
}

output "load_balancer_dns" {
  description = "The DNS name of the load balancer"
  value       = aws_lb.main.dns_name
}
