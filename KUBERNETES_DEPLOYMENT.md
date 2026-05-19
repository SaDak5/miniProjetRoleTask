# Déploiement Kubernetes - RoleTask

⚡ **DÉMARRAGE RAPIDE** : Construis les images, puis déploie avec le dossier `k8s/`.

Ce dépôt contient une base Kubernetes prête à appliquer avec `kubectl apply -k k8s`.

## Architecture

- `frontend` : image Angular servie par Nginx
- `backend` : application Spring Boot
- `mysql` : base de données MySQL pour un environnement de démonstration
- `ingress` : expose l'application sur un seul hostname et route `/api` vers le backend

## Prérequis

- Un cluster Kubernetes accessible
- `kubectl` configuré sur ce cluster
- Une classe de stockage disponible pour le PVC MySQL
- Un controller Ingress, par exemple `nginx`

## 1️⃣ Construire les images

Depuis la racine du projet :

```bash
docker build -t roletask-backend:latest ./RoleTask
docker build -t roletask-frontend:latest ./roletask-frontend

# Vérifie que les deux existent
docker images | grep roletask
```

## 2️⃣ Pousser vers Docker Hub (optionnel)

Si tu déploies en local/dev, ignore cette étape. Sinon :

```bash
# Connexion
docker login

# Tag vers ton username
docker tag roletask-backend:latest [ton-username]/roletask-backend:latest
docker tag roletask-frontend:latest [ton-username]/roletask-frontend:latest

# Push
docker push [ton-username]/roletask-backend:latest
docker push [ton-username]/roletask-frontend:latest
```

Ensuite mise à jour du manifeste :

```bash
# Remplace dans k8s/roletask.yaml
roletask-backend:latest  →  [ton-username]/roletask-backend:latest
roletask-frontend:latest →  [ton-username]/roletask-frontend:latest
```

## 3️⃣ Adapter le manifeste

Avant de déployer, ajustez les fichiers du dossier [k8s/](k8s) :

```yaml
# backend image
image: roletask-backend:latest  # ou [ton-username]/roletask-backend:latest

# frontend image  
image: roletask-frontend:latest  # ou [ton-username]/roletask-frontend:latest

# Ingress host
host: roletask.example.com  # ou ton vrai domain

# secrets si tu veux changer les passwords MySQL
MYSQL_PASSWORD: roletask_password
JWT_SECRET: roletask_secret_key_2024
```

## 4️⃣ Déployer

```bash
kubectl apply -f k8s/roletask.yaml
```

Si tu utilises le layout actuel du dépôt, préfère :

```bash
kubectl apply -k k8s
```

Si cette commande échoue avec `failed to download openapi`, le problème vient en général du cluster ou du contexte kubectl, pas des manifests. Vérifie d’abord que le contexte actif pointe vers un cluster joignable avec `kubectl config current-context` et `kubectl get ns`.

Tu peux utiliser `--validate=false` seulement comme contournement temporaire si l’API server est joignable mais que la récupération du schéma OpenAPI échoue encore.

## 5️⃣ Vérifier

```bash
kubectl get pods -n roletask
kubectl get svc -n roletask
kubectl get ingress -n roletask

# Attends que tous les pods passent en "Running" (2-3 min)
kubectl wait --for=condition=ready pod -l app=backend -n roletask --timeout=300s
kubectl wait --for=condition=ready pod -l app=frontend -n roletask --timeout=300s
```

## 6️⃣ Accéder à l'application

Une fois l'Ingress prêt :

```bash
# Récupère l'IP de l'Ingress
kubectl get ingress roletask-ingress -n roletask -o wide
```

Ajoute au fichier `hosts` :
```
<IP-INGRESS>  roletask.example.com
```

Ouvre `http://roletask.example.com`

---

## 🔄 Architecture automatisée

Le frontend utilise automatiquement :

- `http://localhost:8094/api` en développement Angular local `localhost:4200`
- `/api` en production (Docker, Kubernetes, cloud)

## 🛠️ Notes de production

- **Base de données** : Remplace MySQL conteneur par une instance managée (RDS, Cloud SQL, Azure Database)
- **Secrets** : Stocke les mots de passe dans un gestionnaire de secrets cloud (AWS Secrets Manager, Azure Key Vault, Google Secret Manager)
- **Stockage** : Utilise le stockage persistant adapté à ton cloud (EBS, GCP Persistent Disks, Azure Managed Disks)
- **Domaine** : Remplace `roletask.example.com` par ton domaine réel
- **Certificats SSL** : Configure cert-manager avec Let's Encrypt pour HTTPS