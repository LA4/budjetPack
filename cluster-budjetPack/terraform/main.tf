# Suffixe aléatoire unique, figé tant que rg_name/location ne changent pas
resource "random_string" "suffix" {
  length  = 4
  special = false
  upper   = false

  keepers = {
    rg_name  = var.rg_name
    location = var.deploy_location
  }
}

locals {
  # ex: "budjetpacka3f2" — utilisé partout pour garantir la cohérence
  suffix = "${var.app_name}${random_string.suffix.result}"
}

# 1. Groupe de ressources
resource "azurerm_resource_group" "rg" {
  name     = var.rg_name
  location = var.deploy_location
}

# 2. Azure Container Registry
# Nom : "acrbudjetpacka3f2" (max 50 car, alphanumérique uniquement)
resource "azurerm_container_registry" "acr" {
  name                = "acr${local.suffix}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

# 3. Storage Account
# Nom : "storbudjetpacka3f2" (max 24 car, substr pour sécuriser)
resource "azurerm_storage_account" "storage" {
  name                     = "stor${substr(local.suffix, 0, 20)}"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# 4. Azure Container Apps Environment
resource "azurerm_container_app_environment" "env" {
  name                = "env-${local.suffix}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
}

# 5. Azure Container App
resource "azurerm_container_app" "app" {
  name                         = "app-${local.suffix}"
  resource_group_name          = azurerm_resource_group.rg.name
  container_app_environment_id = azurerm_container_app_environment.env.id
  revision_mode                = "Single"

  ingress {
    external_enabled = true
    target_port      = 80
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  # Registry gardée prête pour quand votre image sera disponible
  registry {
    server               = azurerm_container_registry.acr.login_server
    username             = azurerm_container_registry.acr.admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = azurerm_container_registry.acr.admin_password
  }

  template {
    container {
      name   = var.app_name
      image  = var.container_image  # image publique pour l'instant
      cpu    = 0.25
      memory = "0.5Gi"
    }
  }
}

# 6. PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "db" {
  name                   = "psql-${local.suffix}"
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  version                = "16"
  administrator_login    = "adminbudjet"
  administrator_password = var.db_password
  zone                   = "1"

  sku_name   = "B_Standard_B1ms"
  storage_mb = 32768

  backup_retention_days        = 7
  geo_redundant_backup_enabled = false
}

# 7. Base de données
resource "azurerm_postgresql_flexible_server_database" "db" {
  name      = "tasks"
  server_id = azurerm_postgresql_flexible_server.db.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# 8. Firewall : autorise uniquement les services Azure (Container App)
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.db.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}