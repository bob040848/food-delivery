//server/src/models/food-order.model.ts
import { Schema, model, Model, models } from "mongoose";

enum FoodOrderStatusEnum {
  PENDING = "Pending",
  CANCELED = "Canceled",
  DELIVERED = "Delivered",
}

type FoodOrderSchemaType = {
  user: Schema.Types.ObjectId[];
  totalPrice: number;
  foodOrderItems: Schema.Types.ObjectId[];
  status: FoodOrderStatusEnum;
};

const FoodOrderItemSchema = new Schema(
  {
    food: { type: Schema.Types.ObjectId, ref: "Food", required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const FoodOrderSchema = new Schema<FoodOrderSchemaType>(
  {
    user: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    foodOrderItems: [{ type: [FoodOrderItemSchema], required: true }],
    status: {
      type: String,
      enum: Object.values(FoodOrderStatusEnum),
      default: FoodOrderStatusEnum.PENDING,
    },
  },
  { timestamps: true }
);

export const FoodOrderModel: Model<FoodOrderSchemaType> =
  models["FoodOrder"] || model("FoodOrder", FoodOrderSchema);
