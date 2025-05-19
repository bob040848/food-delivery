// server/src/controllers/food/get-all-food-categories.ts

import { Request, Response } from "express";
import { FoodCategoryModel } from "../../models";

export const getAllFoodCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await FoodCategoryModel.find().sort({ categoryName: 1 });
    res.status(200).send(categories);
  } catch (error) {
    console.error("Error fetching food categories:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};
