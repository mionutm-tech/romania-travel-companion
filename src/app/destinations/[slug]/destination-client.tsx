"use client";

import { useState } from "react";
import { CategoryFilter } from "@/components/shared/category-filter";
import { POICard } from "@/components/cards/poi-card";
import type { POIWithRelations, POICategory } from "@/types/database";

export function DestinationMapFilter({
  pois,
  categories,
}: {
  pois: POIWithRelations[];
  categories: POICategory[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = selectedCategory
    ? pois.filter((p) => p.category?.slug === selectedCategory)
    : pois;

  return (
    <>
      <div className="mb-8">
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((poi) => (
          <POICard key={poi.id} poi={poi} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center py-12 text-muted-foreground">
          No places found for this category.
        </p>
      )}
    </>
  );
}
