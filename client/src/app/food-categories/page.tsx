//client/src/app/food-categories/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Grid,
  List,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChefHat,
  Utensils,
  Plus,
  ShoppingCart,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import NavigationBar from "@/components/NavigationBar";
import { useAuth } from "@/contexts/AuthContext";
import { useApiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

type FoodCategory = {
  _id: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
};

type Food = {
  _id: string;
  foodName: string;
  price: number;
  image: string;
  ingredients: string;
  category: FoodCategory;
  createdAt: string;
  updatedAt: string;
};

const FoodCategoriesPage = () => {
  const { user } = useAuth();
  const apiClient = useApiClient();

  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high">(
    "name"
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [categoriesData, foodsData] = await Promise.all([
        apiClient.get<FoodCategory[]>("/food-categories"),
        apiClient.get<Food[]>("/foods"),
      ]);

      setCategories(categoriesData);
      setFoods(foodsData);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAndSortedFoods = foods
    .filter((food) => {
      const matchesSearch =
        food.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.ingredients.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || food.category._id === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.foodName.localeCompare(b.foodName);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        default:
          return 0;
      }
    });

  const getFoodCountByCategory = (categoryId: string) => {
    return foods.filter((food) => food.category._id === categoryId).length;
  };

  const FoodCard = ({ food }: { food: Food }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
      <div className="relative">
        <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
          {food.image ? (
            <img
              src={food.image}
              alt={food.foodName}
              className="w-full h-full object-cover"
            />
          ) : (
            <ChefHat className="h-12 w-12 text-orange-400" />
          )}
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-white/90 text-green-700">
            ${food.price.toFixed(2)}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{food.foodName}</CardTitle>
        <CardDescription className="line-clamp-2">
          {food.ingredients}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="text-xs">
            {food.category.categoryName}
          </Badge>
        </div>

        <div className="space-y-2">
          <Link href={`/foods/${food._id}`}>
            <Button variant="outline" className="w-full" size="sm">
              View Details
            </Button>
          </Link>
          <Button className="w-full" size="sm">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const FoodListItem = ({ food }: { food: Food }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
            {food.image ? (
              <img
                src={food.image}
                alt={food.foodName}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <ChefHat className="h-8 w-8 text-orange-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{food.foodName}</h3>
                <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                  {food.ingredients}
                </p>
                <Badge variant="outline" className="text-xs mt-2">
                  {food.category.categoryName}
                </Badge>
              </div>

              <div className="flex items-center space-x-3 ml-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ${food.price.toFixed(2)}
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <Link href={`/foods/${food._id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-50">
          <NavigationBar />
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span className="text-lg">Loading delicious food...</span>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <NavigationBar />

        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Utensils className="h-8 w-8 mr-3 text-orange-600" />
                  Browse Food Menu
                </h1>
                <p className="text-gray-600 mt-1">
                  Discover delicious food from various categories
                </p>
              </div>
              <Button onClick={fetchData} variant="outline" disabled={loading}>
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Categories Overview */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Food Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Card
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCategory === "all"
                      ? "ring-2 ring-orange-500 bg-orange-50"
                      : ""
                  }`}
                  onClick={() => setSelectedCategory("all")}
                >
                  <CardContent className="p-4 text-center">
                    <Utensils className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <div className="font-medium">All Foods</div>
                    <div className="text-sm text-gray-500">
                      {foods.length} items
                    </div>
                  </CardContent>
                </Card>

                {categories.map((category) => (
                  <Card
                    key={category._id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedCategory === category._id
                        ? "ring-2 ring-orange-500 bg-orange-50"
                        : ""
                    }`}
                    onClick={() => setSelectedCategory(category._id)}
                  >
                    <CardContent className="p-4 text-center">
                      <ChefHat className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <div className="font-medium line-clamp-1">
                        {category.categoryName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getFoodCountByCategory(category._id)} items
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Search and Filter Controls */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search food by name or ingredients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select
                    value={sortBy}
                    onValueChange={(value: any) => setSortBy(value)}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Sort by Name</SelectItem>
                      <SelectItem value="price-low">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price-high">
                        Price: High to Low
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Food Results */}
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {selectedCategory === "all"
                    ? "All Foods"
                    : categories.find((c) => c._id === selectedCategory)
                        ?.categoryName || "Foods"}
                </h2>
                <Badge variant="secondary">
                  {filteredAndSortedFoods.length}{" "}
                  {filteredAndSortedFoods.length === 1 ? "item" : "items"}
                </Badge>
              </div>
            </div>

            {filteredAndSortedFoods.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No food items found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || selectedCategory !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "No food items available at the moment."}
                  </p>
                  {(searchTerm || selectedCategory !== "all") && (
                    <Button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("all");
                      }}
                      variant="outline"
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                {filteredAndSortedFoods.map((food) =>
                  viewMode === "grid" ? (
                    <FoodCard key={food._id} food={food} />
                  ) : (
                    <FoodListItem key={food._id} food={food} />
                  )
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default FoodCategoriesPage;
