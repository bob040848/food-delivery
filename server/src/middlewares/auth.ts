// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils";
import { UserModel } from "../models";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
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

    req.user = {
      userId: decodedToken.userId,
      role: decodedToken.role,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).send({ message: "Invalid or expired token" });
  }
};

export const authorizeAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    res.status(401).send({ message: "Authentication required" });
    return;
  }

  if (req.user.role !== "Admin") {
    res.status(403).send({ message: "Admin access required" });
    return;
  }

  next();
};
