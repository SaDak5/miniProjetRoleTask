@echo off
REM Script de déploiement Docker pour RoleTask (Windows)

echo 🚀 Deploiement RoleTask avec Docker...

REM Verifier que Docker est installe
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker n'est pas installe
    exit /b 1
)

docker-compose --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker Compose n'est pas installe
    exit /b 1
)

REM Arreter les conteneurs existants
echo 🛑 Arret des conteneurs existants...
docker-compose down

REM Supprimer les images anciennes
echo 🗑️ Suppression des anciennes images...
docker rmi roletask-backend roletask-frontend 2>nul

REM Construire les images
echo 🔨 Construction des images Docker...
docker-compose build

REM Demarrer les services
echo ▶️ Demarrage des services...
docker-compose up -d

REM Afficher le statut
echo.
echo ✅ Deploiement termine!
echo.
echo 📊 Statut des conteneurs:
docker-compose ps
echo.
echo 🌐 Acces a l'application:
echo    Frontend: http://localhost
echo    Backend API: http://localhost:8094
echo    MySQL: localhost:3306
echo.
echo 📝 Logs: docker-compose logs -f
pause
