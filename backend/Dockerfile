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

# arquivos de deps do backend
COPY backend/package*.json ./

# instalando dependências do backend e utilitário wait-port
RUN npm install && npm install -g wait-port

# instala o pacote shared empacotado na etapa anterior
COPY --from=shared-builder /shared/*.tgz /tmp/shared.tgz
RUN npm install /tmp/shared.tgz && rm /tmp/shared.tgz

# copia o código do backend
COPY backend/ .

# define ambiente de execução como produção apenas após instalar deps de build
ENV NODE_ENV=production

# gera os artefatos do Prisma
RUN npx prisma generate

EXPOSE 3000

# roda migrate + seed e inicia o servidor (expondo logs no stdout)
CMD ["sh", "-c", "wait-port mysql:3306 && npx prisma migrate deploy && npm run seed && npm run release"]
