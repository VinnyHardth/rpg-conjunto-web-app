#!/bin/bash
# 🚀 Script para resetar completamente um projeto Docker Compose
# AVISO: isso APAGA TODOS os dados persistentes (volumes, imagens, containers, networks)
# Use com cautela!

set -e  # para o script se algo der errado

# Verifica se o arquivo docker-compose.yml existe
if [ ! -f "docker-compose.yml" ]; then
  echo "❌ Nenhum arquivo docker-compose.yml encontrado no diretório atual!"
  exit 1
fi

PROJECT_NAME=$(basename "$PWD") # nome do projeto baseado na pasta atual

echo "🧨 Resetando completamente o projeto Docker Compose: $PROJECT_NAME"
echo "=============================================================="

# 1️⃣ Derruba os containers e remove volumes, networks e imagens órfãs
echo "🛑 Parando e removendo containers, volumes e redes..."
docker compose down --volumes --remove-orphans --rmi all

# 2️⃣ Remover volumes com o nome do projeto
echo "🧹 Removendo volumes relacionados ao projeto..."
docker volume ls -qf "name=${PROJECT_NAME}_" | xargs -r docker volume rm

# 3️⃣ Remover networks relacionadas ao projeto
echo "🌐 Removendo networks relacionadas..."
docker network ls -qf "name=${PROJECT_NAME}_" | xargs -r docker network rm

# 4️⃣ Remover imagens antigas (opcional, só se quiser limpar geral)
echo "🧼 Removendo imagens não utilizadas..."
docker image prune -af

# 5️⃣ Remover volumes órfãos (que não estão mais em uso)
echo "🪣 Limpando volumes órfãos..."
docker volume prune -f

# 6️⃣ Recriar tudo
echo "⚙️  Subindo containers do zero..."
docker compose up -d --build

echo "✅ Projeto $PROJECT_NAME recriado com sucesso!"
echo "=============================================================="
docker compose ps
