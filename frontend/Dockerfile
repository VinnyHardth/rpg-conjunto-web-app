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

# prepara variáveis para evitar prompts
ENV NODE_ENV=development

# instala dependências do frontend
COPY frontend/package*.json ./
RUN npm install

# instala o pacote shared empacotado
COPY --from=shared-builder /shared/*.tgz /tmp/shared.tgz
RUN npm install /tmp/shared.tgz && rm /tmp/shared.tgz

# copia o código do frontend
COPY frontend/ .

EXPOSE 4000

CMD ["npm", "run", "dev"]
