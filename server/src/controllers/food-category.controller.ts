// server/src/controllers/food/food-category.controller.ts

import { Request, Response } from "express";
import { FoodCategoryModel } from "../../models";

// Get all food categories
export const getAllFoodCategories = async (req: Request, res: Response) => {
  try {
    const categories = await FoodCategoryModel.find().sort({ categoryName: 1 });
    res.status(200).send(categories);
  } catch (error) {
    console.error("Error fetching food categories:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

// Create a new food category
export const createFoodCategory = async (req: Request, res: Response) => {
  const { categoryName } = req.body;

  if (!categoryName) {
    return res.status(400).send({ message: "Category name is required" });
  }

  try {
    // Check if category already exists
    const existingCategory = await FoodCategoryModel.findOne({ categoryName });
    if (existingCategory) {
      return res.status(409).send({ message: "Category already exists" });
    }

    const newCategory = await FoodCategoryModel.create({ categoryName });
    res.status(201).send(newCategory);
  } catch (error) {
    console.error("Error creating food category:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

// Update a food category
export const updateFoodCategory = async (req: Request, res: Response) => {
  const { foodCategoryId } = req.params;
  const { categoryName } = req.body;

  if (!categoryName) {
    return res.status(400).send({ message: "Category name is required" });
  }

  try {
    // Check if category exists
    const category = await FoodCategoryModel.findById(foodCategoryId);
    if (!category) {
      return res.status(404).send({ message: "Category not found" });
    }

    // Check if the new name conflicts with another category
    const existingCategory = await FoodCategoryModel.findOne({
      categoryName,
      _id: { $ne: foodCategoryId },
    });

    if (existingCategory) {
      return res.status(409).send({ message: "Category name already in use" });
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

// Delete a food category
export const deleteFoodCategory = async (req: Request, res: Response) => {
  const { foodCategoryId } = req.params;

  try {
    // Check if category exists
    const category = await FoodCategoryModel.findById(foodCategoryId);
    if (!category) {
      return res.status(404).send({ message: "Category not found" });
    }

    // Delete the category
    await FoodCategoryModel.findByIdAndDelete(foodCategoryId);
    res.status(200).send({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting food category:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};
