# 🛠️ Infrastructure Azure avec Terraform - BudjetPack

Ce dossier contient les fichiers de configuration Terraform pour provisionner les ressources nécessaires au déploiement de **BudjetPack** sur Microsoft Azure.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé sur votre machine :
1. **Terraform** (CLI)
2. **Azure CLI** (`az`)

Vous devez également être connecté à votre compte Azure via le terminal :
```bash
az login
```

---

## 💾 1. Gestion de l'état (State) Terraform

Le fichier d'état de Terraform (`terraform.tfstate`) permet de suivre l'état de vos ressources Azure. Vous avez deux options pour le gérer :

### Option A : Stockage Local (Recommandé pour tester rapidement)
Si vous travaillez seul et souhaitez démarrer sans configurer de stockage Azure pour le state :
1. Renommez ou supprimez le fichier `backend.tf` (par exemple : `backend.tf.backup`).
2. Le fichier d'état sera créé localement sous le nom `terraform.tfstate`.
3. *Note : Ce fichier est déjà exclu de Git grâce au fichier `.gitignore` à la racine.*

### Option B : Stockage Distant (Recommandé pour la production/travail en équipe)
Pour stocker l'état de manière sécurisée sur Azure Blob Storage, vous devez créer les ressources préalablement à l'aide de l'Azure CLI :

```bash
# 1. Création du groupe de ressources dédié aux états
az group create --name rg-terraform-states --location francecentral

# 2. Création du compte de stockage (Nom unique au monde, uniquement minuscules et chiffres, 3-24 car.)
az storage account create --name budjetpackstates456 --resource-group rg-terraform-states --location francecentral --sku Standard_LRS

# 3. Création du conteneur blob
az storage container create --name tfstate --account-name budjetpackstates456
```

Une fois ces ressources créées, configurez votre fichier `backend.tf` comme ceci :
```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-terraform-states"
    storage_account_name = "budjetpackstates456" # Remplacez par le nom créé à l'étape 2
    container_name       = "tfstate"
    key                  = "budjetpack.terraform.tfstate"
  }
}
```

---

## 🚀 2. Initialisation et Déploiement

Une fois votre choix de backend configuré :

### Étape 1 : Initialiser Terraform
Télécharge les providers requis (Azure) et configure le backend.
```bash
terraform init
```

### Étape 2 : Planifier les modifications
Permet de visualiser les ressources qui vont être créées ou modifiées sur Azure sans appliquer les changements.
```bash
terraform plan
```

### Étape 3 : Appliquer les modifications
Crée les ressources sur Azure (Resource Group, Azure Container Registry, etc.).
```bash
terraform apply
```

---

## 🔒 Sécurité et Bonnes Pratiques
* **Ne commitez jamais** les fichiers `.tfstate`, `.tfstate.backup`, `.terraform/` ni les fichiers de variables sensibles (`*.tfvars`).
* Si vous utilisez des variables contenant des secrets (mots de passe, tokens), déclarez-les dans un fichier `secret.tfvars` et ne le poussez pas sur Git.
