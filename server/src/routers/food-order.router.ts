// server/src/routers/food-order.router.ts
import { Router } from "express";
import {
  createFoodOrder,
  getAllFoodOrders,
  getFoodOrdersByUser,
  updateFoodOrderStatus,
} from "../controllers";
import { authenticateUser, authorizeAdmin } from "../middlewares";

export const foodOrderRouter = Router();

foodOrderRouter.post("/", authenticateUser, createFoodOrder);
foodOrderRouter.get("/", authenticateUser, authorizeAdmin, getAllFoodOrders);
foodOrderRouter.get("/:userId", authenticateUser, getFoodOrdersByUser);
foodOrderRouter.patch(
  "/:foodOrderId",
  authenticateUser,
  authorizeAdmin,
  updateFoodOrderStatus
);
