// server/src/controllers/food/get-all-foods.ts

import { Request, Response } from "express";
import { FoodModel } from "../../models";

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
