//client/src/app/admin/food-categories/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Home,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CategorySchema = Yup.object().shape({
  categoryName: Yup.string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must be less than 50 characters")
    .required("Category name is required"),
});

type FoodCategory = {
  _id: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
};

const FoodCategories = () => {
  const { user, token } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | null>(
    null
  );

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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token]);

  const createFormik = useFormik({
    initialValues: {
      categoryName: "",
    },
    validationSchema: CategorySchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await fetch("/api/food-categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to create category");
        }

        setSuccess("Category created successfully");
        resetForm();
        setShowCreateDialog(false);
        fetchCategories();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const editFormik = useFormik({
    initialValues: {
      categoryName: selectedCategory?.categoryName || "",
    },
    enableReinitialize: true,
    validationSchema: CategorySchema,
    onSubmit: async (values) => {
      if (!selectedCategory) return;

      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await fetch(
          `/api/food-categories/${selectedCategory._id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(values),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to update category");
        }

        setSuccess("Category updated successfully");
        setShowEditDialog(false);
        setSelectedCategory(null);
        fetchCategories();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleDelete = async () => {
    if (!selectedCategory) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/food-categories/${selectedCategory._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete category");
      }

      setSuccess("Category deleted successfully");
      setShowDeleteDialog(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

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
                  Food Categories
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

      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Food Categories</h1>
            <p className="text-gray-600 mt-2">Manage your food categories</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              {categories.length} categories found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No categories found. Create your first category!
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="font-medium">{category.categoryName}</h3>
                      <p className="text-sm text-gray-500">
                        Created:{" "}
                        {new Date(category.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new food category to organize your items.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createFormik.handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="categoryName" className="text-sm font-medium">
                    Category Name
                  </label>
                  <Input
                    id="categoryName"
                    placeholder="Enter category name"
                    {...createFormik.getFieldProps("categoryName")}
                    className={
                      createFormik.touched.categoryName &&
                      createFormik.errors.categoryName
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {createFormik.touched.categoryName &&
                    createFormik.errors.categoryName && (
                      <p className="text-sm text-red-500">
                        {createFormik.errors.categoryName}
                      </p>
                    )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Category"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update the category information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={editFormik.handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label
                    htmlFor="editCategoryName"
                    className="text-sm font-medium"
                  >
                    Category Name
                  </label>
                  <Input
                    id="editCategoryName"
                    placeholder="Enter category name"
                    {...editFormik.getFieldProps("categoryName")}
                    className={
                      editFormik.touched.categoryName &&
                      editFormik.errors.categoryName
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {editFormik.touched.categoryName &&
                    editFormik.errors.categoryName && (
                      <p className="text-sm text-red-500">
                        {editFormik.errors.categoryName}
                      </p>
                    )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Category"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "
                {selectedCategory?.categoryName}
                "? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Category"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FoodCategories;
