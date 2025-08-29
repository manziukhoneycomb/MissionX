resource "azurerm_storage_account" "storage" {
  name                     = "${var.prefix}storage${var.environment}"
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = {
    prefix      = var.prefix
    environment = var.environment
  }
}

resource "azurerm_storage_container" "container" {
  name                  = "appdata"
  storage_account_name  = azurerm_storage_account.storage.name
  container_access_type = "private"
}
