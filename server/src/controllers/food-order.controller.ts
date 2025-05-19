// server/src/controllers/food/food-order.controller.ts

import { Request, Response } from "express";
import { FoodOrderModel, UserModel, FoodModel } from "../../models";
import mongoose from "mongoose";

// Create a new food order
export const createFoodOrder = async (req: Request, res: Response) => {
  const { userId, foodOrderItems } = req.body;

  if (
    !userId ||
    !foodOrderItems ||
    !Array.isArray(foodOrderItems) ||
    foodOrderItems.length === 0
  ) {
    return res
      .status(400)
      .send({ message: "User ID and food order items are required" });
  }

  try {
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({ message: "Invalid user ID" });
    }

    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Validate and calculate total price
    let totalPrice = 0;
    const validatedItems = [];

    for (const item of foodOrderItems) {
      if (!item.food || !item.quantity || item.quantity <= 0) {
        return res
          .status(400)
          .send({
            message: "Each order item must have a food ID and quantity",
          });
      }

      if (!mongoose.Types.ObjectId.isValid(item.food)) {
        return res.status(400).send({ message: "Invalid food ID" });
      }

      const food = await FoodModel.findById(item.food);
      if (!food) {
        return res
          .status(404)
          .send({ message: `Food with ID ${item.food} not found` });
      }

      totalPrice += food.price * item.quantity;
      validatedItems.push({
        food: item.food,
        quantity: item.quantity,
      });
    }

    // Create the order
    const newOrder = await FoodOrderModel.create({
      user: [userId],
      totalPrice,
      foodOrderItems: validatedItems,
      status: "Pending",
    });

    // Add order to user's orderedFoods
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

// Get all food orders
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

// Get food orders by user ID
export const getFoodOrdersByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: "Invalid user ID" });
  }

  try {
    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const orders = await FoodOrderModel.find({ user: userId })
      .populate("foodOrderItems.food", "foodName price")
      .sort({ createdAt: -1 });

    res.status(200).send(orders);
  } catch (error) {
    console.error("Error fetching user food orders:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

// Update food order status
export const updateFoodOrderStatus = async (req: Request, res: Response) => {
  const { foodOrderId } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(foodOrderId)) {
    return res.status(400).send({ message: "Invalid order ID" });
  }

  if (!status || !["Pending", "Canceled", "Delivered"].includes(status)) {
    return res.status(400).send({
      message: "Valid status required (Pending, Canceled, or Delivered)",
    });
  }

  try {
    // Check if order exists
    const order = await FoodOrderModel.findById(foodOrderId);
    if (!order) {
      return res.status(404).send({ message: "Order not found" });
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
