import { Router } from "express";
import { getAdminStatsController, getAllUsersController } from "../controllers";
import { authenticateUser, authorizeAdmin } from "../middlewares";

export const adminRouter = Router();

adminRouter.use(authenticateUser);
adminRouter.use(authorizeAdmin);

adminRouter.get("/users", getAllUsersController);
adminRouter.get("/stats", getAdminStatsController);
