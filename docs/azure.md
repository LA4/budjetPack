# Azure — Infrastructure et deploiement

## Vue d'ensemble

| Ressource                | Nom                        | Region        |
|--------------------------|----------------------------|---------------|
| Resource Group           | rg-budjetpack              | francecentral |
| Azure Container Registry | acrbudjetpack              | francecentral |
| Container Apps Env.      | env-budjet                 | francecentral |
| Container App backend    | backend-budjetpack         | francecentral |
| Container App frontend   | frontend-budjetpack        | francecentral |
| PostgreSQL Flexible      | psql-budjetpack            | francecentral |
| Storage Account          | storbudjetpackdata         | francecentral |

URLs de production :
- Frontend : `https://frontend-budjetpack.happyocean-f5cada84.francecentral.azurecontainerapps.io`
- Backend : `https://backend-budjetpack.happyocean-f5cada84.francecentral.azurecontainerapps.io`

## Prerequis

- Azure CLI installe et connecte : `az login`
- Acces au resource group `rg-budjetpack`
- Docker Desktop

## Publier une nouvelle image

### 1. Connexion au registre

```bash
az acr login --name acrbudjetpack
```

### 2. Build et push

```bash
# Backend
docker build -t acrbudjetpack.azurecr.io/budjetpack-backend:latest ./back-budjetPack
docker push acrbudjetpack.azurecr.io/budjetpack-backend:latest

# Frontend
docker build -t acrbudjetpack.azurecr.io/budjetpack-frontend:latest ./front-budjetPack
docker push acrbudjetpack.azurecr.io/budjetpack-frontend:latest
```

### 3. Forcer une nouvelle revision

```bash
az containerapp update \
  --name backend-budjetpack \
  --resource-group rg-budjetpack \
  --image acrbudjetpack.azurecr.io/budjetpack-backend:latest

az containerapp update \
  --name frontend-budjetpack \
  --resource-group rg-budjetpack \
  --image acrbudjetpack.azurecr.io/budjetpack-frontend:latest
```

## Variables d'environnement en production

Le backend recoit ses variables via les secrets Container Apps :

| Variable       | Source                                         |
|----------------|------------------------------------------------|
| DB_HOST        | FQDN du serveur PostgreSQL Flexible            |
| DB_PORT        | 5432                                           |
| DB_USERNAME    | adminbudjet                                    |
| DB_PASSWORD    | secret `db-password` dans Container Apps      |
| DB_NAME        | tasks                                          |
| DATABASE_URL   | Construite a partir des variables ci-dessus    |

Le frontend recoit `API_URL` au demarrage du conteneur via `entrypoint.sh`, qui l'ecrit dans `env-config.js` avant de lancer nginx.

## Consulter les logs

```bash
# Logs backend en temps reel
az containerapp logs show \
  --name backend-budjetpack \
  --resource-group rg-budjetpack \
  --follow

# Logs frontend
az containerapp logs show \
  --name frontend-budjetpack \
  --resource-group rg-budjetpack \
  --follow
```

## Base de donnees

La base PostgreSQL Flexible ne peut etre jointe qu'a partir des services Azure (regle firewall `0.0.0.0 - 0.0.0.0`). Pour y acceder depuis votre poste, ajoutez votre IP :

```bash
az postgres flexible-server firewall-rule create \
  --resource-group rg-budjetpack \
  --name psql-budjetpack \
  --rule-name my-ip \
  --start-ip-address <votre-ip> \
  --end-ip-address <votre-ip>
```

Connexion :

```bash
psql -h psql-budjetpack.postgres.database.azure.com -U adminbudjet -d tasks
```
