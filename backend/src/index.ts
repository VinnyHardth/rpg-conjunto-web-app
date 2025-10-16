import { v4 as uuidv4, v1 } from "uuid";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import http from "http";
import { Server, Socket } from "socket.io";

import v1Router from "./router/v1Router";
import swaggerFile from "./swagger-output.json";
import session from "express-session";

// Extende o tipo Request para incluir 'io'
declare module "express-serve-static-core" {
  interface Request {
    io?: Server;
  }
}

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:4000",
      "http://187.79.58.27:4000/",
      "http://192.168.1.7:4000"
    ], // frontend que está fazendo a requisição
    credentials: true // importante para cookies
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger
app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Teste de rota
app.use("/test", (req: Request, res: Response) => {
  res.json({ message: "API is working!", uuidv1: v1(), uuidv4: uuidv4() });
});

// Configuração da sessão
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: true,
    saveUninitialized: true
  })
);

// Cria o servidor HTTP e instancia o Socket.io
const server = http.createServer(app);
const allowedOrigins = (process.env.FRONTEND_ORIGINS || "http://localhost:4000")
  .split(",")
  .map((origin) => origin.trim());
const io = new Server(server, {
  path: "/socket.io/",
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Middleware para injetar io nas rotas
app.use((req: Request, res: Response, next: NextFunction) => {
  req.io = io;
  next();
});

// Rotas
app.use(v1Router);

// Socket.io: conexão
io.on("connection", (socket: Socket) => {
  console.log(`Novo cliente conectado: ${socket.id}`);

  socket.on("joinRoom", (room: string) => {
    socket.join(room);
    console.log(`Socket ${socket.id} entrou na sala ${room}`);
  });

  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

// Inicia servidor
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api`);
});
