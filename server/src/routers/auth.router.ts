//server/src/routers/auth.router.ts
import { Router } from "express";
import {
  signupController,
  verifyUserController,
  signinController,
} from "../controllers";

export const authRouter = Router();

authRouter.post("/sign-up", signupController);
authRouter.get("/verify-user", verifyUserController);
authRouter.post("/sign-in", signinController);
// authRouter.post("/sign-in", signupController)
