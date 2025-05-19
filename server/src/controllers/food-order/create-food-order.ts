// server/src/controllers/food-order/create-food-order.ts

import { Request, Response } from "express";
import { FoodOrderModel, UserModel, FoodModel } from "../../models";
import mongoose from "mongoose";

export const createFoodOrder = async (req: Request, res: Response) => {
  const { userId, foodOrderItems } = req.body;

  if (
    !userId ||
    !foodOrderItems ||
    !Array.isArray(foodOrderItems) ||
    foodOrderItems.length === 0
  ) {
    res
      .status(400)
      .send({ message: "User ID and food order items are required" });
    return;
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).send({ message: "Invalid user ID" });
      return;
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    let totalPrice = 0;
    const validatedItems = [];

    for (const item of foodOrderItems) {
      if (!item.food || !item.quantity || item.quantity <= 0) {
        res.status(400).send({
          message: "Each order item must have a food ID and quantity",
        });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(item.food)) {
        res.status(400).send({ message: "Invalid food ID" });
        return;
      }

      const food = await FoodModel.findById(item.food);
      if (!food) {
        res
          .status(404)
          .send({ message: `Food with ID ${item.food} not found` });
        return;
      }

      totalPrice += food.price * item.quantity;
      validatedItems.push({
        food: item.food,
        quantity: item.quantity,
      });
    }

    const newOrder = await FoodOrderModel.create({
      user: [userId],
      totalPrice,
      foodOrderItems: validatedItems,
      status: "Pending",
    });

    await UserModel.findByIdAndUpdate(userId, {
      $push: { orderedFoods: newOrder._id },
    });

    const populatedOrder = await FoodOrderModel.findById(newOrder._id)
      .populate("user", "email")
      .populate("foodOrderItems.food", "foodName price");

    res.status(201).send(populatedOrder);
  } catch (error) {
    console.error("Error creating food order:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};
