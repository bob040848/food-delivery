//clienet/src/components/FoodGrid.tsx
"use client";

import React from "react";
import { FoodCard } from "./FoodCard";

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

type FoodGridProps = {
  foods: Food[];
  onEdit?: (food: Food) => void;
  onDelete?: (food: Food) => void;
  showActions?: boolean;
  emptyMessage?: string;
};

export const FoodGrid: React.FC<FoodGridProps> = ({
  foods,
  onEdit,
  onDelete,
  showActions = true,
  emptyMessage = "No food items found",
}) => {
  if (foods.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🍽️</div>
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {foods.map((food) => (
        <FoodCard
          key={food._id}
          food={food}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions={showActions}
        />
      ))}
    </div>
  );
};
