// client/src/components/OrderCard.tsx
"use client";

import React, { useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  DollarSign,
  Package,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  userOrderNumber?: number; // New field for user-specific order number
};

type OrderCardProps = {
  order: FoodOrder;
  onStatusUpdate?: (orderId: string, newStatus: string) => Promise<void>;
  showActions?: boolean;
  userOrderNumber?: number; // Pass this from parent component
};

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onStatusUpdate,
  showActions = true,
  userOrderNumber,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4" />;
      case "Delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "Canceled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "Canceled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!onStatusUpdate) return;

    setIsUpdating(true);
    try {
      await onStatusUpdate(order._id, newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Helper function to get user email safely
  const getUserEmail = () => {
    if (!order.user) return "Unknown User";
    return order.user.email || "Unknown User";
  };

  // Get the display order number - prefer passed userOrderNumber, fallback to order's userOrderNumber
  const getDisplayOrderNumber = () => {
    const orderNum = userOrderNumber || order.userOrderNumber;
    return orderNum ? `#${orderNum}` : `#${order._id.slice(-8)}`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              Order {getDisplayOrderNumber()}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {getUserEmail()}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={`flex items-center gap-1 ${getStatusColor(
              order.status
            )}`}
          >
            {getStatusIcon(order.status)}
            {order.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Ordered: {formatDate(order.createdAt)}</span>
            </div>
            {order.updatedAt !== order.createdAt && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Updated: {formatDate(order.updatedAt)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-xl font-bold text-green-600">
              ${order.totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Order Items ({order.foodOrderItems.length})
          </h4>
          <div className="space-y-2">
            {order.foodOrderItems.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md"
              >
                <div className="flex-1">
                  <span className="font-medium">{item.food.foodName}</span>
                  <span className="text-gray-600 ml-2">x{item.quantity}</span>
                </div>
                <span className="font-medium">
                  ${(item.food.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {showActions && onStatusUpdate && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Update Status:</span>
              <Select
                value={order.status}
                onValueChange={handleStatusChange}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isUpdating && (
              <div className="text-sm text-gray-500 mt-2">Updating...</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
