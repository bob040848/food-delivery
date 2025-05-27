// client/src/app/admin/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Shield,
  TrendingUp,
  Search,
  UserCheck,
  UserX,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import FoodCategoriesCard from "@/components/FoodCategoriesCard";
import NavigationBar from "@/components/NavigationBar";

type User = {
  _id: string;
  email: string;
  role: "User" | "Admin";
  isVerified: boolean;
  orderedFoods: string[];
  createdAt: string;
  ttl: string;
  phoneNumber: string;
  address: string;
};

type DashboardStats = {
  totalUsers: number;
  verifiedUsers: number;
  adminUsers: number;
  totalOrders: number;
  newUsersThisWeek: number;
};

const AdminDashboard = () => {
  const router = useRouter();
  const {
    user: currentUser,
    token,
    logout,
    isLoading: authLoading,
  } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && token) {
      fetchUsers();
      fetchStats();
    }
  }, [authLoading, token]);

  const fetchUsers = async () => {
    if (!token) {
      console.log("No token available for fetching users");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Fetching users with token:", token ? "present" : "missing");

      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Users API response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          console.log("Unauthorized - logging out");
          logout();
          return;
        }
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      console.log("Users data received:", data);
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!token) {
      console.log("No token available for fetching stats");
      return;
    }

    try {
      console.log("Fetching stats with token:", token ? "present" : "missing");

      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Stats API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Stats data received:", data);
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "verified" && user.isVerified) ||
      (selectedFilter === "unverified" && !user.isVerified) ||
      (selectedFilter === "admin" && user.role === "Admin");
    return matchesSearch && matchesFilter;
  });

  const handlePromoteUser = async (userId: string) => {
    if (!token) return;

    setIsUpdating(userId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/auth/promote-to-admin/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to promote user");
      }

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, role: "Admin" as const } : user
        )
      );
      setSuccess("User promoted to admin successfully");
      fetchStats();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDemoteUser = async (userId: string) => {
    if (!token) return;

    setIsUpdating(userId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/auth/demote-to-user/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to demote user");
      }

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, role: "User" as const } : user
        )
      );
      setSuccess("User demoted to regular user successfully");
      fetchStats();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsUpdating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleRefreshData = () => {
    if (token) {
      fetchUsers();
      fetchStats();
    }
  };

  const navigateToFoodCategories = () => {
    router.push("/admin/food-categories");
  };

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Adminstrator's Section
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage users, orders, and system settings
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={navigateToFoodCategories}
                  variant="outline"
                  className="flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Food Categories
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <span className="text-gray-700">
                  Welcome, {currentUser?.email}
                </span>
                <Button variant="outline" onClick={logout}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {(success || error) && (
            <div className="mb-6">
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalUsers?.toLocaleString() ||
                      users.length.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Verified Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.verifiedUsers?.toLocaleString() ||
                      users.filter((u) => u.isVerified).length.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Admin Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.adminUsers?.toLocaleString() ||
                      users
                        .filter((u) => u.role === "Admin")
                        .length.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    New Users (7d)
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.newUsersThisWeek?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <FoodCategoriesCard />

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Common administrative tasks
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {users.length > 0
                        ? Math.round(
                            (users.filter((u) => u.isVerified).length /
                              users.length) *
                              100
                          )
                        : 0}
                      %
                    </div>
                    <div className="text-blue-800 text-sm">
                      Verification Rate
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {users.length > 0
                        ? Math.round(
                            (users.filter((u) => u.role === "Admin").length /
                              users.length) *
                              100
                          )
                        : 0}
                      %
                    </div>
                    <div className="text-purple-800 text-sm">Admin Ratio</div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button
                    onClick={handleRefreshData}
                    disabled={isLoading || !token}
                    className="w-full"
                    variant="outline"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      "Refresh All Data"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                User Management
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                View and manage all registered users
              </p>
            </div>

            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="verified">Verified Only</option>
                  <option value="unverified">Unverified Only</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading users...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.email}
                              </div>
                              {user.phoneNumber && (
                                <div className="text-sm text-gray-500">
                                  {user.phoneNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === "Admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role === "Admin" && (
                              <Shield className="h-3 w-3 mr-1" />
                            )}
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.isVerified
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.isVerified ? (
                              <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Verified
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Unverified
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.orderedFoods?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {user.role === "User" ? (
                              <button
                                onClick={() => handlePromoteUser(user._id)}
                                disabled={isUpdating === user._id}
                                className="text-green-600 hover:text-green-900 p-1 rounded disabled:opacity-50 flex items-center"
                                title="Promote to Admin"
                              >
                                {isUpdating === user._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <UserCheck className="h-4 w-4" />
                                )}
                              </button>
                            ) : user.role === "Admin" &&
                              user._id !== currentUser?.id ? (
                              <button
                                onClick={() => handleDemoteUser(user._id)}
                                disabled={isUpdating === user._id}
                                className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50 flex items-center"
                                title="Demote to User"
                              >
                                {isUpdating === user._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <UserX className="h-4 w-4" />
                                )}
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!isLoading && filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No users found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm
                    ? "Try adjusting your search terms."
                    : "No users match the selected filter."}
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    Verification Rate
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {users.length > 0
                      ? Math.round(
                          (users.filter((u) => u.isVerified).length /
                            users.length) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Admin Ratio</span>
                  <span className="text-sm font-medium text-gray-900">
                    {users.length > 0
                      ? Math.round(
                          (users.filter((u) => u.role === "Admin").length /
                            users.length) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Active Users</span>
                  <span className="text-sm font-medium text-gray-900">
                    {users.filter((u) => new Date(u.ttl) > new Date()).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                User Distribution
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Regular Users</span>
                  <span className="text-sm font-medium text-gray-900">
                    {users.filter((u) => u.role === "User").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Administrators</span>
                  <span className="text-sm font-medium text-gray-900">
                    {users.filter((u) => u.role === "Admin").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Unverified</span>
                  <span className="text-sm font-medium text-gray-900">
                    {users.filter((u) => !u.isVerified).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                System Health
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Orders</span>
                  <span className="text-sm font-medium text-gray-900">
                    {users.reduce(
                      (acc, user) => acc + (user.orderedFoods?.length || 0),
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Avg Orders/User</span>
                  <span className="text-sm font-medium text-gray-900">
                    {users.length > 0
                      ? (
                          users.reduce(
                            (acc, user) =>
                              acc + (user.orderedFoods?.length || 0),
                            0
                          ) / users.length
                        ).toFixed(1)
                      : "0"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Platform Status</span>
                  <span className="text-sm font-medium text-green-600">
                    ✓ Operational
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
