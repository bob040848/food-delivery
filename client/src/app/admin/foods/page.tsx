//client/src/app/admin/foods/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Search,
  Filter,
  Home,
  Settings,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
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
import { FoodGrid } from "@/components/FoodGrid";

type Food = {
  _id: string;
  foodName: string;
  price: number;
  image: string;
  ingredients: string;
  category: {
    _id: string;
    categoryName: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

type FoodCategory = {
  _id: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
};

const FoodsPage = () => {
  const { token, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const categoryName = searchParams.get("categoryName");

  const [foods, setFoods] = useState<Food[]>([]);
  const [allFoods, setAllFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryId || "all"
  );
  const [sortBy, setSortBy] = useState<string>("name");

  const fetchAllFoods = async () => {
    try {
      const response = await fetch("/api/foods", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch foods");
      }

      const data = await response.json();
      setAllFoods(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  };

  const fetchFoodsByCategory = async (catId: string) => {
    try {
      const response = await fetch(`/api/foods/category/${catId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch foods by category");
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  };

  const fetchCategories = async () => {
    try {
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
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;

      setLoading(true);
      await fetchCategories();

      if (categoryId && categoryId !== "all") {
        const categoryFoods = await fetchFoodsByCategory(categoryId);
        setAllFoods(categoryFoods);
      } else {
        const allFoodsData = await fetchAllFoods();
        setAllFoods(allFoodsData);
      }

      setLoading(false);
    };

    loadData();
  }, [token, categoryId]);

  useEffect(() => {
    let filteredFoods = [...allFoods];

    if (selectedCategory && selectedCategory !== "all" && !categoryId) {
      filteredFoods = filteredFoods.filter((food) =>
        food.category.some((cat) => cat._id === selectedCategory)
      );
    }

    if (searchTerm) {
      filteredFoods = filteredFoods.filter(
        (food) =>
          food.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          food.ingredients.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filteredFoods.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.foodName.localeCompare(b.foodName);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    setFoods(filteredFoods);
  }, [allFoods, selectedCategory, searchTerm, sortBy, categoryId]);

  const handleCategoryChange = async (newCategoryId: string) => {
    setSelectedCategory(newCategoryId);

    if (newCategoryId === "all") {
      router.push("/admin/foods");
    } else {
      const category = categories.find((cat) => cat._id === newCategoryId);
      if (category) {
        router.push(
          `/admin/foods?categoryId=${newCategoryId}&categoryName=${encodeURIComponent(
            category.categoryName
          )}`
        );
      }
    }
  };

  const handleEditFood = (food: Food) => {
    router.push(`/admin/foods/edit/${food._id}`);
  };

  const handleDeleteFood = async (food: Food) => {
    if (!confirm(`Are you sure you want to delete "${food.foodName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/foods/${food._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete food");
      }

      if (categoryId && categoryId !== "all") {
        const categoryFoods = await fetchFoodsByCategory(categoryId);
        setAllFoods(categoryFoods);
      } else {
        const allFoodsData = await fetchAllFoods();
        setAllFoods(allFoodsData);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!token) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert>
          <AlertDescription>Please log in to view foods.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (user?.role !== "Admin") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Suspense>
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
                  <span className="text-gray-900 font-medium">
                    {categoryName ? `${categoryName} Foods` : "All Foods"}
                  </span>
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">
                {categoryName ? `${categoryName} Foods` : "All Foods"}
              </h1>
              <p className="text-gray-600 mt-2">
                {categoryName
                  ? `Browse foods in the ${categoryName} category`
                  : "Browse all available foods"}
              </p>
            </div>
            <Button onClick={() => router.push("/admin/foods/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Food
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
                    placeholder="Search foods..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {!categoryId && (
                  <Select
                    value={selectedCategory}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center justify-center bg-gray-50 rounded-md px-3 py-2">
                  <span className="text-sm text-gray-600">
                    {foods.length} food{foods.length !== 1 ? "s" : ""} found
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span>Loading foods...</span>
            </div>
          ) : (
            <FoodGrid
              foods={foods}
              onEdit={handleEditFood}
              onDelete={handleDeleteFood}
              showActions={true}
              emptyMessage={
                searchTerm
                  ? `No foods found matching "${searchTerm}"`
                  : categoryName
                  ? `No foods found in the ${categoryName} category`
                  : "No foods available"
              }
            />
          )}
        </div>
      </div>
    </Suspense>
  );
};

export default FoodsPage;
