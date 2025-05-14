import { Router } from "express";
import { signupController, verifyUserController } from "../controllers";

export const authRouter = Router();

authRouter.post("/sign-up", signupController);
authRouter.get("/verify-user", verifyUserController);
// authRouter.post("/sign-in", signupController)
