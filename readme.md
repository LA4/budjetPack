# 🚀 Guide de Déploiement Local - BudjetPack

Ce guide vous permet de déployer l'ensemble de l'infrastructure BudjetPack (Frontend & Backend) sur votre machine locale à l'aide de Kubernetes, Minikube et de notre script d'automatisation.

---

## 🛠️ Prérequis

Avant de lancer le déploiement, assurez-vous d'avoir :
- **Docker** installé et lancé en arrière-plan.
- **Minikube** installé et démarré (commande `minikube start`).
- **Kubectl** installé.
- **Git Bash** (fortement recommandé sur Windows pour exécuter le script `.sh`).

---

## 📦 1. Construction des images Docker

Le script va charger vos images locales directement dans Minikube. Vous devez d'abord les construire sur votre machine avec le tag `v1`.

Ouvrez un terminal et exécutez ces commandes à la racine de chaque sous-projet :

**Pour le Frontend :**
```bash
cd front-budjetPack
docker build -t budjetpack-frontend:v1 .
```

**Pour le Backend :**
```bash
cd back-budjetPack
docker build -t budjetpack-backend:v1 .
```

---

## ⚙️ 2. Création du script de déploiement (deploy.sh)

*(Note : Si le fichier `deploy.sh` existe déjà à la racine du projet `budjetPack/`, vous pouvez ignorer cette étape).*

Créez un fichier nommé `deploy.sh` à la **racine du projet global** (au même niveau que les dossiers `front-budjetPack` et `back-budjetPack`) et insérez le code suivant. Il utilise des chemins relatifs pour fonctionner sur n'importe quel ordinateur :

```bash
#!/bin/bash

# --- CHEMINS RELATIFS ---
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
```

---

## 🚀 3. Lancement du déploiement

1. Ouvrez **Git Bash** à la racine de votre projet (là où se trouve le script).
2. Donnez les droits d'exécution au script (à faire une seule fois) :
```bash
   chmod +x deploy.sh
   ```
3. Lancez le déploiement :
```bash
   ./deploy.sh
   ```

💡 **Astuce :** À chaque fois que vous modifiez votre code, il vous suffit de refaire un `docker build` (Étape 1) puis de relancer `./deploy.sh` (Étape 3) pour mettre à jour l'application sans aucune coupure de service !

---

## 🔍 4. Commandes utiles

Une fois le script terminé, vous pouvez vérifier l'état de votre cluster avec ces commandes :

- **Voir tous les pods :** `kubectl get pods -n budjetpack`
- **Voir les services :** `kubectl get svc -n budjetpack`
- **Voir les logs d'un pod :** `kubectl logs <nom-du-pod> -n budjetpack`