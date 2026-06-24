# Terraform — Gestion de l'infrastructure Azure

Les fichiers Terraform se trouvent dans `cluster-budjetPack/terraform/`.

## Etat distant

L'etat Terraform est stocke dans Azure Blob Storage (configure dans `backend.tf`) :

| Parametre        | Valeur                    |
|------------------|---------------------------|
| Resource Group   | rg-terraform-states       |
| Storage Account  | storbudjetpack            |
| Container        | tfstate                   |
| Cle              | budjetpack.terraform.tfstate |

Ce backend doit exister avant le premier `terraform init`. S'il n'existe pas encore :

```bash
az group create --name rg-terraform-states --location francecentral

az storage account create \
  --name storbudjetpack \
  --resource-group rg-terraform-states \
  --sku Standard_LRS

az storage container create \
  --name tfstate \
  --account-name storbudjetpack
```

## Variables

| Variable           | Defaut          | Description                              |
|--------------------|-----------------|------------------------------------------|
| rg_name            | rg-budjetpack   | Nom du resource group applicatif         |
| deploy_location    | francecentral   | Region Azure                             |
| app_name           | budjet          | Prefixe utilise pour nommer les ressources |
| db_admin_password  | (aucun)         | Mot de passe administrateur PostgreSQL   |
| backend_image      | (aucun)         | Image ACR complete du backend            |
| frontend_image     | (aucun)         | Image ACR complete du frontend           |

Creer un fichier `terraform.tfvars` (non commite) :

```hcl
db_admin_password = "MotDePasseSecurise!"
backend_image     = "acrbudjetpack.azurecr.io/budjetpack-backend:latest"
frontend_image    = "acrbudjetpack.azurecr.io/budjetpack-frontend:latest"
```

## Commandes

```bash
cd cluster-budjetPack/terraform

# Initialiser le backend distant
terraform init

# Verifier le plan sans appliquer
terraform plan -var-file="terraform.tfvars"

# Appliquer les changements
terraform apply -var-file="terraform.tfvars"

# Detruire toute l'infrastructure
terraform destroy -var-file="terraform.tfvars"
```

## Ressources provisionnees

```
azurerm_resource_group              rg-budjetpack
azurerm_container_registry          acrbudjetpack (Basic, admin enabled)
azurerm_storage_account             storbudjetpackdata
azurerm_container_app_environment   env-budjet
azurerm_container_app               backend-budjetpack  (NestJS, port 3000, ingress externe)
azurerm_container_app               frontend-budjetpack (nginx, port 80, ingress externe)
azurerm_postgresql_flexible_server  psql-budjetpack (v16, B_Standard_B1ms, 32 GiB)
azurerm_postgresql_flexible_database tasks
azurerm_postgresql_flexible_server_firewall_rule allow-azure-services
```

## Outputs

Apres un `terraform apply`, les sorties suivantes sont disponibles :

```bash
terraform output front_app_url   # URL publique du frontend
terraform output back_app_url    # URL publique du backend
terraform output acr_login_server
terraform output resource_group
terraform output storage_account_name
```

## Bonnes pratiques

- Ne jamais commiter `terraform.tfvars` ni les fichiers `.tfstate`. Ils sont dans `.gitignore`.
- Le mot de passe PostgreSQL doit etre fourni uniquement via la variable `db_admin_password` (marquee `sensitive`).
- Les images doivent etre poussees dans l'ACR avant d'appliquer Terraform, sinon les Container Apps demarrent en erreur.
