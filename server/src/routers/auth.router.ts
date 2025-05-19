//server/src/routers/auth.router.ts
import { Router } from "express";
import {
  signupController,
  verifyUserController,
  signinController,
  resetPasswordController,
  verifyResetPasswordRequestController,
  resetPasswordRequestController,
  refreshTokenController,
  promoteToAdminController,
} from "../controllers";
// import { authenticateUser, authorizeAdmin } from "../middlewares";

export const authRouter = Router();

authRouter.post("/sign-up", signupController);
authRouter.get("/verify-user", verifyUserController);
authRouter.post("/sign-in", signinController);
authRouter.patch(
  "/promote-to-admin/:userId",
  // authenticateUser,
  // authorizeAdmin,
  promoteToAdminController
);
authRouter.get("/refresh", refreshTokenController);
authRouter.post("/reset-password-request", resetPasswordRequestController);
authRouter.get(
  "/verify-reset-password-request",
  verifyResetPasswordRequestController
);
authRouter.post("/reset-password", resetPasswordController);
