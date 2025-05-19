// server/src/controllers/food-order/update-food-order-status.ts

import { Request, Response } from "express";
import { FoodOrderModel } from "../../models";
import mongoose from "mongoose";

export const updateFoodOrderStatus = async (req: Request, res: Response) => {
  const { foodOrderId } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(foodOrderId)) {
    res.status(400).send({ message: "Invalid order ID" });
    return;
  }

  if (!status || !["Pending", "Canceled", "Delivered"].includes(status)) {
    res.status(400).send({
      message: "Valid status required (Pending, Canceled, or Delivered)",
    });
    return;
  }

  try {
    const order = await FoodOrderModel.findById(foodOrderId);
    if (!order) {
      res.status(404).send({ message: "Order not found" });
      return;
    }

    const updatedOrder = await FoodOrderModel.findByIdAndUpdate(
      foodOrderId,
      { status },
      { new: true }
    )
      .populate("user", "email")
      .populate("foodOrderItems.food", "foodName price");

    res.status(200).send(updatedOrder);
  } catch (error) {
    console.error("Error updating food order:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};
