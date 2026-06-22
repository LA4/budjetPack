# 1. Définition du Groupe de Ressources Azure
resource "azurerm_resource_group" "rg" {
  name     = "rg-budjetpack"
  location = "francecentral" # Vous pouvez choisir une autre région (ex: westeurope)
}

# 2. Définition de l'Azure Container Registry (ACR)
resource "azurerm_container_registry" "acr" {
  name                = "budjetpackacr"                
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"                        # Le niveau de tarification
  admin_enabled       = true                           # Activation du compte administrateur
}
