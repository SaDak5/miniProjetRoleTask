#!/bin/bash

# Script de déploiement Docker pour RoleTask

echo "🚀 Déploiement RoleTask avec Docker..."

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down

# Supprimer les images anciennes
echo "🗑️  Suppression des anciennes images..."
docker rmi roletask-backend roletask-frontend 2>/dev/null || true

# Construire les images
echo "🔨 Construction des images Docker..."
docker-compose build

# Démarrer les services
echo "▶️  Démarrage des services..."
docker-compose up -d

# Afficher le statut
echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "📊 Statut des conteneurs:"
docker-compose ps
echo ""
echo "🌐 Accès à l'application:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:8094"
echo "   MySQL: localhost:3306"
echo ""
echo "📝 Logs: docker-compose logs -f"
