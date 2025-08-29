resource "azurerm_virtual_network" "default" {
  name                = "${var.prefix}-vnet-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  address_space       = ["10.0.0.0/16"]

  tags = {
    client      = var.prefix
    environment = var.environment
  }
}

resource "azurerm_subnet" "default" {
  name                 = "${var.prefix}-snet-default-${var.environment}"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.default.name
  address_prefixes     = ["10.0.0.0/24"]
}

resource "azurerm_subnet" "api" {
  name                 = "${var.prefix}-snet-api-${var.environment}"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.default.name
  address_prefixes     = ["10.0.2.0/24"]

  delegation {
    name = "api-delegation"

    service_delegation {
      name    = "Microsoft.Web/serverFarms"
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
    }
  }
}

resource "azurerm_subnet" "database" {
  name                 = "${var.prefix}-snet-db-${var.environment}"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.default.name
  address_prefixes     = ["10.0.3.0/24"]
  service_endpoints    = ["Microsoft.Storage"]

  delegation {
    name = "fs"

    service_delegation {
      name = "Microsoft.DBforPostgreSQL/flexibleServers"

      actions = ["Microsoft.Network/virtualNetworks/subnets/join/action", ]
    }
  }
}

resource "azurerm_private_dns_zone" "default" {
  name                = "${var.prefix}-pdz-${var.environment}.postgres.database.azure.com"
  resource_group_name = var.resource_group_name

  tags = {
    client      = var.prefix
    environment = var.environment
  }
}

resource "azurerm_private_dns_zone_virtual_network_link" "default" {
  name                  = "${var.prefix}-pl-${var.environment}"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.default.name
  virtual_network_id    = azurerm_virtual_network.default.id
}
