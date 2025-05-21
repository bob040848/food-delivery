// server/src/controllers/auth/verify-reset-password-request.controller.ts

import { Request, Response } from "express";
import { UserModel } from "../../models";
import { verifyToken } from "../../utils";

export const verifyResetPasswordRequestController = async (
  req: Request,
  res: Response
) => {
  const token = String(req.query.token);

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

    res.status(200).send({
      message: "Token verified. Please reset your password.",
      token,
    });

    res.redirect(`${process.env.FRONTEND_ENDPOINT}/reset-password?token=${token}`);
  } catch (error) {
    console.error("Verification error:", error);
    res.status(401).send({ message: "Invalid or expired token" });
  }
};
