#!/bin/bash
# Remove todas as imagens exceto MySQL, Nginx e phpMyAdmin

# Lista de imagens que queremos manter
KEEP_IMAGES=("mysql" "nginx" "phpmyadmin")

# Obtém todas as imagens locais
ALL_IMAGES=$(docker images --format "{{.Repository}}:{{.Tag}}")

for IMAGE in $ALL_IMAGES; do
  KEEP=false
  for KEEP_NAME in "${KEEP_IMAGES[@]}"; do
    if [[ "$IMAGE" == *"$KEEP_NAME"* ]]; then
      KEEP=true
      break
    fi
  done
  if [ "$KEEP" = false ]; then
    echo "🧹 Removing image: $IMAGE"
    docker rmi -f "$IMAGE" 2>/dev/null
  fi
done

# Remove containers e volumes órfãos (sem afetar os em uso)
docker container prune -f
docker volume prune -f
docker network prune -f
