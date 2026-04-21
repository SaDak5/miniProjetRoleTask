# 🚀 Quick Start - Déploiement Docker en 5 minutes

## Étape 1 : Installer Docker Desktop

- Téléchargez depuis : https://www.docker.com/products/docker-desktop
- Installez et redémarrez votre ordinateur
- Vérifiez : `docker --version`

## Étape 2 : Ouvrir PowerShell dans le dossier du projet

```powershell
cd C:\Users\dghai\ITBS\2eme annee\miniProjetRoleTask
```

## Étape 3 : Démarrer les conteneurs (2 minutes)

```powershell
# Option A : Utiliser le script (Windows)
.\deploy.bat

# Option B : Utiliser docker-compose directement
docker-compose up -d
```

**Attendez 1-2 minutes le temps que les images se construisent...**

## Étape 4 : Vérifier que tout fonctionne

```powershell
# Voir l'état des conteneurs
docker-compose ps

# Voir les logs
docker-compose logs -f
```

## Étape 5 : Accéder à l'application

Ouvrez votre navigateur :

| Service     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost      |
| Backend API | http://localhost:8094 |
| MySQL       | localhost:3306        |

---

## 🛑 Arrêter l'application

```powershell
docker-compose down
```

---

## 📊 Vérifier les logs

```powershell
# Tous les logs
docker-compose logs -f

# Seulement le backend
docker-compose logs -f backend

# Seulement le MySQL
docker-compose logs -f mysql
```

---

## ⚠️ Problèmes courants

### Port 80 déjà utilisé

```powershell
# Sur Windows, trouvez quel processus utilise le port 80
Get-NetTCPConnection -LocalPort 80

# Arrêtez le service (si c'est IIS)
Stop-Service -Name W3SVC
```

### Container ne démarre pas

```powershell
# Vérifier les logs
docker-compose logs mysql
docker-compose logs backend

# Redémarrer
docker-compose down
docker-compose up -d
```

---

## 🔧 Modification des variables d'environnement

Modifiez le fichier `.env` pour changer :

- Mot de passe MySQL
- Ports
- Autres configurations

Puis redémarrez :

```powershell
docker-compose down
docker-compose up -d
```

---

## ☁️ Prochaine étape : Déployer sur le Cloud

Consultez `DOCKER_DEPLOYMENT.md` pour :

- AWS ECS
- Google Cloud Run
- Azure Container Instances
- Docker Swarm

---

**C'est tout ! 🎉**
