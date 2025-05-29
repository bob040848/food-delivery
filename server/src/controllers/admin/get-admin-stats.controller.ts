import { Response } from "express";
import { UserModel } from "../../models";
import { AuthRequest } from "../../middlewares/auth";

export const getAdminStatsController = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const totalUsers = await UserModel.countDocuments({});
    const verifiedUsers = await UserModel.countDocuments({ isVerified: true });
    const adminUsers = await UserModel.countDocuments({ role: "Admin" });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsersThisWeek = await UserModel.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const usersWithOrders = await UserModel.find({}, { orderedFoods: 1 });
    const totalOrders = usersWithOrders.reduce((total, user) => {
      return total + (user.orderedFoods?.length || 0);
    }, 0);

    const now = new Date();
    const activeUsers = await UserModel.countDocuments({
      ttl: { $gt: now },
    });

    res.status(200).send({
      success: true,
      totalUsers,
      verifiedUsers,
      adminUsers,
      totalOrders,
      newUsersThisWeek,
      activeUsers,
      verificationRate:
        totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
      adminRate:
        totalUsers > 0 ? Math.round((adminUsers / totalUsers) * 100) : 0,
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch statistics",
    });
  }
};
