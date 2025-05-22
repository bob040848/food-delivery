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
      return res.redirect(
        `${process.env.FRONTEND_ENDPOINT}/auth/reset-password?error=invalid-token`
      );
    }

    const user = await UserModel.findById(decodedToken.userId);

    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_ENDPOINT}/auth/reset-password?error=user-not-found`
      );
    }

    res.redirect(
      `${process.env.FRONTEND_ENDPOINT}/auth/reset-password?token=${token}`
    );
  } catch (error) {
    console.error("Token verification error:", error);
    res.redirect(
      `${process.env.FRONTEND_ENDPOINT}/auth/reset-password?error=expired-token`
    );
  }
};
