// server/src/controllers/food/delete-food.ts

import { Request, Response } from "express";
import { FoodModel } from "../../models";
import mongoose from "mongoose";

export const deleteFood = async (req: Request, res: Response) => {
  const { foodId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(foodId)) {
    res.status(400).send({ message: "Invalid food ID" });
    return;
  }

  try {
    const food = await FoodModel.findById(foodId);
    if (!food) {
      res.status(404).send({ message: "Food not found" });
      return;
    }

    await FoodModel.findByIdAndDelete(foodId);
    res.status(200).send({ message: "Food deleted successfully" });
  } catch (error) {
    console.error("Error deleting food:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};
