// client/src/components/FoodCategoriesCard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Tag, Loader2, ChevronRight, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useRouter } from "next/navigation";

type FoodCategory = {
  _id: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
};

const FoodCategoriesCard = () => {
  const { token } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/food-categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message: "An unknown error occurred"
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token]);

  const recentCategories = categories.slice(0, 5);

  const handleCategoryClick = (category: FoodCategory) => {
    router.push(
      `/admin/foods?categoryId=${
        category._id
      }&categoryName=${encodeURIComponent(category.categoryName)}`
    );
  };

  const handleViewAllFoods = () => {
    router.push("/admin/foods");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">
            Food Categories
          </CardTitle>
          <CardDescription>
            Manage your food categories ({categories.length} total)
          </CardDescription>
        </div>
        <Tag className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No categories found</p>
            <Link href="/admin/food-categories">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Category
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {categories.length}
                </div>
                <div className="text-blue-800">Total Categories</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {
                    categories.filter(
                      (cat) =>
                        new Date(cat.createdAt) >
                        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    ).length
                  }
                </div>
                <div className="text-green-800">This Week</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleViewAllFoods}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                View All Foods
              </Button>
              <Link href="/admin/foods/create" className="flex-1">
                <Button size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Food
                </Button>
              </Link>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Categories</h4>
                <Link href="/admin/food-categories">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                </Link>
              </div>

              <div className="space-y-1">
                {recentCategories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategoryClick(category)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border transition-colors group"
                  >
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 text-gray-400 mr-3" />
                      <div className="text-left">
                        <span className="font-medium text-gray-900 group-hover:text-blue-600">
                          {category.categoryName}
                        </span>
                        <div className="text-xs text-gray-500">
                          Created{" "}
                          {new Date(category.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                  </button>
                ))}

                {categories.length > 5 && (
                  <Link href="/admin/food-categories">
                    <button className="w-full flex items-center justify-center p-3 hover:bg-gray-50 rounded-lg border border-dashed text-gray-500 hover:text-gray-700 transition-colors">
                      <Plus className="h-4 w-4 mr-2" />
                      View {categories.length - 5} more categories
                    </button>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Link href="/admin/food-categories" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Manage Categories
                </Button>
              </Link>
              <Link href="/admin/food-categories">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FoodCategoriesCard;
