@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

echo [1/4] Verification Docker Desktop...
docker info >nul 2>&1
if errorlevel 1 (
  echo Docker Desktop n'est pas pret. Ouvre Docker Desktop puis relance ce script.
  exit /b 1
)

echo [2/4] Demarrage MySQL...
docker-compose up -d --build mysql
if errorlevel 1 exit /b 1

echo [3/4] Attente MySQL healthy...
set MYSQL_STATUS=
for /l %%i in (1,1,45) do (
  for /f "delims=" %%s in ('docker inspect -f "{{.State.Health.Status}}" roletask-mysql 2^>nul') do set MYSQL_STATUS=%%s
  if /i "!MYSQL_STATUS!"=="healthy" goto mysql_ok
  timeout /t 2 /nobreak >nul
)
echo MySQL n'est pas healthy apres attente. Derniers logs:
docker-compose logs mysql --tail=40
exit /b 1

:mysql_ok
echo [4/4] Demarrage backend + frontend...
docker-compose up -d --build backend frontend
if errorlevel 1 exit /b 1

echo.
echo OK - Docker local demarre.
echo Frontend local: http://localhost:30082/login
echo Backend local:  http://localhost:8094
start "" "http://localhost:30082/login"
