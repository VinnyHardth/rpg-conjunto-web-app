FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install -g wait-port

COPY . .

RUN npx prisma generate

EXPOSE 3000

# roda migrate + seed e inicia o servidor
CMD wait-port mysql:3306 && npx prisma migrate dev && npm run seed && npm run dev

