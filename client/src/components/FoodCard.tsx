// client/src/components/FoodCard.tsx
"use client";

import React, { useState } from "react";
import { Edit, Trash2, DollarSign, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

type FoodCardProps = {
  food: Food;
  onEdit?: (food: Food) => void;
  onDelete?: (food: Food) => void;
  showActions?: boolean;
};

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(food);
    } finally {
      setIsDeleting(false);
    }
  };

  const fallbackImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-family='Arial, sans-serif' font-size='14'%3E${encodeURIComponent(
    food.foodName
  )}%3C/text%3E%3C/svg%3E`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <div className="aspect-video relative overflow-hidden bg-gray-100">
        <img
          src={imageError ? fallbackImage : food.image}
          alt={food.foodName}
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
          onError={handleImageError}
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
            ${food.price.toFixed(2)}
          </Badge>
        </div>
        {imageError && (
          <div className="absolute top-2 left-2">
            <Badge
              variant="outline"
              className="bg-yellow-50 text-yellow-700 border-yellow-200"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              No Image
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2" title={food.foodName}>
            {food.foodName}
          </CardTitle>
          {showActions && (
            <div className="flex gap-1 ml-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(food)}
                  className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                  title="Edit food"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                      title="Delete food"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Food Item</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{food.foodName}"? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="text-xl font-bold text-green-600">
            {food.price.toFixed(2)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <CardDescription className="line-clamp-3" title={food.ingredients}>
          <strong>Ingredients:</strong> {food.ingredients}
        </CardDescription>

        {food.category && food.category.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {food.category.slice(0, 3).map((cat) => (
              <Badge key={cat._id} variant="outline" className="text-xs">
                {cat.categoryName}
              </Badge>
            ))}
            {food.category.length > 3 && (
              <Badge variant="outline" className="text-xs text-gray-500">
                +{food.category.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t">
          <span>Added: {new Date(food.createdAt).toLocaleDateString()}</span>
          {food.updatedAt !== food.createdAt && (
            <span>
              Updated: {new Date(food.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
