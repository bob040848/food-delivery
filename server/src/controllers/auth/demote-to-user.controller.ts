//server/src/controllers/auth/demote-to-user.controller.ts
import { Response } from "express";
import { UserModel } from "../../models";
import { AuthRequest } from "../../middlewares/auth";
import { UserRoleEnum } from "../../models/user.model";

export const demoteToUserController = async (
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

    if (req.user?.userId === userId) {
      res.status(403).send({ message: "You cannot demote yourself" });
      return;
    }

    user.role = UserRoleEnum.USER;
    await user.save();

    res.status(200).send({
      message: "User demoted to regular user successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
    return;
  } catch (error) {
    console.error("Error demoting admin to user:", error);
    res.status(500).send({ message: "Internal server error" });
    return;
  }
};
