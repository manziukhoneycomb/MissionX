resource "azurerm_container_registry" "acr" {
  name                = "${var.prefix}acr${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "Basic"
  admin_enabled       = true

  tags = {
    prefix      = var.prefix
    environment = var.environment
  }
}
