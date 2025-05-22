// server/src/controllers/auth/forgot-password.controller.ts

import { Request, Response } from "express";
import { UserModel } from "../../models";
import { generateNewToken, sendPasswordResetLink } from "../../utils";

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).send({ message: "Email is required" });
    return;
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      res.status(200).send({
        message:
          "If a user with that email exists, a password reset link has been sent",
      });
      return;
    }

    const token = generateNewToken({
      userId: user._id,
      purpose: "password-reset",
    });

    const resetUrl = `${process.env.FRONTEND_ENDPOINT}/auth/reset-password?token=${token}`;

    await sendPasswordResetLink(resetUrl, email);

    res.status(200).send({
      message:
        "If a user with that email exists, a password reset link has been sent",
    });
    return;
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).send({ message: "Internal server error" });
    return;
  }
};
