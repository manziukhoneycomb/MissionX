resource "random_password" "db_administrator_password" {
  length  = 18
  lower   = true
  special = false
  upper   = true

  min_lower   = 3
  min_numeric = 3
  min_upper   = 3

  keepers = {
    pass_version = 1
  }
}

resource "azurerm_postgresql_flexible_server" "postgres" {
  name                   = "${var.prefix}-psql-${var.environment}"
  resource_group_name    = var.resource_group_name
  location               = var.location
  version                = "16"
  delegated_subnet_id    = var.subnet_db_id
  private_dns_zone_id    = var.private_dns_zone_id
  administrator_login    = "psqladmin"
  administrator_password = random_password.db_administrator_password.result
  
  storage_mb = 32768 # Minimum storage for Burstable tier (32GB)
  
  sku_name = "B_Standard_B1ms" # Burstable tier, cheapest option
  
  backup_retention_days        = 7
  zone                         = "1"
}

resource "azurerm_postgresql_flexible_server_database" "db" {
  name      = "${var.prefix}-postgdb-${var.environment}"
  server_id = azurerm_postgresql_flexible_server.postgres.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "azurerm_postgresql_flexible_server_configuration" "allow_extensions" {
  name      = "azure.extensions"
  server_id = azurerm_postgresql_flexible_server.postgres.id
  value     = "UUID-OSSP"
}
