// server/src/controllers/auth/reset-password-request.controller.ts

import { Request, Response } from "express";
import { UserModel } from "../../models";
import { generateNewToken, sendPasswordResetLink } from "../../utils";

export const resetPasswordRequestController = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).send({ message: "Email is required" });
    return;
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      res
        .status(200)
        .send({ message: "If the email exists, a reset link has been sent" });
      return;
    }

    const token = generateNewToken({
      userId: user._id,
      purpose: "password-reset",
    });

    const resetLink = `${req.protocol}://${req.get(
      "host"
    )}/auth/verify-reset-password-request?token=${token}`;

    await sendPasswordResetLink(resetLink, email);

    res
      .status(200)
      .send({ message: "If the email exists, a reset link has been sent" });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};
