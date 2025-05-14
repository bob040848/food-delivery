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

const FoodOrderSchema = new Schema<FoodOrderSchemaType>({
  user: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  totalPrice: {
    type: Number,
  },
  foodOrderItems: [
    {
      type: Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
  ],
  status: {
    type: String,
    enum: Object.values(FoodOrderStatusEnum),
    default: FoodOrderStatusEnum.PENDING,
  },
});

export const FoodOrderModel: Model<FoodOrderSchemaType> =
  models["FoodOrder"] || model("FoodOrder", FoodOrderSchema);
