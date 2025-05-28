// client/src/components/UserNavigation.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  ShoppingBag,
  History,
  Heart,
  User,
  MapPin,
  CreditCard,
  Star,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const UserNavigation = () => {
  const { user } = useAuth();

  if (!user || user.role === "Admin") {
    return null;
  }

  const navigationItems = [
    {
      href: "/orders/",
      icon: History,
      label: "Orders",
      description: "View Your Orders",
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      href: "/food-categories",
      icon: History,
      label: "Main Menu",
      description: "View Categories",
      color: "bg-green-600 hover:bg-green-700",
    },
    // {
    //   href: "/orders/history",
    //   icon: History,
    //   label: "Order History",
    //   description: "View your past orders",
    //   color: "bg-gray-600 hover:bg-gray-700",
    // },
  ];

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6 rounded-lg">
      <div className="flex items-center mb-4">
        <ShoppingBag className="h-6 w-6 text-blue-600 mr-3" />
        <h3 className="text-xl font-semibold text-blue-900">Quick Actions</h3>
      </div>
      <p className="text-blue-700 text-sm mb-6">
        Welcome back! Here are your most used features for a great food delivery
        experience.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {navigationItems.slice(0, 4).map((item) => {
          const IconComponent = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 h-full">
                <div className="flex items-center mb-2">
                  <IconComponent className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-gray-900 text-sm">
                    {item.label}
                  </h4>
                </div>
                <p className="text-xs text-gray-600">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="border-t border-blue-200 pt-4">
        <h4 className="text-sm font-medium text-blue-900 mb-3">All Features</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs hover:bg-blue-100 border-blue-200"
                >
                  <IconComponent className="h-3 w-3 mr-1" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserNavigation;
