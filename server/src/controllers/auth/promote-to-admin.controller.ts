//server/src/controllers/auth/promote-to-admin.controller.ts
import { Response } from "express";
import { UserModel } from "../../models";
import { AuthRequest } from "../../middlewares/auth";
import { UserRoleEnum } from "../../models/user.model";

export const promoteToAdminController = async (
  req: AuthRequest,
  res: Response
) => {
  const { userId } = req.params;

  if (!userId) {
    res.status(400).send({ message: "User ID is required" });
    return;
  }

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    user.role = UserRoleEnum.ADMIN;
    await user.save();

    res.status(200).send({
      message: "User promoted to admin successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
    return;
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    res.status(500).send({ message: "Internal server error" });
    return;
  }
};
