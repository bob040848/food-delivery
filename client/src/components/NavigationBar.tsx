// client/src/components/NavigationBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Shield, User} from "lucide-react";
import { Button } from "@/components/ui/button";

const NavigationBar = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) {
    return null;
  }

  const isAdmin = user.role === "Admin";
  const isOnAdminDashboard = pathname.startsWith("/admin");
  const isOnRegularDashboard = pathname === "/dashboard";

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-1">
            <Link href="/dashboard">
              <Button
                variant={isOnRegularDashboard ? "default" : "ghost"}
                size="sm"
                className={`flex items-center ${
                  isOnRegularDashboard
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>

            {isAdmin && (
              <Link href="/admin/dashboard">
                <Button
                  variant={isOnAdminDashboard ? "default" : "ghost"}
                  size="sm"
                  className={`flex items-center ${
                    isOnAdminDashboard
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                isAdmin
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {isAdmin ? (
                <>
                  <Shield className="h-3 w-3 mr-1" />
                  Administrator
                </>
              ) : (
                <>
                  <User className="h-3 w-3 mr-1" />
                  User
                </>
              )}
            </div>

            <div className="text-sm text-gray-600 hidden sm:block">
              {isOnAdminDashboard ? "Admin View" : "User View"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
