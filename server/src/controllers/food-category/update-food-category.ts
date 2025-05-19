// server/src/controllers/food/update-food-category.ts

import { Request, Response } from "express";
import { FoodCategoryModel } from "../../models";

export const updateFoodCategory = async (req: Request, res: Response) => {
  const { foodCategoryId } = req.params;
  const { categoryName } = req.body;

  if (!categoryName) {
    res.status(400).send({ message: "Category name is required" });
  }

  try {
    const category = await FoodCategoryModel.findById(foodCategoryId);
    if (!category) {
      res.status(404).send({ message: "Category not found" });
    }

    const existingCategory = await FoodCategoryModel.findOne({
      categoryName,
      _id: { $ne: foodCategoryId },
    });

    if (existingCategory) {
      res.status(409).send({ message: "Category name already in use" });
    }

    const updatedCategory = await FoodCategoryModel.findByIdAndUpdate(
      foodCategoryId,
      { categoryName },
      { new: true }
    );

    res.status(200).send(updatedCategory);
  } catch (error) {
    console.error("Error updating food category:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};
