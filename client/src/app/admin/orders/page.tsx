// client/src/app/admin/orders/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Search,
  Filter,
  Home,
  Settings,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderCard } from "@/components/OrderCard";
import { useApi, useApiClient } from "@/lib/api-client";

type FoodOrderItem = {
  food: {
    _id: string;
    foodName: string;
    price: number;
  };
  quantity: number;
};

type FoodOrder = {
  _id: string;
  user: {
    _id: string;
    email: string;
  };
  totalPrice: number;
  foodOrderItems: FoodOrderItem[];
  status: "Pending" | "Canceled" | "Delivered";
  createdAt: string;
  updatedAt: string;
  userOrderNumber?: number;
};

type User = {
  _id: string;
  email: string;
  name?: string;
};

const OrdersPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const apiClient = useApiClient();

  const [filteredOrders, setFilteredOrders] = useState<FoodOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [usersCache, setUsersCache] = useState<Record<string, User>>({});
  const [userOrderNumbers, setUserOrderNumbers] = useState<
    Record<string, Record<string, number>>
  >({});

  const {
    data: orders,
    loading,
    error,
    refetch,
  } = useApi<FoodOrder[]>("/food-orders");

  const calculateUserOrderNumbers = (ordersList: FoodOrder[]) => {
    const userOrderMap: Record<string, Record<string, number>> = {};

    const ordersByUser: Record<string, FoodOrder[]> = {};

    ordersList.forEach((order) => {
      const userId = order.user?._id;
      if (userId) {
        if (!ordersByUser[userId]) {
          ordersByUser[userId] = [];
        }
        ordersByUser[userId].push(order);
      }
    });

    Object.entries(ordersByUser).forEach(([userId, userOrders]) => {
      const sortedOrders = [...userOrders].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      userOrderMap[userId] = {};
      sortedOrders.forEach((order, index) => {
        userOrderMap[userId][order._id] = index + 1;
      });
    });

    return userOrderMap;
  };

  useEffect(() => {
    if (orders) {
      const orderNumbers = calculateUserOrderNumbers(orders);
      setUserOrderNumbers(orderNumbers);
    }
  }, [orders]);

  useEffect(() => {
    const fetchMissingUserData = async () => {
      if (!orders) return;

      const userIdsToFetch: string[] = [];

      orders.forEach((order) => {
        if (order.user && order.user._id) {
          const userId = order.user._id;
          if (!order.user.email && !usersCache[userId]) {
            userIdsToFetch.push(userId);
          }
        }
      });

      if (userIdsToFetch.length === 0) return;

      try {
        const userPromises = userIdsToFetch.map((userId) =>
          apiClient.get<User>(`/users/${userId}`).catch(() => null)
        );

        const users = await Promise.all(userPromises);
        const newCache = { ...usersCache };

        users.forEach((user, index) => {
          if (user) {
            newCache[userIdsToFetch[index]] = user;
          }
        });

        setUsersCache(newCache);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchMissingUserData();
  }, [orders, usersCache, apiClient]);

  const enhancedOrders = React.useMemo(() => {
    if (!orders) return [];

    return orders.map((order) => {
      if (order.user && !order.user.email) {
        const userId = order.user._id;
        const cachedUser = usersCache[userId];

        if (cachedUser) {
          return {
            ...order,
            user: {
              _id: userId,
              email: cachedUser.email,
            },
          };
        }
      }
      return order;
    });
  }, [orders, usersCache]);

  useEffect(() => {
    let filtered = [...enhancedOrders];

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter((order) => {
        const userId = order.user?._id;
        const userOrderNumber =
          userId && userOrderNumbers[userId]
            ? userOrderNumbers[userId][order._id]
            : null;

        return (
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.foodOrderItems.some((item) =>
            item.food.foodName.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          (userOrderNumber && userOrderNumber.toString().includes(searchTerm))
        );
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "price-high":
          return b.totalPrice - a.totalPrice;
        case "price-low":
          return a.totalPrice - b.totalPrice;
        case "status":
          return a.status.localeCompare(b.status);
        case "order-number":
          const aUserId = a.user?._id;
          const bUserId = b.user?._id;
          const aOrderNum =
            aUserId && userOrderNumbers[aUserId]
              ? userOrderNumbers[aUserId][a._id]
              : 0;
          const bOrderNum =
            bUserId && userOrderNumbers[bUserId]
              ? userOrderNumbers[bUserId][b._id]
              : 0;
          return aOrderNum - bOrderNum;
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  }, [enhancedOrders, statusFilter, searchTerm, sortBy, userOrderNumbers]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/food-orders/${orderId}`, {
        status: newStatus,
      });
      await refetch();
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  };

  const getOrderStats = () => {
    if (!enhancedOrders)
      return {
        total: 0,
        pending: 0,
        delivered: 0,
        canceled: 0,
        totalRevenue: 0,
      };

    return {
      total: enhancedOrders.length,
      pending: enhancedOrders.filter((o) => o.status === "Pending").length,
      delivered: enhancedOrders.filter((o) => o.status === "Delivered").length,
      canceled: enhancedOrders.filter((o) => o.status === "Canceled").length,
      totalRevenue: enhancedOrders
        .filter((o) => o.status === "Delivered")
        .reduce((sum, order) => sum + order.totalPrice, 0),
    };
  };

  const stats = getOrderStats();

  if (user?.role !== "Admin") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don&apos;t have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Dashboard
              </button>
              <div className="hidden sm:flex items-center space-x-1 text-sm text-gray-500">
                <button
                  onClick={() => router.push("/admin/dashboard")}
                  className="hover:text-gray-700"
                >
                  <Home className="h-4 w-4" />
                </button>
                <span>/</span>
                <span className="text-gray-900 font-medium">Orders</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.email}
                </span>
              </div>
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <Settings className="h-4 w-4 mr-1" />
                Admin
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Food Orders</h1>
          <p className="text-gray-600 mt-2">Manage and track all food orders</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold">{stats.delivered}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Canceled</p>
                  <p className="text-2xl font-bold">{stats.canceled}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold">
                    ${stats.totalRevenue.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders, users, items, or order numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="order-number">Order Number</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center justify-center bg-gray-50 rounded-md px-3 py-2">
                <span className="text-sm text-gray-600">
                  {filteredOrders.length} order
                  {filteredOrders.length !== 1 ? "s" : ""} found
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span>Loading orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters to see more orders."
                  : "No orders have been placed yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => {
              const userId = order.user?._id;
              const userOrderNumber =
                userId && userOrderNumbers[userId]
                  ? userOrderNumbers[userId][order._id]
                  : undefined;

              return (
                <OrderCard
                  key={order._id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                  showActions={true}
                  userOrderNumber={userOrderNumber}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
