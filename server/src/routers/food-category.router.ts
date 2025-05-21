//server/src/routers/food-category.router.ts
import { Router } from "express";
import {
  getAllFoodCategories,
  createFoodCategory,
  updateFoodCategory,
  deleteFoodCategory,
} from "../controllers";
import { authenticateUser, authorizeAdmin } from "../middlewares";
export const foodCategoryRouter = Router();

// foodCategoryRouter.route("/").get(getAllFoodCategories).post();
foodCategoryRouter.get("/", getAllFoodCategories);
foodCategoryRouter.post(
  "/",
  authenticateUser,
  authorizeAdmin,
  createFoodCategory
);
foodCategoryRouter.patch(
  "/:foodCategoryId",
  authenticateUser,
  authorizeAdmin,
  updateFoodCategory
);
foodCategoryRouter.delete(
  "/:foodCategoryId",
  authenticateUser,
  authorizeAdmin,
  deleteFoodCategory
);
