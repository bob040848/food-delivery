import { Request, Response } from "express";
import { verifyToken } from "../../utils";
import { UserModel } from "../../models";

export const verifyUserController = async (req: Request, res: Response) => {
  const token = String(req.query.token);

  const decodedToken = verifyToken(token) as { userId: string };

  await UserModel.findByIdAndUpdate(decodedToken.userId, {
    isVerified: true,
    ttl: Date.now() + 10 * 365 * 24 * 60 * 60 * 1000,
  });

  // res.status(200).send({ message: "Successfully verified" });
  res.redirect(`${process.env.FRONTEND_ENDPOINT}/sign-in`);
};
