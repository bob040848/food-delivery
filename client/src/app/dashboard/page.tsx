//client/src/app/dashboard/page.tsx
"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminNavigation from "@/components/AdminNavigation";
import UserNavigation from "@/components/UserNavigation";
import NavigationBar from "@/components/NavigationBar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white shadow">
          <NavigationBar />
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role}'s Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.email}</span>
              <Button variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <AdminNavigation />
              <UserNavigation />
              <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                <p className="text-gray-500">
                  Your order history will appear here. Start browsing our
                  delicious meals!
                </p>

                <div className="mt-8">
                  <Button>Browse Restaurant Menu</Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
