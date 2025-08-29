resource "azurerm_linux_web_app" "api_app" {
  name                = "${var.prefix}-api-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = var.app_service_plan_id
  virtual_network_subnet_id = var.subnet_api_id

  site_config {
    application_stack {
      docker_image_name     = "api:latest"
      docker_registry_url      = "https://${var.acr_login_server}"
      docker_registry_username = var.acr_admin_username
      docker_registry_password = var.acr_admin_password
    }
    always_on = true
    cors {
      allowed_origins     = ["https://${azurerm_linux_web_app.client_app.default_hostname}"]
      support_credentials = false
    }
  }

  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "DB_HOST"                             = var.database_host
    "DB_USERNAME"                         = var.database_username
    "DB_PASSWORD"                         = var.database_password
    "DB_DATABASE"                         = var.database_name
    "DB_SSL"                              = "true"
    "SECRET_STORAGE_PROVIDER"             = "azure"
    "AZURE_KEY_VAULT_URL"                 = var.key_vault_uri
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    prefix      = var.prefix
    environment = var.environment
  }
}

resource "azurerm_linux_web_app" "client_app" {
  name                = "${var.prefix}-client-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = var.app_service_plan_id

  site_config {
    application_stack {
      docker_image_name     = "client:latest"
      docker_registry_url      = "https://${var.acr_login_server}"
      docker_registry_username = var.acr_admin_username
      docker_registry_password = var.acr_admin_password
    }
    always_on = true
  }

  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
  }

  tags = {
    prefix      = var.prefix
    environment = var.environment
  }
}

resource "azurerm_linux_web_app" "landing_app" {
  name                = "${var.prefix}-landing-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = var.app_service_plan_id

  site_config {
    application_stack {
      docker_image_name     = "landing:latest"
      docker_registry_url      = "https://${var.acr_login_server}"
      docker_registry_username = var.acr_admin_username
      docker_registry_password = var.acr_admin_password
    }
    always_on = true
  }

  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "APP_URL"                             = "https://${azurerm_linux_web_app.client_app.default_hostname}"
  }

  tags = {
    prefix      = var.prefix
    environment = var.environment
  }
}
