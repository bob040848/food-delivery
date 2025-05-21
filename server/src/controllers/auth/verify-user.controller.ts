//server/src/controllers/auth/verify-user.controller.ts

import { Request, Response } from "express";
import { verifyToken } from "../../utils";
import { UserModel } from "../../models";

export const verifyUserController = async (req: Request, res: Response) => {
  const token = String(req.query.token);

  try {
    const decodedToken = verifyToken(token) as { userId: string };

    if (!decodedToken || !decodedToken.userId) {
      res.status(400).send({ message: "Invalid token" });
      return;
    }

    const user = await UserModel.findById(decodedToken.userId);

    if (!user) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    const expirationTime = Date.now() + 24 * 60 * 60 * 1000;

    await UserModel.findByIdAndUpdate(
      decodedToken.userId,
      {
        isVerified: true,
        ttl: new Date(expirationTime),
      },
      { new: true }
    );

    // res.status(200).send({ message: "Successfully verified" });
    res.redirect(`${process.env.FRONTEND_ENDPOINT}/auth/sign-in`);
  } catch (error) {
    console.error("Verification error:", error);
    res.status(401).send({ message: "Invalid or expired token" });
  }
};
