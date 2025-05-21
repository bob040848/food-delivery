// server/src/controllers/auth/forgot-password.controller.ts

import { Request, Response } from "express";
import { UserModel } from "../../models";
import { generateNewToken, sendPasswordResetLink } from "../../utils";

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ message: "Email is required" });
  }

  try {
    const user = await UserModel.findOne({ email });
    
    if (!user) {
      return res.status(200).send({ 
        message: "If a user with that email exists, a password reset link has been sent" 
      });
    }

    const token = generateNewToken({
      userId: user._id,
      purpose: "password-reset"
    });

    const resetUrl = `${process.env.FRONTEND_ENDPOINT}/auth/reset-password?token=${token}`;
    
    await sendPasswordResetLink(resetUrl, email);

    return res.status(200).send({ 
      message: "If a user with that email exists, a password reset link has been sent" 
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};