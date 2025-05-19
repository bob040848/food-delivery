// server/src/controllers/food-order/get-all-food-orders.ts

import { Request, Response } from "express";
import { FoodOrderModel } from "../../models";

export const getAllFoodOrders = async (req: Request, res: Response) => {
  try {
    const orders = await FoodOrderModel.find()
      .populate("user", "email")
      .populate("foodOrderItems.food", "foodName price")
      .sort({ createdAt: -1 });

    res.status(200).send(orders);
  } catch (error) {
    console.error("Error fetching food orders:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};
