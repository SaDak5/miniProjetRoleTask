# 📦 Guide de Déploiement Docker - RoleTask

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Installation locale avec Docker](#installation-locale)
3. [Déploiement sur le Cloud](#déploiement-cloud)
4. [Commandes utiles](#commandes-utiles)
5. [Dépannage](#dépannage)
6. [Déploiement Kubernetes](#déploiement-kubernetes)

---

## ☸️ Déploiement Kubernetes

Le manifeste complet et les commandes d'application sont maintenant documentés dans [KUBERNETES_DEPLOYMENT.md](KUBERNETES_DEPLOYMENT.md).

Le point important à retenir est que le frontend utilise `/api` en production, ce qui permet un routage propre via Ingress ou Nginx sans URL codée en dur.

---

## 🔧 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Docker** : [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- **Docker Compose** : Inclus dans Docker Desktop
- **Git** : Pour cloner et gérer votre repository

### ✅ Vérifier l'installation

```bash
docker --version
docker-compose --version
```

---

## 🚀 Installation locale avec Docker

### Étape 1 : Cloner le repository

```bash
git clone <votre-repository>
cd miniProjetRoleTask
```

### Étape 2 : Configurer les variables d'environnement

Le fichier `.env` contient déjà les valeurs par défaut. Pour modifier :

```bash
# Sur Linux/Mac
nano .env

# Sur Windows
notepad .env
```

### Étape 3 : Démarrer l'application

**Sur Linux/Mac :**

```bash
chmod +x deploy.sh
./deploy.sh
```

**Sur Windows (PowerShell) :**

```powershell
.\deploy.bat
```

**Ou avec Docker Compose directement :**

```bash
docker-compose up -d
```

### Étape 4 : Accéder à l'application

- **Frontend** : http://localhost
- **Backend API** : http://localhost:8094
- **MySQL** : localhost:3306

### Étape 5 : Vérifier les logs

```bash
# Tous les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Étape 6 : Arrêter l'application

```bash
docker-compose down
```

---

## ☁️ Déploiement sur le Cloud

### Option 1 : Amazon ECS (AWS)

#### 1️⃣ Préparer l'ECR (Elastic Container Registry)

```bash
# Connectez-vous à AWS CLI
aws configure

# Créer un repository ECR
aws ecr create-repository --repository-name roletask-backend --region us-east-1
aws ecr create-repository --repository-name roletask-frontend --region us-east-1

# Obtenir le token de connexion
aws ecr get-login-password --region us-east-1 | \
docker login --username AWS --password-stdin <votre-compte-aws>.dkr.ecr.us-east-1.amazonaws.com
```

#### 2️⃣ Taguer et pusher les images

```bash
# Backend
docker build -t roletask-backend ./RoleTask
docker tag roletask-backend:latest <votre-compte-aws>.dkr.ecr.us-east-1.amazonaws.com/roletask-backend:latest
docker push <votre-compte-aws>.dkr.ecr.us-east-1.amazonaws.com/roletask-backend:latest

# Frontend
docker build -t roletask-frontend ./roletask-frontend
docker tag roletask-frontend:latest <votre-compte-aws>.dkr.ecr.us-east-1.amazonaws.com/roletask-frontend:latest
docker push <votre-compte-aws>.dkr.ecr.us-east-1.amazonaws.com/roletask-frontend:latest
```

#### 3️⃣ Créer un cluster ECS

```bash
# Via AWS Console ou CLI
aws ecs create-cluster --cluster-name roletask-cluster
```

#### 4️⃣ Configurer RDS pour MySQL

- Allez dans AWS RDS
- Créez une instance MySQL
- Obtenez l'endpoint (ex: roletask-db.c9akciq32.us-east-1.rds.amazonaws.com)
- Notez les credentials

#### 5️⃣ Créer des Task Definitions

Créez un fichier `ecs-task-def.json` :

```json
{
  "family": "roletask-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "roletask-backend",
      "image": "<votre-compte>.dkr.ecr.us-east-1.amazonaws.com/roletask-backend:latest",
      "portMappings": [{ "containerPort": 8094 }],
      "environment": [
        {
          "name": "SPRING_DATASOURCE_URL",
          "value": "jdbc:mysql://roletask-db.c9akciq32.us-east-1.rds.amazonaws.com:3306/roletask_db"
        },
        { "name": "SPRING_DATASOURCE_USERNAME", "value": "roletask_user" },
        { "name": "SPRING_DATASOURCE_PASSWORD", "value": "your_password" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/roletask-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### 6️⃣ Déployer sur ECS

```bash
aws ecs register-task-definition --cli-input-json file://ecs-task-def.json

# Créer un service
aws ecs create-service \
  --cluster roletask-cluster \
  --service-name roletask-backend-service \
  --task-definition roletask-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}"
```

---

### Option 2 : Google Cloud Run (GCP)

#### 1️⃣ Configurer gcloud

```bash
gcloud auth login
gcloud config set project <votre-projet-id>
```

#### 2️⃣ Pusher les images vers Container Registry

```bash
# Backend
docker build -t roletask-backend ./RoleTask
docker tag roletask-backend gcr.io/<projet-id>/roletask-backend
docker push gcr.io/<projet-id>/roletask-backend

# Frontend
docker build -t roletask-frontend ./roletask-frontend
docker tag roletask-frontend gcr.io/<projet-id>/roletask-frontend
docker push gcr.io/<projet-id>/roletask-frontend
```

#### 3️⃣ Déployer sur Cloud Run

```bash
# Backend
gcloud run deploy roletask-backend \
  --image gcr.io/<projet-id>/roletask-backend \
  --platform managed \
  --region us-central1 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars SPRING_DATASOURCE_URL=jdbc:mysql://cloudsql-connection-name/roletask_db

# Frontend
gcloud run deploy roletask-frontend \
  --image gcr.io/<projet-id>/roletask-frontend \
  --platform managed \
  --region us-central1
```

---

### Option 3 : Azure Container Instances (ACI)

#### 1️⃣ Créer un Azure Container Registry

```bash
az acr create --resource-group myResourceGroup --name myregistry --sku Basic
```

#### 2️⃣ Pusher les images

```bash
# Connectez-vous au registry
az acr login --name myregistry

# Backend
docker build -t roletask-backend ./RoleTask
docker tag roletask-backend myregistry.azurecr.io/roletask-backend:v1
docker push myregistry.azurecr.io/roletask-backend:v1

# Frontend
docker build -t roletask-frontend ./roletask-frontend
docker tag roletask-frontend myregistry.azurecr.io/roletask-frontend:v1
docker push myregistry.azurecr.io/roletask-frontend:v1
```

#### 3️⃣ Créer une instance de conteneur

```bash
az container create \
  --resource-group myResourceGroup \
  --name roletask-backend \
  --image myregistry.azurecr.io/roletask-backend:v1 \
  --cpu 1 \
  --memory 1 \
  --registry-login-server myregistry.azurecr.io \
  --registry-username <username> \
  --registry-password <password> \
  --ports 8094 \
  --environment-variables \
    SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/roletask_db" \
    SPRING_DATASOURCE_USERNAME="roletask_user" \
    SPRING_DATASOURCE_PASSWORD="password"
```

---

### Option 4 : Docker Swarm (Production simple)

#### 1️⃣ Initialiser Docker Swarm

```bash
docker swarm init
```

#### 2️⃣ Créer un stack

Créez `docker-compose.prod.yml` :

```yaml
version: "3.8"

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - roletask-network

  backend:
    image: roletask-backend:latest
    environment:
      SPRING_DATASOURCE_URL: ${SPRING_DATASOURCE_URL}
      SPRING_DATASOURCE_USERNAME: ${SPRING_DATASOURCE_USERNAME}
      SPRING_DATASOURCE_PASSWORD: ${SPRING_DATASOURCE_PASSWORD}
    ports:
      - "8094:8094"
    depends_on:
      - mysql
    networks:
      - roletask-network
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s

  frontend:
    image: roletask-frontend:latest
    ports:
      - "80:80"
    networks:
      - roletask-network
    deploy:
      replicas: 2

volumes:
  mysql_data:

networks:
  roletask-network:
    driver: overlay
```

#### 3️⃣ Déployer le stack

```bash
docker stack deploy -c docker-compose.prod.yml roletask
```

---

## 🛠️ Commandes Utiles

```bash
# Afficher les conteneurs en cours
docker ps

# Afficher tous les conteneurs
docker ps -a

# Voir les logs d'un service
docker logs <container-id>

# Logs en temps réel
docker logs -f <container-id>

# Accéder au shell d'un conteneur
docker exec -it <container-id> /bin/bash

# Arrêter un conteneur
docker stop <container-id>

# Supprimer un conteneur
docker rm <container-id>

# Supprimer une image
docker rmi <image-id>

# Voir l'utilisation des ressources
docker stats

# Nettoyer les ressources inutilisées
docker system prune -a
```

---

## 🐛 Dépannage

### Le conteneur MySQL ne démarre pas

```bash
docker logs roletask-mysql
# Vérifier que le port 3306 est disponible
```

### Le backend ne peut pas se connecter à MySQL

```bash
# Vérifier le nom du réseau
docker network ls

# Tester la connexion
docker exec roletask-backend ping mysql
```

### Le frontend affiche une erreur 404

```bash
# Vérifier la configuration nginx.conf
docker exec roletask-frontend cat /etc/nginx/conf.d/default.conf
```

### Réinitialiser complètement

```bash
docker-compose down -v  # -v supprime aussi les volumes
docker system prune -a
docker-compose up -d
```

---

## 📞 Support

Pour plus d'informations :

- Documentation Docker : https://docs.docker.com/
- Docker Compose : https://docs.docker.com/compose/
- AWS ECS : https://docs.aws.amazon.com/ecs/
- GCP Cloud Run : https://cloud.google.com/run/docs
- Azure Container Instances : https://docs.microsoft.com/en-us/azure/container-instances/

---

**Créé pour le projet RoleTask**
