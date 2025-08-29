terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.94.0"
    }
  }

  # IMPORTANT #
  # This will upload the terraform state to the storage.
  # Variables are not allowed here, you should specify names explicitly
  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "aitemplatetfstatestorage"
    container_name       = "tfstate"
    key                  = "ai_template_test_terraform.tfstate"
  }

  required_version = ">= 1.1.0"
}

provider "azurerm" {
  features {
  }
}

data "azurerm_client_config" "current" {}

resource "azurerm_resource_group" "rg" {
  name     = "${var.prefix}-rg-${var.environment}"
  location = var.location
}

module "network" {
  source              = "./modules/network"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  prefix              = var.prefix
  environment         = var.environment
}

module "container_registry" {
  source              = "./modules/container_registry"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  prefix              = var.prefix
  environment         = var.environment
}

module "app_service_plan" {
  source              = "./modules/app_service_plan"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  prefix              = var.prefix
  environment         = var.environment
}

module "app_services" {
  source              = "./modules/app_services"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  app_service_plan_id = module.app_service_plan.app_service_plan_id
  prefix              = var.prefix
  environment         = var.environment
  acr_login_server    = module.container_registry.acr_login_server
  acr_admin_username  = module.container_registry.acr_admin_username
  acr_admin_password  = module.container_registry.acr_admin_password
  subnet_api_id       = module.network.subnet_api_id
  database_host       = module.postgresql.postgresql_server_fqdn
  database_username   = "psqladmin"
  database_password   = module.postgresql.postgresql_admin_password
  database_name       = module.postgresql.postgresql_db_name
  key_vault_uri       = module.key_vault.key_vault_uri
}

module "key_vault" {
  source              = "./modules/key_vault"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  prefix              = var.prefix
  environment         = var.environment
  tenant_id           = data.azurerm_client_config.current.tenant_id
}

module "postgresql" {
  source              = "./modules/postgresql"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  prefix              = var.prefix
  environment         = var.environment
  subnet_db_id        = module.network.subnet_db_id
  private_dns_zone_id = module.network.private_dns_zone_id
}

module "storage" {
  source              = "./modules/storage"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  prefix              = var.prefix
  environment         = var.environment
}

resource "azurerm_key_vault_access_policy" "api_app_policy" {
  key_vault_id = module.key_vault.key_vault_id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = module.app_services.api_app_principal_id

  secret_permissions = [
    "Get", "List", "Set"
  ]

  depends_on = [
    module.app_services
  ]
}