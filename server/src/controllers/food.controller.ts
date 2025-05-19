// server/src/controllers/food/food.controller.ts

import { Request, Response } from "express";
import { FoodModel, FoodCategoryModel } from "../../models";
import mongoose from "mongoose";

// Get all foods
export const getAllFoods = async (req: Request, res: Response) => {
  try {
    const foods = await FoodModel.find()
      .populate("category", "categoryName")
      .sort({ foodName: 1 });
    res.status(200).send(foods);
  } catch (error) {
    console.error("Error fetching foods:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

// Get foods by category ID
export const getFoodsByCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).send({ message: "Invalid category ID" });
  }

  try {
    // Check if category exists
    const category = await FoodCategoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).send({ message: "Category not found" });
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

// Create a new food
export const createFood = async (req: Request, res: Response) => {
  const { foodName, price, image, ingredients, category } = req.body;

  if (!foodName || !price || !image || !ingredients || !category) {
    return res.status(400).send({ message: "All fields are required" });
  }

  try {
    // Validate category ID
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).send({ message: "Invalid category ID" });
    }

    // Check if category exists
    const categoryExists = await FoodCategoryModel.findById(category);
    if (!categoryExists) {
      return res.status(404).send({ message: "Category not found" });
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

// Update a food
// server/src/controllers/food/update-food.ts

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
    if (foodName) updateData.foodName = foodName;
    if (price !== undefined) updateData.price = price;
    if (image) updateData.image = image;
    if (ingredients) updateData.ingredients = ingredients;
    if (category) updateData.category = [category];

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

// Delete a food
export const deleteFood = async (req: Request, res: Response) => {
  const { foodId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(foodId)) {
    return res.status(400).send({ message: "Invalid food ID" });
  }

  try {
    // Check if food exists
    const food = await FoodModel.findById(foodId);
    if (!food) {
      return res.status(404).send({ message: "Food not found" });
    }

    await FoodModel.findByIdAndDelete(foodId);
    res.status(200).send({ message: "Food deleted successfully" });
  } catch (error) {
    console.error("Error deleting food:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};
