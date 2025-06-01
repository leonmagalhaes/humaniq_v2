#!/usr/bin/env bash

# Navega para o diretório do script
cd "$(dirname "$0")"

echo "🚀 Iniciando o projeto HUMANIQ..."

# Constrói e inicia os contêineres
docker compose build --pull
docker compose up -d

echo ""
echo "✅ Serviços iniciados com sucesso!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:5000"
echo ""
echo "💾 Para inicializar o banco de dados, execute:"
echo "docker compose exec backend python seed.py"
echo ""
echo "⏹️ Para parar os serviços, execute:"
echo "docker compose down"
