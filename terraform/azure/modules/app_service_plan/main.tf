resource "azurerm_service_plan" "app_plan" {
  name                = "${var.prefix}-asp-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "B1" # Basic tier which supports containers

  tags = {
    prefix      = var.prefix
    environment = var.environment
  }
}
