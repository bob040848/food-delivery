// server/src/controllers/auth/reset-password.controller.ts

import { Request, Response } from "express";
import { UserModel } from "../../models";
import { encryptHash, verifyToken } from "../../utils";

export const resetPasswordController = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).send({ message: "Token and new password are required" });
    return;
  }

  try {
    const decodedToken = verifyToken(token) as {
      userId: string;
      purpose: string;
    };

    if (
      !decodedToken ||
      !decodedToken.userId ||
      decodedToken.purpose !== "password-reset"
    ) {
      res.status(400).send({ message: "Invalid token" });
      return;
    }

    const user = await UserModel.findById(decodedToken.userId);

    if (!user) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    const hashedPassword = encryptHash(newPassword);

    await UserModel.findByIdAndUpdate(decodedToken.userId, {
      password: hashedPassword,
    });

    res.status(200).send({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};
