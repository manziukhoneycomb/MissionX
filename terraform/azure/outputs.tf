output "resource_group_name" {
  description = "The name of the resource group"
  value       = azurerm_resource_group.rg.name
}

output "api_app_url" {
  description = "The URL of the API app service"
  value       = module.app_services.api_app_url
}

output "api_app_name" {
  description = "The name of the API app service"
  value       = module.app_services.api_app_name
}

output "client_app_url" {
  description = "The URL of the client app service"
  value       = module.app_services.client_app_url
}

output "client_app_name" {
  description = "The name of the client app service"
  value       = module.app_services.client_app_name
}

output "landing_app_url" {
  description = "The URL of the landing app service"
  value       = module.app_services.landing_app_url
}

output "landing_app_name" {
  description = "The name of the landing app service"
  value       = module.app_services.landing_app_name
}

output "postgresql_server_fqdn" {
  description = "The fully qualified domain name of the PostgreSQL server"
  value       = module.postgresql.postgresql_server_fqdn
}

output "postgresql_admin_password" {
  value     = module.postgresql.postgresql_admin_password
  sensitive = true
}

output "postgresql_db_name" {
  value = module.postgresql.postgresql_db_name
}

output "storage_account_name" {
  description = "The name of the storage account"
  value       = module.storage.storage_account_name
}

output "key_vault_uri" {
  description = "The URI of the Key Vault"
  value       = module.key_vault.key_vault_uri
}

output "acr_login_server" {
  description = "The login server URL for the Azure Container Registry"
  value       = module.container_registry.acr_login_server
}

output "acr_admin_username" {
  description = "The admin username for the Azure Container Registry"
  value       = module.container_registry.acr_admin_username
}

output "acr_admin_password" {
  description = "The admin password for the Azure Container Registry"
  value       = module.container_registry.acr_admin_password
  sensitive   = true
}