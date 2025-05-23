// client/src/components/AdminNavigation.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminNavigation = () => {
  const { user } = useAuth();

  if (!user || user.role !== "Admin") {
    return null;
  }

  return (
    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-6">
      <div className="flex items-center mb-3">
        <Shield className="h-5 w-5 text-purple-600 mr-2" />
        <h3 className="text-lg font-medium text-purple-900">
          Administrator Panel
        </h3>
      </div>
      <p className="text-purple-700 text-sm mb-4">
        You have administrative privileges. Access additional management tools
        below.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/dashboard">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Users className="h-4 w-4 mr-2" />
            User Management
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AdminNavigation;
