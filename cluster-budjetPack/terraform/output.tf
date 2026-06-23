output "resource_group" {
  value = azurerm_resource_group.rg.name
}

output "acr_login_server" {
  description = "URL pour pousser vos images Docker"
  value       = azurerm_container_registry.acr.login_server
}

output "storage_account_name" {
  value = azurerm_storage_account.storage.name
}

output "container_app_url" {
  description = "URL publique de votre application"
  value       = "https://${azurerm_container_app.frontend.ingress[0].fqdn}"
}