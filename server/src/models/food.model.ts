import { Schema, model, Model, models } from "mongoose";

type FoodSchemaType = {
  foodName: string;
  price: number;
  image: string;
  ingredients: string;
  category: Schema.Types.ObjectId[];
};

const FoodSchema = new Schema<FoodSchemaType>({
  foodName: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  ingredients: { type: String, default: "" },
  category: [
    {
      type: Schema.Types.ObjectId,
      ref: "FoodCategory",
      required: true,
    },
  ],
});

export const FoodModel: Model<FoodSchemaType> =
  models["Food"] || model("Food", FoodSchema);
