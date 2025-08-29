output "subnet_api_id" {
  value = azurerm_subnet.api.id
}

output "subnet_db_id" {
  value = azurerm_subnet.database.id
}

output "private_dns_zone_id" {
  value = azurerm_private_dns_zone.default.id
}
