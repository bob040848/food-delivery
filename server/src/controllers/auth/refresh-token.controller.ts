// server/src/controllers/auth/refresh-token.controller.ts

import { Request, Response } from "express";
import { UserModel } from "../../models";
import { verifyToken, generateNewToken } from "../../utils";

export const refreshTokenController = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).send({ message: "No token provided" });
    return;
  }

  try {
    const decodedToken = verifyToken(token) as { userId: string; role: string };

    if (!decodedToken || !decodedToken.userId) {
      res.status(401).send({ message: "Invalid token" });
      return;
    }

    const user = await UserModel.findById(decodedToken.userId);

    if (!user) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    if (!user.isVerified) {
      res.status(403).send({ message: "Email not verified" });
      return;
    }

    const now = new Date();
    if (user.ttl < now) {
      res.status(403).send({ message: "Account expired" });
      return;
    }

    const newToken = generateNewToken({
      userId: user._id,
      role: user.role,
    });

    res.status(200).send({
      message: "Token refreshed successfully",
      token: newToken,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).send({ message: "Invalid or expired token" });
  }
};
