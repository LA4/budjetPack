# Commandes de déploiement

## Docker / ACR

```bash
# Build l'image backend
cd back-budjetPack && docker build -t acrbudjetpack.azurecr.io/budjetpack-backend:vX .

# Login ACR
az acr login --name acrbudjetpack

# Push l'image
docker push acrbudjetpack.azurecr.io/budjetpack-backend:vX

# Retagger une image existante (évite un rebuild)
docker tag acrbudjetpack.azurecr.io/budjetpack-backend:vX acrbudjetpack.azurecr.io/budjetpack-backend:vY
docker push acrbudjetpack.azurecr.io/budjetpack-backend:vY

# Lister les tags disponibles dans l'ACR
az acr repository show-tags --name acrbudjetpack --repository budjetpack-backend
```

## Terraform

```bash
# Déployer / mettre à jour l'infrastructure
cd cluster-budjetPack/terraform && terraform apply

# Vérifier les env vars actuelles du Container App
az containerapp show \
  --name backend-budjetpack \
  --resource-group rg-budjetpack \
  --query "properties.template.containers[0].env"

az containerapp show \
  --name frontend-budjetpack \
  --resource-group rg-budjetpack \
  --query "properties.template.containers[0].env"
  ```

## Azure Container Apps — Révisions

```bash
# Lister les révisions et leur état
az containerapp revision list \
  --name backend-budjetpack \
  --resource-group rg-budjetpack \
  --output table

# Forcer une nouvelle révision (sans rebuild)
az containerapp revision copy \
  --name backend-budjetpack \
  --resource-group rg-budjetpack

# Mettre à jour l'image (crée une nouvelle révision mais vide les env vars — préférer terraform apply)
az containerapp update \
  --name backend-budjetpack \
  --resource-group rg-budjetpack \
  --image acrbudjetpack.azurecr.io/budjetpack-backend:vX
```

## Azure Container Apps — Logs & Diagnostic

```bash
# Logs applicatifs (stdout du container)
az containerapp logs show \
  --name backend-budjetpack \
  --resource-group rg-budjetpack \
  --tail 50

# Logs système (image pull, crashes, health checks)
az containerapp logs show \
  --name backend-budjetpack \
  --resource-group rg-budjetpack \
  --type system \
  --tail 50
```

## Azure PostgreSQL

```bash
# Autoriser une extension PostgreSQL
az postgres flexible-server parameter set \
  --resource-group rg-budjetpack \
  --server-name psql-budjetpack \
  --name azure.extensions \
  --value uuid-ossp

# Exécuter du SQL sur la base (nécessite az extension add --name rdbms-connect)
az postgres flexible-server execute \
  --name psql-budjetpack \
  --database-name tasks \
  --querytext "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" \
  --admin-user adminbudjet \
  --admin-password "MOT_DE_PASSE"

# Ajouter son IP au firewall temporairement
MY_IP=$(curl -s https://api.ipify.org)
az postgres flexible-server firewall-rule create \
  --resource-group rg-budjetpack \
  --name psql-budjetpack \
  --rule-name allow-my-ip \
  --start-ip-address $MY_IP \
  --end-ip-address $MY_IP

# Supprimer la règle firewall temporaire
az postgres flexible-server firewall-rule delete \
  --resource-group rg-budjetpack \
  --name psql-budjetpack \
  --rule-name allow-my-ip \
  --yes
```

## Secrets

```bash
# Mettre à jour le mot de passe ACR dans le Container App
ACR_PASSWORD=$(az acr credential show --name acrbudjetpack --query "passwords[0].value" -o tsv)
az containerapp secret set \
  --name backend-budjetpack \
  --resource-group rg-budjetpack \
  --secrets "acr-password=$ACR_PASSWORD"
```

## URLs

- **Backend** : https://backend-budjetpack.happyocean-f5cada84.francecentral.azurecontainerapps.io
- **Frontend** : https://frontend-budjetpack.happyocean-f5cada84.francecentral.azurecontainerapps.io
