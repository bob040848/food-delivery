//server/src/routers/food-category.router.ts
import { Router } from "express";
import {
  getAllFoodCategories,
  createFoodCategory,
  updateFoodCategory,
  deleteFoodCategory,
} from "../controllers";
export const foodCategoryRouter = Router();

// foodCategoryRouter.route("/").get(getAllFoodCategories).post();
foodCategoryRouter.get("/all", getAllFoodCategories);
foodCategoryRouter.post("/create", createFoodCategory);
foodCategoryRouter.patch("/:foodCategoryId", updateFoodCategory);
foodCategoryRouter.delete("/:foodCategoryId", deleteFoodCategory);
