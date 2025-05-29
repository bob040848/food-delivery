//client/src/app/foods/[id]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ChefHat,
  ShoppingCart,
  Plus,
  Minus,
  Star,
  Clock,
  Utensils,
  Loader2,
  AlertCircle,
  Heart,
  Share2,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import NavigationBar from "@/components/NavigationBar";
import { useApiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useParams } from "next/navigation";

type FoodCategory = {
  _id: string;
  categoryName: string;
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

const FoodDetailPage = () => {
  const apiClient = useApiClient();
  const params = useParams();
  const foodId = params.id as string;

  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const fetchFood = useCallback(async () => {
    if (!foodId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<Food>(`/foods/${foodId}`);
      setFood(data);
    } catch (err: unknown) {
      console.error("Error fetching food:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch food details";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [foodId, apiClient]);

  useEffect(() => {
    if (foodId) {
      fetchFood();
    }
  }, [foodId, fetchFood]);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!food) return;

    try {
      setAddingToCart(true);
      console.log(`Adding ${quantity} of ${food.foodName} to cart`);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert(`Added ${quantity} ${food.foodName} to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-50">
          <NavigationBar />
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span className="text-lg">Loading food details...</span>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !food) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-50">
          <NavigationBar />
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || "Food not found"}</AlertDescription>
            </Alert>
            <Link href="/food-categories">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Menu
              </Button>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <NavigationBar />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <Link href="/food-categories">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Menu
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Card className="overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    {food.image ? (
                      <img
                        src={food.image}
                        alt={food.foodName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ChefHat className="h-24 w-24 text-orange-400" />
                    )}
                  </div>
                </Card>

                <div className="flex space-x-3">
                  <Button variant="outline" className="flex-1">
                    <Heart className="h-4 w-4 mr-2" />
                    Save to Favorites
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="mb-2">
                      {food.category.categoryName}
                    </Badge>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <Star className="h-4 w-4 text-gray-300" />
                      <span className="ml-2 text-sm text-gray-600">(4.0)</span>
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {food.foodName}
                  </h1>

                  <div className="text-3xl font-bold text-green-600 mb-4">
                    ${food.price.toFixed(2)}
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Utensils className="h-5 w-5 mr-2 text-orange-600" />
                      Ingredients
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {food.ingredients}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <div className="font-medium">Prep Time</div>
                      <div className="text-sm text-gray-600">15-20 mins</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <ChefHat className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <div className="font-medium">Serving</div>
                      <div className="text-sm text-gray-600">1 person</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity
                        </label>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(-1)}
                            disabled={quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <span className="text-xl font-semibold px-4 py-2 border rounded-md min-w-[60px] text-center">
                            {quantity}
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(1)}
                            disabled={quantity >= 10}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-medium">Total:</span>
                          <span className="text-2xl font-bold text-green-600">
                            ${(food.price * quantity).toFixed(2)}
                          </span>
                        </div>

                        <Button
                          className="w-full"
                          size="lg"
                          onClick={handleAddToCart}
                          disabled={addingToCart}
                        >
                          {addingToCart ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Adding to Cart...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Add to Cart
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Free delivery on orders over $25. Estimated delivery time:
                    30-45 minutes.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default FoodDetailPage;