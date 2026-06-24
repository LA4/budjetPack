# BudjetPack — Guide developpeur

Application de suivi budgetaire composee d'un backend NestJS, d'un frontend Angular 21 et d'une base PostgreSQL 16.

## Architecture

```
front-budjetPack/   Angular 21 (nginx en prod, ng serve en dev)
back-budjetPack/    NestJS 11 + TypeORM
database/           PostgreSQL 16 + MinIO (stockage objet)
cluster-budjetPack/ Infra Kubernetes + Terraform (Azure)
```

## Prerequis

- Docker Desktop
- Node.js 20+ et npm 11+
- (optionnel) Angular CLI : `npm install -g @angular/cli`

## Lancement local (docker-compose)

La commande suivante demarre tous les services : base de donnees, MinIO, backend et frontend.

```bash
docker compose up --build
```

| Service  | URL                      | Description           |
|----------|--------------------------|-----------------------|
| Frontend | http://localhost:4200    | Application Angular   |
| Backend  | http://localhost:3000    | API NestJS            |
| Adminer  | http://localhost:8080    | Interface base de donnees |
| MinIO    | http://localhost:9001    | Console stockage objet |

Credentials base de donnees locaux : `app / app`, base `tasks`.
Credentials MinIO locaux : `minio / minio12345`.

## Lancement en developpement (sans Docker)

### Backend

```bash
cd back-budjetPack
npm install
# Lancer une base PostgreSQL separement (voir database/docker-compose.yml)
docker compose -f database/docker-compose.yml up -d
npm run start:dev
```

Variables d'environnement requises (a placer dans un `.env`) :

```env
DATABASE_URL=postgresql://app:app@localhost:5432/tasks
JWT_SECRET=dev-secret-do-not-use-in-prod-please-32-chars
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=uploads
S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio12345
```

### Frontend

```bash
cd front-budjetPack
npm install
npm start
```

Par defaut, le frontend pointe sur `http://localhost:3000` si la variable `window.ENV_API_URL` n'est pas definie.

## Tests

```bash
# Backend
cd back-budjetPack && npm test

# Frontend
cd front-budjetPack && npm test
```

## Endpoints API

| Methode | Route         | Description                  |
|---------|---------------|------------------------------|
| GET     | /health       | Healthcheck                  |
| GET     | /budget       | Recupere le budget mensuel   |
| POST    | /budget       | Met a jour la limite mensuelle |
| GET     | /categories   | Liste les categories         |
| POST    | /categories   | Cree une categorie           |
| DELETE  | /categories/:id | Supprime une categorie     |
| GET     | /expenses     | Liste les depenses           |
| POST    | /expenses     | Cree une depense             |
| DELETE  | /expenses/:id | Supprime une depense         |

## Deploiement

- Local Kubernetes (Minikube) : voir `../readme.md`
- Azure — push des images et mise a jour des Container Apps : voir `azure.md`
- Azure — provisionnement de l'infrastructure : voir `terraform.md`

L'ordre a respecter pour un premier deploiement Azure :
1. Provisionner l'infrastructure avec Terraform (`terraform.md`)
2. Pousser les images dans l'ACR (`azure.md`)
3. Mettre a jour les Container Apps (`azure.md`)
