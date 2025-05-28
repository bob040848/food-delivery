// server/src/controllers/food-order/get-food-orders-by-user.ts
import { Request, Response } from "express";
import { FoodOrderModel, UserModel } from "../../models";
import mongoose from "mongoose";

export const getFoodOrdersByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).send({ message: "Invalid user ID" });
    return;
  }

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    const orders = await FoodOrderModel.find({ user: userId })
      .populate("user", "email")
      .populate("foodOrderItems.food", "foodName price")
      .sort({ createdAt: -1 });

    res.status(200).send(orders);
  } catch (error) {
    console.error("Error fetching user food orders:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};
