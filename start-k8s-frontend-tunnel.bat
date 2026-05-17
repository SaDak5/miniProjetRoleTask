@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo Verification pods roletask...
kubectl get pods -n roletask >nul 2>&1
if errorlevel 1 (
  echo kubectl n'arrive pas a joindre le cluster.
  echo Basculement vers le plan de secours local Docker sur le meme port 30082...
  call "%~dp0start-local-docker.bat"
  exit /b %errorlevel%
)

:loop
echo.
echo Lancement tunnel: http://127.0.0.1:30082/login
echo (laisser cette fenetre ouverte)
kubectl port-forward -n roletask svc/frontend 30082:80
if errorlevel 1 (
  echo Le tunnel Kubernetes a echoue.
  echo Basculement vers le plan de secours local Docker sur le meme port 30082...
  call "%~dp0start-local-docker.bat"
  exit /b %errorlevel%
)
echo.
echo Tunnel interrompu. Relance automatique dans 2 secondes...
timeout /t 2 /nobreak >nul
goto loop
