//server/src/index.ts
import express from "express";
import { configDotenv } from "dotenv";
import {
  authRouter,
  foodCategoryRouter,
  foodRouter,
  foodOrderRouter,
  adminRouter,
} from "./routers";
import { connectDatabase } from "./database";
import cors from "cors";

const app = express();

configDotenv();
connectDatabase();

const port = 8000;

app.use(express.json());
app.use(
  cors({
    // origin: process.env.FRONTEND_ENDPOINT || "http://localhost:3000",
    // credentials: true,
    // methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    // allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/food", foodRouter);
app.use("/food-category", foodCategoryRouter);
app.use("/food-order", foodOrderRouter);

app.listen(port, () => console.log(`http://localhost:${port}`));
