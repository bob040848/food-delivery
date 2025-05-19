//server/src/controllers/auth/signin.controller.ts
import { Request, Response } from "express";
import { UserModel } from "../../models";
import { decryptHash, generateNewToken } from "../../utils";

type SignInBody = {
  email: string;
  password: string;
};

export const signinController = async (req: Request, res: Response) => {
  const { email, password } = req.body as SignInBody;

  if (!email || !password) {
    res.status(400).send({ message: "Email and password are required" });
    return;
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      res.status(401).send({ message: "Invalid email or password" });
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

    const isPasswordValid = decryptHash(password, user.password);
    if (!isPasswordValid) {
      res.status(401).send({ message: "Incorrect Password" });
      return;
    }

    const token = generateNewToken({
      userId: user._id,
      role: user.role,
    });

    res.status(200).send({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        role: user.role,
        id: user._id,
      },
    });
  } catch (error) {
    console.error("Sign-in error:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};
