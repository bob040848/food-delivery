// server/src/controllers/food/get-food-by-id.ts
import { Request, Response } from "express";
import { FoodModel } from "../../models";
import mongoose from "mongoose";

export const getFoodById = async (req: Request, res: Response) => {
  try {
    const { foodId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      res.status(400).json({
        message: "Invalid food ID format",
      });
      return;
    }

    const food = await FoodModel.findById(foodId).populate(
      "category",
      "categoryName"
    );

    if (!food) {
      res.status(404).json({
        message: "Food not found",
      });
      return;
    }

    res.status(200).json(food);
    return;
  } catch (error) {
    console.error("Get food by ID error:", error);
    res.status(500).json({
      message: "Failed to retrieve food",
    });
    return;
  }
};
