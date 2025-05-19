// server/src/controllers/food/create-food.ts

import { Request, Response } from "express";
import { FoodModel, FoodCategoryModel } from "../../models";
import mongoose from "mongoose";

export const createFood = async (req: Request, res: Response) => {
  const { foodName, price, image, ingredients, category } = req.body;

  if (!foodName || !price || !image || !ingredients || !category) {
    res.status(400).send({ message: "All fields are required" });
    return;
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(category)) {
      res.status(400).send({ message: "Invalid category ID" });
      return;
    }

    const categoryExists = await FoodCategoryModel.findById(category);
    if (!categoryExists) {
      res.status(404).send({ message: "Category not found" });
      return;
    }

    const newFood = await FoodModel.create({
      foodName,
      price,
      image,
      ingredients,
      category: [category],
    });

    const populatedFood = await FoodModel.findById(newFood._id).populate(
      "category",
      "categoryName"
    );

    res.status(201).send(populatedFood);
  } catch (error) {
    console.error("Error creating food:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};
