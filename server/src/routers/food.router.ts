// server/src/routers/food.router.ts
import { Router } from "express";
import {
  getAllFoods,
  getFoodsByCategory,
  createFood,
  updateFood,
  deleteFood,
  getFoodById,
} from "../controllers";
import { authenticateUser, authorizeAdmin } from "../middlewares";
export const foodRouter = Router();

foodRouter.get("/category/:categoryId", getFoodsByCategory);
foodRouter.get("/:foodId", getFoodById);
foodRouter.get("/", getAllFoods);

foodRouter.post("/", authenticateUser, authorizeAdmin, createFood);
foodRouter.patch("/:foodId", authenticateUser, authorizeAdmin, updateFood);
foodRouter.delete("/:foodId", authenticateUser, authorizeAdmin, deleteFood);
