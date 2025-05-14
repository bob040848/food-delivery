import express from "express";
import { configDotenv } from "dotenv";
import { authRouter } from "./routers";
import { connectDatabase } from "./database";

const app = express();

configDotenv();
connectDatabase();

const port = 8000;

app.use(express.json());

app.use("/auth", authRouter);

app.listen(port, () => console.log(`http://localhost:${port}`));
