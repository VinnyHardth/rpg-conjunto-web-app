FROM node:22-alpine AS shared-builder

WORKDIR /shared

# instala dependências do pacote compartilhado
COPY shared/package*.json ./
RUN npm install

# compila e empacota o shared
COPY shared/ .
RUN npm run build && npm pack

# --- imagem final -----------------------------------------------------------
FROM node:22-alpine

WORKDIR /app

# instala dependências do frontend
COPY frontend/package*.json ./
RUN npm install

# instala o pacote shared empacotado
COPY --from=shared-builder /shared/*.tgz /tmp/shared.tgz
RUN npm install /tmp/shared.tgz && rm /tmp/shared.tgz

# copia o código do frontend
COPY frontend/ .

# define ambiente de execução como produção após instalar dependências necessárias para o build
ENV NODE_ENV=production

EXPOSE 4000

ENV HOST 0.0.0.0
CMD ["npm", "run", "release"]
