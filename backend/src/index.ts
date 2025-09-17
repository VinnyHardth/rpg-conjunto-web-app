import {v4 as uuidv4, v1} from 'uuid';

import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import swaggerUi from 'swagger-ui-express';

import v1Router from "./router/v1Router"
import swaggerFile from './swagger-output.json';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use("/test", (req, res) => {
    res.json({ message: "API is working!", uuidv1: v1(), uuidv4: uuidv4() })
});
app.use(v1Router);


app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api`);
});