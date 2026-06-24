locals {
  app_name = var.app_name
}

# 1. Groupe de ressources
resource "azurerm_resource_group" "rg" {
  name     = var.rg_name # "rg-budjetpack"
  location = var.deploy_location
}

# 2. Azure Container Registry
resource "azurerm_container_registry" "acr" {
  name                = "acrbudjetpack"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

# 3. Storage Account
resource "azurerm_storage_account" "storage" {
  name                     = "storbudjetpackdata"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# 4. Azure Container Apps Environment
resource "azurerm_container_app_environment" "env" {
  name                = "env-${local.app_name}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
}

# 5. Container App — Backend (NestJS, port 3000)
# 5. Container App — Backend (NestJS, port 3000)
resource "azurerm_container_app" "backend" {
  name                         = "backend-${local.app_name}"
  resource_group_name          = azurerm_resource_group.rg.name
  container_app_environment_id = azurerm_container_app_environment.env.id
  revision_mode                = "Single"

  ingress {
    external_enabled = true
    target_port      = 3000
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  registry {
    server               = azurerm_container_registry.acr.login_server
    username             = azurerm_container_registry.acr.admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = azurerm_container_registry.acr.admin_password
  }

  secret {
    name  = "db-password"
    value = var.db_admin_password
  }

  template {
    container {
      name   = "backend"
      image = var.backend_image
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "DB_HOST"
        value = azurerm_postgresql_flexible_server.db.fqdn
      }
      env {
        name  = "DB_PORT"
        value = "5432"
      }
      env {
        name  = "DB_USERNAME"
        value = "adminbudjet"
      }
      env {
        name        = "DB_PASSWORD"
        secret_name = "db-password"
      }
      env {
        name  = "DB_NAME"
        value = "tasks"
      }
      env {
        name  = "DATABASE_URL"
        value = "postgresql://adminbudjet:${var.db_admin_password}@${azurerm_postgresql_flexible_server.db.fqdn}:5432/tasks"
      }
    }
  }
}

# 6. Container App — Frontend (port 80)
resource "azurerm_container_app" "frontend" {
  name                         = "frontend-${local.app_name}"
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
      name   = "frontend"
      image  = var.frontend_image
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "API_URL"
        value = "https://${azurerm_container_app.backend.ingress[0].fqdn}"
      }
    }
  }
}

# 7. PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "db" {
  name                   = "psql-${local.app_name}"
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  version                = "16"
  administrator_login    = "adminbudjet"
  administrator_password = var.db_admin_password
  zone                   = "1"

  sku_name   = "B_Standard_B1ms"
  storage_mb = 32768

  backup_retention_days        = 7
  geo_redundant_backup_enabled = false
}

# 8. Base de données
resource "azurerm_postgresql_flexible_server_database" "db" {
  name      = "tasks"
  server_id = azurerm_postgresql_flexible_server.db.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# 9. Firewall : autorise les services Azure
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.db.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}
 