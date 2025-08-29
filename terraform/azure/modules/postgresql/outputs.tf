output "postgresql_server_fqdn" {
  value = azurerm_postgresql_flexible_server.postgres.fqdn
}

output "postgresql_admin_password" {
  value     = random_password.db_administrator_password.result
  sensitive = true
}

output "postgresql_db_name" {
  value = azurerm_postgresql_flexible_server_database.db.name
}
