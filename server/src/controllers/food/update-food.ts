// server/src/controllers/food/update-food.ts

import { Request, Response } from "express";
import { FoodModel, FoodCategoryModel } from "../../models";
import mongoose from "mongoose";

export const updateFood = async (req: Request, res: Response) => {
  const { foodId } = req.params;
  const { foodName, price, image, ingredients, category } = req.body;

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

    if (price !== undefined && (isNaN(price) || price < 0)) {
      res.status(400).send({ message: "Price must be a positive number" });
      return;
    }

    if (ingredients !== undefined && ingredients.trim() === "") {
      res.status(400).send({ message: "Ingredients cannot be empty" });
      return;
    }

    if (image !== undefined && image.trim() === "") {
      res.status(400).send({ message: "Image URL cannot be empty" });
      return;
    }

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        res.status(400).send({ message: "Invalid category ID" });
        return;
      }

      const categoryExists = await FoodCategoryModel.findById(category);
      if (!categoryExists) {
        res.status(404).send({ message: "Category not found" });
        return;
      }
    }

    const updateData: any = {};
    if (foodName !== undefined && foodName.trim() !== "") {
      updateData.foodName = foodName.trim();
    }
    if (price !== undefined) {
      updateData.price = price;
    }
    if (image !== undefined && image.trim() !== "") {
      updateData.image = image.trim();
    }
    if (ingredients !== undefined && ingredients.trim() !== "") {
      updateData.ingredients = ingredients.trim();
    }
    if (category) {
      updateData.category = [category];
    }

    console.log(`Updating food ${foodId}: ${JSON.stringify(updateData)}`);

    const updatedFood = await FoodModel.findByIdAndUpdate(foodId, updateData, {
      new: true,
      runValidators: true,
    }).populate("category", "categoryName");

    if (!updatedFood) {
      res.status(404).send({ message: "Food not found after update" });
      return;
    }

    res.status(200).send({
      message: "Food updated successfully",
      food: updatedFood,
    });
  } catch (error) {
    console.error("Error updating food:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};
