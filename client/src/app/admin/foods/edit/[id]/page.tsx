//client/src/app/admin/foods/edit/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Save, X, Home, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const EditFoodPage = () => {
  const { token, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const foodId = params.id as string;

  const [food, setFood] = useState<Food | null>(null);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    foodName: "",
    price: "",
    image: "",
    ingredients: "",
    category: "",
  });

  const fetchFood = async () => {
    try {
      const response = await fetch(`/api/foods/${foodId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch food details");
      }

      const data = await response.json();
      console.log("Fetched food data:", data);
      return data;
    } catch (err: any) {
      console.error("Error fetching food:", err);
      setError(err.message);
      throw err;
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
      console.log("Fetched categories:", data);
      return data;
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!token || !foodId) {
        console.log("Missing token or foodId");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("Loading data for foodId:", foodId);
        const [foodData, categoriesData] = await Promise.all([
          fetchFood(),
          fetchCategories(),
        ]);

        setFood(foodData);
        setCategories(categoriesData);

        const firstCategoryId =
          foodData.category && foodData.category.length > 0
            ? foodData.category[0]._id
            : "";

        const newFormData = {
          foodName: foodData.foodName || "",
          price: foodData.price ? foodData.price.toString() : "",
          image: foodData.image || "",
          ingredients: foodData.ingredients || "",
          category: firstCategoryId,
        };

        console.log("Setting form data:", newFormData);
        setFormData(newFormData);
        console.log("Data loaded successfully");
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, foodId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log(`Form field changed: ${name} = ${value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    console.log("Category changed:", value);
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    console.log("Submitting form data:", formData);

    if (!formData.foodName.trim()) {
      setError("Food name is required");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Valid price is required");
      return;
    }

    if (!formData.image.trim()) {
      setError("Image URL is required");
      return;
    }

    if (!formData.ingredients.trim()) {
      setError("Ingredients are required");
      return;
    }

    if (!formData.category) {
      setError("Category is required");
      return;
    }

    setSaving(true);

    try {
      const requestBody = {
        foodName: formData.foodName.trim(),
        price: parseFloat(formData.price),
        image: formData.image.trim(),
        ingredients: formData.ingredients.trim(),
        category: formData.category,
      };

      console.log("Sending update request:", requestBody);

      const response = await fetch(`/api/foods/${foodId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update food");
      }

      const responseData = await response.json();
      console.log("Update successful:", responseData);

      setSuccess("Food updated successfully!");

      setTimeout(() => {
        router.push("/admin/foods");
      }, 1500);
    } catch (err: any) {
      console.error("Error updating food:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (
      confirm(
        "Are you sure you want to cancel? Any unsaved changes will be lost."
      )
    ) {
      router.push("/admin/foods");
    }
  };

  if (!token) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert>
          <AlertDescription>Please log in to edit foods.</AlertDescription>
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        <span>Loading food details...</span>
      </div>
    );
  }

  if (error && !food) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Error Loading Food</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Food Not Found</AlertTitle>
          <AlertDescription>
            The food item you're trying to edit doesn't exist.
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
                onClick={() => router.push("/admin/foods")}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Foods
              </button>
              <div className="hidden sm:flex items-center space-x-1 text-sm text-gray-500">
                <button
                  onClick={() => router.push("/admin/dashboard")}
                  className="hover:text-gray-700"
                >
                  <Home className="h-4 w-4" />
                </button>
                <span>/</span>
                <button
                  onClick={() => router.push("/admin/foods")}
                  className="hover:text-gray-700"
                >
                  Foods
                </button>
                <span>/</span>
                <span className="text-gray-900 font-medium">Edit Food</span>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Food</h1>
          <p className="text-gray-600 mt-2">
            Update the details for "{food.foodName}"
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Food Details</CardTitle>
            <CardDescription>
              Update the information for this food item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="foodName">Food Name *</Label>
                <Input
                  id="foodName"
                  name="foodName"
                  type="text"
                  value={formData.foodName}
                  onChange={handleInputChange}
                  placeholder="Enter food name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="image">Image URL *</Label>
                <Input
                  id="image"
                  name="image"
                  type="url"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image}
                      alt="Food preview"
                      className="w-32 h-32 object-cover rounded-md border"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ingredients">Ingredients *</Label>
                <Textarea
                  id="ingredients"
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  placeholder="List the ingredients..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Food
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditFoodPage;
