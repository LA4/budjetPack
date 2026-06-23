terraform {
  backend "azurerm" {
    resource_group_name  = "budjetpackteam"
    storage_account_name = "budjetpackstorage"
    container_name       = "tfstate"
    key                  = "budjetpack.terraform.tfstate"
  }
}