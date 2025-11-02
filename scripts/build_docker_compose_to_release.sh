#!/bin/bash
# 🚀 Script para construir e subir uma stack Docker Compose em modo release
# Ele usa o docker-compose padrão, mas prioriza um arquivo .env.release se existir.

set -e

# Garante que estamos na raiz do projeto com docker-compose.yml
if [ ! -f "docker-compose.yml" ]; then
  echo "❌ Nenhum arquivo docker-compose.yml encontrado no diretório atual!"
  exit 1
fi

PROJECT_NAME=$(basename "$PWD")
ENV_FILE=".env"

# Se houver um arquivo .env.release, damos preferência a ele
if [ -f ".env.release" ]; then
  ENV_FILE=".env.release"
fi

echo "🏗️  Construindo ambiente de release para o projeto: $PROJECT_NAME"
echo "📄 Usando variáveis de ambiente do arquivo: $ENV_FILE"
echo "=============================================================="

# Primeiro, certifica-se de que não existem containers antigos atrapalhando o processo
echo "🛑 Parando containers em execução..."
docker compose -f docker-compose.yml -f docker-compose.release.yml down --remove-orphans

# Em seguida, faz o build e sobe tudo em modo detached
echo "🚢 Subindo stack de release com docker compose..."
docker compose -f docker-compose.yml -f docker-compose.release.yml --env-file "$ENV_FILE" up  --build

echo "✅ Ambiente de release do $PROJECT_NAME em execução!"
docker compose -f docker-compose.yml -f docker-compose.release.yml ps
