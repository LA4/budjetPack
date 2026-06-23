variable "rg_name" {
  type    = string
  default = "rg-budjetpack"
}

variable "deploy_location" {
  type    = string
  default = "francecentral"
}

variable "app_name" {
  type    = string
  default = "budjetpack"
}

variable "container_image" {
  type    = string
  default = "acrbudjetpackcdy0.azurecr.io/budjetpack-frontend:v1"
}

variable "db_password" {
  type      = string
  sensitive = true
}