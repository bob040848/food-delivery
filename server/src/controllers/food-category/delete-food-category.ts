// server/src/controllers/food/delete-food-category.ts

import { Request, Response } from "express";
import { FoodCategoryModel } from "../../models";

export const deleteFoodCategory = async (req: Request, res: Response) => {
  const { foodCategoryId } = req.params;

  try {
    const category = await FoodCategoryModel.findById(foodCategoryId);
    if (!category) {
      res.status(404).send({ message: "Category not found" });
    }

    await FoodCategoryModel.findByIdAndDelete(foodCategoryId);
    res.status(200).send({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting food category:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};
