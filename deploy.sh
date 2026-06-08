#!/bin/bash

# --- VOS CHEMINS ABSOLUS ---
# (Remplacés avec des "/" pour que Git Bash fonctionne parfaitement)
CHEMIN_FRONT="./front-budjetPack/deployment/k8s/api-deployment.yaml"
CHEMIN_BACK="./back-budjetPack/deployment/k8s/api-deployment.yaml"

echo "🚀 Lancement de l'automatisation BudjetPack..."

# 1. Chargement des images dans Minikube
echo "📥 Transfert des images Docker vers Minikube..."
minikube image load budjetpack-frontend:v1
minikube image load budjetpack-backend:v1

# 2. Création du namespace (sans erreur s'il existe déjà)
echo "📂 Vérification du namespace..."
kubectl get namespace budjetpack >/dev/null 2>&1 || kubectl create namespace budjetpack

# 3. Déploiement du Frontend
echo "🖥️ Déploiement du Frontend..."
kubectl apply -f "$CHEMIN_FRONT"
kubectl rollout restart deployment budjetpack-frontend -n budjetpack

# 4. Déploiement du Backend
echo "📦 Déploiement du Backend..."
kubectl apply -f "$CHEMIN_BACK"
kubectl rollout restart deployment budjetpack-backend -n budjetpack

echo "✅ Tout est chargé et déployé avec succès !"