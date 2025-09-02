import {v4 as uuidv4} from 'uuid';

import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});