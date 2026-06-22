terraform {
  backend "azurerm" {
    resource_group_name  = "nom-du-rg-pour-le-state"
    storage_account_name = "nomducompte-de-stockage"
    container_name       = "tfstate"
    key                  = "budjetpack.terraform.tfstate"
  }
}