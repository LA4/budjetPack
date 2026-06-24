terraform {
  backend "azurerm" {
    resource_group_name  = "rg-terraform-states"
    storage_account_name = "storbudjetpack"
    container_name       = "tfstate"
    key                  = "budjetpack.terraform.tfstate"
  }
}