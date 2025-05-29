import { Response } from "express";
import { UserModel } from "../../models";
import { AuthRequest } from "../../middlewares/auth";

export const getAllUsersController = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const users = await UserModel.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      users,
      total: users.length,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch users",
    });
  }
};
