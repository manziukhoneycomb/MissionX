output "api_app_url" {
  value = "https://${azurerm_linux_web_app.api_app.default_hostname}"
}

output "api_app_principal_id" {
  value = azurerm_linux_web_app.api_app.identity[0].principal_id
}

output "api_app_name" {
  value = azurerm_linux_web_app.api_app.name
}

output "client_app_url" {
  value = "https://${azurerm_linux_web_app.client_app.default_hostname}"
}

output "client_app_name" {
  value = azurerm_linux_web_app.client_app.name
}

output "landing_app_url" {
  value = "https://${azurerm_linux_web_app.landing_app.default_hostname}"
}

output "landing_app_name" {
  value = azurerm_linux_web_app.landing_app.name
}