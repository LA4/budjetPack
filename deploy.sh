#!/bin/bash

# --- CONFIGURATION ---
CHEMIN_FRONT="./front-budjetPack/deployment/k8s/api-deployment.yaml"
CHEMIN_BACK="./back-budjetPack/deployment/k8s/api-deployment.yaml"
NAMESPACE="budjetpack"

echo "🚀 Lancement de l'automatisation BudjetPack..."

# --- 0. PRÉ-VÉRIFICATIONS (DOCKER & MINIKUBE) ---
echo "🔍 Vérification des prérequis..."

# Vérification de Docker (et Docker Compose)
if ! docker info >/dev/null 2>&1; then
    echo "❌ Erreur : Le démon Docker n'est pas lancé. Veuillez démarrer Docker Desktop ou votre service Docker."
    exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
    echo "❌ Erreur : 'docker compose' n'est pas disponible ou mal configuré."
    exit 1
fi
echo "🐳 Docker et Docker Compose sont opérationnels."

# Vérification de Minikube
if ! minikube status >/dev/null 2>&1; then
    echo "❌ Erreur : Minikube n'est pas démarré. Lancez la commande 'minikube start' avant de réessayer."
    exit 1
fi
echo "☸️ Minikube est bien démarré et accessible."

echo "--------------------------------------------------"

# --- 1. CHARGEMENT CONDITIONNEL DES IMAGES ---
echo "📥 Vérification des images dans Minikube..."

image_exists() {
    minikube image ls --format "{{.Repository}}:{{.Tag}}" | grep -q "$1"
}

# Frontend
if image_exists "budjetpack-frontend:v1"; then
    echo "✅ Image 'budjetpack-frontend:v1' déjà présente."
else
    echo "📤 Chargement de 'budjetpack-frontend:v1' dans Minikube..."
    minikube image load budjetpack-frontend:v1
    echo "✅ Image 'budjetpack-frontend:v1' chargée avec succès."
fi

# Backend
if image_exists "budjetpack-backend:v1"; then
    echo "✅ Image 'budjetpack-backend:v1' déjà présente."
else
    echo "📤 Chargement de 'budjetpack-backend:v1' dans Minikube..."
    minikube image load budjetpack-backend:v1
    echo "✅ Image 'budjetpack-backend:v1' chargée avec succès."
fi

# --- 2. GESTION DU NAMESPACE ---
echo "📂 Vérification du namespace '$NAMESPACE'..."

if kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
    echo "✅ Le namespace '$NAMESPACE' existe déjà."
else
    echo "🏗️ Création du namespace '$NAMESPACE'..."
    kubectl create namespace "$NAMESPACE"
    echo "✅ Namespace '$NAMESPACE' créé avec succès."
fi

# --- 3. DÉPLOIEMENT FRONTEND ---
echo "🖥️ Déploiement du Frontend..."
kubectl apply -f "$CHEMIN_FRONT" -n "$NAMESPACE"
kubectl rollout restart deployment budjetpack-frontend -n "$NAMESPACE"
echo "✅ Frontend redémarré."

# --- 4. DÉPLOIEMENT BACKEND ---
echo "📦 Déploiement du Backend..."
kubectl apply -f "$CHEMIN_BACK" -n "$NAMESPACE"
kubectl rollout restart deployment budjetpack-backend -n "$NAMESPACE"
echo "✅ Backend redémarré."

echo "🎉 Tout est prêt ! L'environnement BudjetPack est à jour."

# --- 5. Lancement de l'environnement---
echo "🚀 Lancement de l'environnement..."
minikube start
minikube tunnel
kubectl get httpRoute -A
minikube dashboard
echo "🌐 Accédez à l'interface BudjetPack via le dashboard Minikube."