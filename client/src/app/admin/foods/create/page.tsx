//client/src/app/admin/foods/create/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Home, Settings, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FoodCategory = {
  _id: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  foodName: string;
  price: string;
  image: string;
  ingredients: string;
  category: string;
};

type FormErrors = {
  foodName?: string;
  price?: string;
  image?: string;
  ingredients?: string;
  category?: string;
};

type ApiError = {
  message: string;
} & Error;

const CreateFoodPage = () => {
  const { token, user } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    foodName: "",
    price: "",
    image: "",
    ingredients: "",
    category: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
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
      const error = err as ApiError;
      setError(error.message);
    } finally {
      setCategoriesLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token, fetchCategories]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));

    if (formErrors.category) {
      setFormErrors((prev) => ({
        ...prev,
        category: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.foodName.trim()) {
      errors.foodName = "Food name is required";
    }

    if (!formData.price.trim()) {
      errors.price = "Price is required";
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = "Price must be a valid positive number";
    }

    if (!formData.image.trim()) {
      errors.image = "Image URL is required";
    }

    if (!formData.ingredients.trim()) {
      errors.ingredients = "Ingredients are required";
    }

    if (!formData.category) {
      errors.category = "Category must be selected";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/foods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          foodName: formData.foodName.trim(),
          price: parseFloat(formData.price),
          image: formData.image.trim(),
          ingredients: formData.ingredients.trim(),
          category: formData.category,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create food");
      }

      setSuccess("Food created successfully!");

      setTimeout(() => {
        router.push("/admin/foods");
      }, 1500);
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
  };

  if (!token) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert>
          <AlertDescription>Please log in to create foods.</AlertDescription>
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
            You don&apos;t have permission to access this page.
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
                <span className="text-gray-900 font-medium">Create</span>
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
          <h1 className="text-3xl font-bold">Create New Food</h1>
          <p className="text-gray-600 mt-2">Add a new food item to your menu</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Food Details</CardTitle>
                  <CardDescription>
                    Enter the basic information about the food item
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="foodName">Food Name *</Label>
                    <Input
                      id="foodName"
                      name="foodName"
                      value={formData.foodName}
                      onChange={handleInputChange}
                      placeholder="Enter food name"
                      className={formErrors.foodName ? "border-red-500" : ""}
                    />
                    {formErrors.foodName && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.foodName}
                      </p>
                    )}
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
                      className={formErrors.price ? "border-red-500" : ""}
                    />
                    {formErrors.price && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="image">Image URL *</Label>
                    <Input
                      id="image"
                      name="image"
                      type="url"
                      value={formData.image}
                      onChange={handleImageUrlChange}
                      placeholder="https://example.com/image.jpg"
                      className={formErrors.image ? "border-red-500" : ""}
                    />
                    {formErrors.image && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.image}
                      </p>
                    )}
                    {formData.image && (
                      <div className="mt-2">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-32 h-24 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="ingredients">Ingredients *</Label>
                    <Textarea
                      id="ingredients"
                      name="ingredients"
                      value={formData.ingredients}
                      onChange={handleInputChange}
                      placeholder="List all ingredients..."
                      rows={4}
                      className={formErrors.ingredients ? "border-red-500" : ""}
                    />
                    {formErrors.ingredients && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.ingredients}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Category *</CardTitle>
                  <CardDescription>
                    Select a category for this food
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {categoriesLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-2">No categories found</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/admin/food-categories")}
                      >
                        Create Categories
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Select
                        value={formData.category}
                        onValueChange={handleCategoryChange}
                      >
                        <SelectTrigger
                          className={
                            formErrors.category ? "border-red-500" : ""
                          }
                        >
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
                      {formErrors.category && (
                        <p className="text-red-500 text-sm mt-2">
                          {formErrors.category}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="mt-6 space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || categoriesLoading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Food
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/admin/foods")}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFoodPage;