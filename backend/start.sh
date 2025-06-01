#!/bin/bash

# Script para iniciar o backend do HUMANIQ

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "Docker não está instalado. Instalando..."
    sudo apt-get update
    sudo apt-get install -y docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
fi

# Construir a imagem Docker
echo "Construindo a imagem Docker do backend..."
docker build -t humaniq-backend .

# Verificar se já existe um container em execução
if docker ps -a | grep -q humaniq-backend; then
    echo "Parando e removendo container existente..."
    docker stop humaniq-backend
    docker rm humaniq-backend
fi

# Iniciar o container
echo "Iniciando o container do backend..."
docker run -d --name humaniq-backend -p 5000:5000 humaniq-backend

echo "Backend HUMANIQ iniciado com sucesso!"
echo "API disponível em: http://localhost:5000/api"
