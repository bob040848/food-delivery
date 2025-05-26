// server/src/controllers/food/create-food-category.ts

import { Request, Response } from "express";
import { FoodCategoryModel } from "../../models";

export const createFoodCategory = async (req: Request, res: Response) => {
  const { categoryName } = req.body;

  if (!categoryName) {
    res.status(400).send({ message: "Category name is required" });
    return;
  }

  try {
    const existingCategory = await FoodCategoryModel.findOne({ categoryName });
    if (existingCategory) {
      res.status(409).send({ message: "Category already exists" });
      return;
    }

    const newCategory = await FoodCategoryModel.create({ categoryName });
    res.status(201).send(newCategory);
    return;
  } catch (error) {
    console.error("Error creating food category:", error);
    res.status(500).send({ message: "Internal server error" });
    return;
  }
};
