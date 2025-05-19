// server/src/controllers/food/get-foods-by-category.ts

import { Request, Response } from "express";
import { FoodModel, FoodCategoryModel } from "../../models";
import mongoose from "mongoose";

export const getFoodsByCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    res.status(400).send({ message: "Invalid category ID" });
    return;
  }

  try {
    const category = await FoodCategoryModel.findById(categoryId);
    if (!category) {
      res.status(404).send({ message: "Category not found" });
      return;
    }

    const foods = await FoodModel.find({ category: categoryId })
      .populate("category", "categoryName")
      .sort({ foodName: 1 });

    res.status(200).send(foods);
  } catch (error) {
    console.error("Error fetching foods by category:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};
